using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Web.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class SurveysController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public SurveysController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSurveys([FromQuery] Guid userId)
        {
            var now = DateTime.UtcNow;
            var surveys = await _context.Surveys
                .Include(s => s.Questions)
                .Where(s => s.Status == 1 && (s.EndsAt == null || s.EndsAt > now))
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = new List<object>();

            foreach (var s in surveys)
            {
                // Check if user has answered any question in this survey
                var questionIds = s.Questions.Select(q => q.Id).ToList();
                var hasSubmitted = await _context.SurveyResponses
                    .AnyAsync(r => r.UserId == userId && questionIds.Contains(r.QuestionId));

                result.Add(new {
                    id = s.Id,
                    title = s.Title,
                    description = s.Description,
                    endsAt = s.EndsAt,
                    hasSubmitted = hasSubmitted,
                    questions = s.Questions.OrderBy(q => q.SortOrder).Select(q => new {
                        id = q.Id,
                        questionText = q.QuestionText,
                        questionType = q.QuestionType,
                        isRequired = q.IsRequired,
                        options = !string.IsNullOrEmpty(q.Options) 
                            ? JsonSerializer.Deserialize<List<string>>(q.Options) 
                            : new List<string>()
                    })
                });
            }

            return Ok(result);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllSurveys()
        {
            var surveys = await _context.Surveys
                .Include(s => s.Creator)
                .Include(s => s.Questions)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = new List<object>();

            foreach (var s in surveys)
            {
                var questionIds = s.Questions.Select(q => q.Id).ToList();
                
                // Count unique users who submitted answers for this survey
                var respondentCount = await _context.SurveyResponses
                    .Where(r => questionIds.Contains(r.QuestionId))
                    .Select(r => r.UserId)
                    .Distinct()
                    .CountAsync();

                result.Add(new {
                    id = s.Id,
                    title = s.Title,
                    description = s.Description,
                    status = s.Status, // 0: Draft, 1: Active, 2: Closed
                    createdAt = s.CreatedAt,
                    endsAt = s.EndsAt,
                    questionCount = s.Questions.Count,
                    respondentCount = respondentCount,
                    creatorName = s.Creator != null ? s.Creator.FullName : "Ban Quản Trị"
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSurvey([FromBody] CreateSurveyModel model)
        {
            var survey = new Survey
            {
                Id = Guid.NewGuid(),
                CreatorId = model.CreatorId,
                Title = model.Title,
                Description = model.Description,
                Status = 0, // 0: Draft
                CreatedAt = DateTime.UtcNow,
                EndsAt = model.EndsAt
            };

            _context.Surveys.Add(survey);

            int order = 0;
            foreach (var q in model.Questions)
            {
                var question = new SurveyQuestion
                {
                    Id = Guid.NewGuid(),
                    SurveyId = survey.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    IsRequired = q.IsRequired,
                    SortOrder = order++,
                    Options = q.Options != null ? JsonSerializer.Serialize(q.Options) : null
                };
                _context.SurveyQuestions.Add(question);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã tạo khảo sát nháp thành công!", surveyId = survey.Id });
        }

        [HttpPost("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(Guid id, [FromQuery] int status)
        {
            var survey = await _context.Surveys.FindAsync(id);
            if (survey == null) return NotFound();

            survey.Status = status; // 0: Draft, 1: Active, 2: Closed
            _context.Surveys.Update(survey);
            await _context.SaveChangesAsync();

            if (status == 1)
            {
                try
                {
                    await _hubContext.Clients.All.SendAsync("ReceiveNewSurvey", new
                    {
                        id = survey.Id,
                        title = survey.Title,
                        description = survey.Description,
                        endsAt = survey.EndsAt
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR survey broadcast error: {ex.Message}");
                }
            }

            return Ok(new { success = true, message = "Cập nhật trạng thái khảo sát thành công!" });
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitResponse(Guid id, [FromBody] SubmitSurveyResponseModel model)
        {
            var survey = await _context.Surveys
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (survey == null) return NotFound(new { message = "Không tìm thấy khảo sát." });

            // Check if user already submitted
            var questionIds = survey.Questions.Select(q => q.Id).ToList();
            var hasSubmitted = await _context.SurveyResponses
                .AnyAsync(r => r.UserId == model.UserId && questionIds.Contains(r.QuestionId));

            if (hasSubmitted)
            {
                return BadRequest(new { success = false, message = "Bạn đã thực hiện cuộc khảo sát này trước đó rồi." });
            }

            foreach (var ans in model.Answers)
            {
                var response = new SurveyResponse
                {
                    Id = Guid.NewGuid(),
                    QuestionId = ans.QuestionId,
                    UserId = model.UserId,
                    Answer = ans.Answer,
                    CreatedAt = DateTime.UtcNow
                };
                _context.SurveyResponses.Add(response);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Gửi phản hồi khảo sát thành công! Cảm ơn bạn." });
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetSurveyStats(Guid id)
        {
            var survey = await _context.Surveys
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (survey == null) return NotFound();

            var stats = new List<object>();

            foreach (var q in survey.Questions.OrderBy(q => q.SortOrder))
            {
                var responses = await _context.SurveyResponses
                    .Where(r => r.QuestionId == q.Id)
                    .ToListAsync();

                if (q.QuestionType == "text")
                {
                    var textAnswers = responses
                        .Select(r => r.Answer)
                        .Where(a => !string.IsNullOrWhiteSpace(a))
                        .Take(25)
                        .ToList();

                    stats.Add(new {
                        questionId = q.Id,
                        questionText = q.QuestionText,
                        questionType = q.QuestionType,
                        totalReplies = responses.Count,
                        answers = textAnswers
                    });
                }
                else
                {
                    // For radio/checkbox, we count option selections
                    var options = !string.IsNullOrEmpty(q.Options)
                        ? (JsonSerializer.Deserialize<List<string>>(q.Options) ?? new List<string>())
                        : new List<string>();

                    var optionCounts = options.ToDictionary(opt => opt, opt => 0);

                    foreach (var resp in responses)
                    {
                        if (string.IsNullOrEmpty(resp.Answer)) continue;

                        // Checkbox responses might contain selected options separated by commas or in a JSON array
                        if (q.QuestionType == "checkbox")
                        {
                            try
                            {
                                var selectedOpts = JsonSerializer.Deserialize<List<string>>(resp.Answer);
                                if (selectedOpts != null)
                                {
                                    foreach (var sel in selectedOpts)
                                    {
                                        if (optionCounts.ContainsKey(sel))
                                        {
                                            optionCounts[sel]++;
                                        }
                                    }
                                }
                            }
                            catch
                            {
                                // Fallback to simple comma split if not JSON
                                var selectedOpts = resp.Answer.Split(',');
                                foreach (var sel in selectedOpts)
                                {
                                    var trimmed = sel.Trim();
                                    if (optionCounts.ContainsKey(trimmed))
                                    {
                                        optionCounts[trimmed]++;
                                    }
                                }
                            }
                        }
                        else // radio (SingleChoice)
                        {
                            if (optionCounts.ContainsKey(resp.Answer))
                            {
                                optionCounts[resp.Answer]++;
                            }
                        }
                    }

                    var chartData = optionCounts.Select(kvp => new {
                        name = kvp.Key,
                        value = kvp.Value
                    }).ToList();

                    stats.Add(new {
                        questionId = q.Id,
                        questionText = q.QuestionText,
                        questionType = q.QuestionType,
                        totalReplies = responses.Count,
                        chartData = chartData
                    });
                }
            }

            return Ok(new {
                surveyId = survey.Id,
                title = survey.Title,
                description = survey.Description,
                questionsCount = survey.Questions.Count,
                stats = stats
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSurvey(Guid id)
        {
            var survey = await _context.Surveys
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (survey == null) return NotFound();

            foreach (var q in survey.Questions)
            {
                var responses = await _context.SurveyResponses.Where(r => r.QuestionId == q.Id).ToListAsync();
                _context.SurveyResponses.RemoveRange(responses);
            }

            _context.SurveyQuestions.RemoveRange(survey.Questions);
            _context.Surveys.Remove(survey);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa khảo sát thành công!" });
        }
    }

    public class CreateSurveyModel
    {
        public Guid? CreatorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? EndsAt { get; set; }
        public List<CreateSurveyQuestionModel> Questions { get; set; } = new();
    }

    public class CreateSurveyQuestionModel
    {
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public List<string>? Options { get; set; }
        public bool IsRequired { get; set; } = true;
    }

    public class SubmitSurveyResponseModel
    {
        public Guid UserId { get; set; }
        public List<SubmitQuestionAnswerModel> Answers { get; set; } = new();
    }

    public class SubmitQuestionAnswerModel
    {
        public Guid QuestionId { get; set; }
        public string Answer { get; set; } = string.Empty;
    }
}
