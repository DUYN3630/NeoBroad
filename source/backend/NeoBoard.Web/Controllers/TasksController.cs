using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            var tickets = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Include(t => t.AssignedTechnician)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var result = tickets.Select(t => new {
                id = t.Id.ToString(),
                taskCode = $"TASK-{t.CreatedAt.Year}-{(t.CreatedAt.Ticks % 10000):0000}",
                title = t.Description.Contains(":") ? t.Description.Split(new[] { ':' }, 2)[0] : $"Bảo trì: {t.Asset.Name}",
                description = t.Description.Contains(":") ? t.Description.Split(new[] { ':' }, 2)[1] : t.Description,
                priority = t.Asset.Price > 10000000 ? "High" : "Normal",
                status = t.Status == "Assigned" ? "Pending" : (t.Status == "Completed" ? "Done" : "In Progress"),
                assignedTo = t.AssignedTechnician != null ? t.AssignedTechnician.FullName : "Chưa gán",
                dueDate = t.ScheduledDate,
                relatedAssetId = t.AssetId.ToString()
            });

            return Ok(result);
        }

        [HttpGet("MyTasks/{fullName}")]
        public async Task<IActionResult> GetMyTasks(string fullName)
        {
            var tickets = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Include(t => t.AssignedTechnician)
                .Where(t => t.AssignedTechnician != null && t.AssignedTechnician.FullName.ToLower().Trim() == fullName.ToLower().Trim() && t.Status != "Completed")
                .ToListAsync();

            var result = tickets.Select(t => new {
                id = t.Id.ToString(),
                title = t.Description.Contains(":") ? t.Description.Split(new[] { ':' }, 2)[0] : $"Bảo trì: {t.Asset.Name}",
                description = t.Description.Contains(":") ? t.Description.Split(new[] { ':' }, 2)[1] : t.Description,
                dueDate = t.ScheduledDate,
                priority = t.Asset.Price > 10000000 ? "High" : "Normal",
                status = t.Status == "Assigned" ? "Pending" : "In Progress"
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateWorkTaskModel model)
        {
            if (string.IsNullOrEmpty(model.RelatedAssetId))
            {
                return BadRequest(new { message = "Vui lòng chọn thiết bị liên quan để bảo trì/sửa chữa." });
            }

            if (!Guid.TryParse(model.RelatedAssetId, out Guid assetId))
            {
                return BadRequest(new { message = "Mã thiết bị không hợp lệ." });
            }

            var asset = await _context.Assets.FindAsync(assetId);
            if (asset == null)
            {
                return NotFound(new { message = "Không tìm thấy thiết bị." });
            }

            Guid? techId = null;
            if (!string.IsNullOrEmpty(model.AssignedTo))
            {
                var tech = await _context.Users.FirstOrDefaultAsync(u => u.FullName.ToLower().Trim() == model.AssignedTo.ToLower().Trim());
                if (tech != null)
                {
                    techId = tech.Id;
                }
            }

            var ticket = new MaintenanceTicket
            {
                Id = Guid.NewGuid(),
                AssetId = assetId,
                AssignedTechnicianId = techId,
                Description = $"{model.Title}: {model.Description} (Yêu cầu thêm: {model.Requirements})",
                Status = model.Status == "In Progress" ? "InProgress" : "Assigned",
                ScheduledDate = model.DueDate,
                CreatedAt = DateTime.UtcNow
            };

            // Đổi trạng thái thiết bị sang Maintenance
            asset.Status = "Maintenance";

            _context.MaintenanceTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, id = ticket.Id.ToString() });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] CreateWorkTaskModel model)
        {
            var ticket = await _context.MaintenanceTickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound(new { message = "Không tìm thấy công việc bảo trì." });
            }

            Guid? techId = null;
            if (!string.IsNullOrEmpty(model.AssignedTo))
            {
                var tech = await _context.Users.FirstOrDefaultAsync(u => u.FullName.ToLower().Trim() == model.AssignedTo.ToLower().Trim());
                if (tech != null)
                {
                    techId = tech.Id;
                }
            }

            ticket.AssignedTechnicianId = techId;
            ticket.Description = $"{model.Title}: {model.Description} (Yêu cầu thêm: {model.Requirements})";
            ticket.Status = model.Status == "In Progress" ? "InProgress" : "Assigned";
            ticket.ScheduledDate = model.DueDate;

            if (!string.IsNullOrEmpty(model.RelatedAssetId) && Guid.TryParse(model.RelatedAssetId, out Guid assetId))
            {
                if (ticket.AssetId != assetId)
                {
                    ticket.AssetId = assetId;
                    var asset = await _context.Assets.FindAsync(assetId);
                    if (asset != null)
                    {
                        asset.Status = "Maintenance";
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var ticket = await _context.MaintenanceTickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound(new { message = "Không tìm thấy công việc bảo trì." });
            }

            _context.MaintenanceTickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

    public class CreateWorkTaskModel
    {
        public string TaskCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string RelatedAssetId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
        public string Supervisor { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Requirements { get; set; } = string.Empty;
    }
}
