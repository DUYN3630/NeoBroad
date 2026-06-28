using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Web.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AnnouncementsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var now = DateTime.UtcNow;
            var announcements = await _context.Announcements
                .Include(a => a.Author)
                .Where(a => a.IsPublished && (a.ExpiresAt == null || a.ExpiresAt > now))
                .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .ToListAsync();

            var result = announcements.Select(a => new {
                id = a.Id,
                title = a.Title,
                content = a.Content,
                priority = a.Priority, // 0: Normal, 1: Important, 2: Urgent
                publishedAt = a.PublishedAt ?? a.CreatedAt,
                authorName = a.Author != null ? a.Author.FullName : "Ban Quản Trị"
            });

            return Ok(result);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllAnnouncements()
        {
            var announcements = await _context.Announcements
                .Include(a => a.Author)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var result = announcements.Select(a => new {
                id = a.Id,
                title = a.Title,
                content = a.Content,
                priority = a.Priority,
                isPublished = a.IsPublished,
                publishedAt = a.PublishedAt,
                expiresAt = a.ExpiresAt,
                createdAt = a.CreatedAt,
                authorName = a.Author != null ? a.Author.FullName : "Ban Quản Trị"
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementModel model)
        {
            var announcement = new Announcement
            {
                Id = Guid.NewGuid(),
                AuthorId = model.AuthorId,
                Title = model.Title,
                Content = model.Content,
                Priority = model.Priority,
                IsPublished = model.IsPublished,
                CreatedAt = DateTime.UtcNow,
                PublishedAt = model.IsPublished ? DateTime.UtcNow : null,
                ExpiresAt = model.ExpiresAt
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            // Broadcast via SignalR if it is published immediately
            if (announcement.IsPublished)
            {
                try
                {
                    var author = await _context.Users.FindAsync(model.AuthorId);
                    await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", new {
                        id = announcement.Id,
                        title = announcement.Title,
                        content = announcement.Content,
                        priority = announcement.Priority,
                        publishedAt = announcement.PublishedAt ?? announcement.CreatedAt,
                        authorName = author != null ? author.FullName : "Ban Quản Trị"
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR announcement broadcast error: {ex.Message}");
                }
            }

            return Ok(new { success = true, message = "Tạo thông báo thành công!", announcementId = announcement.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] UpdateAnnouncementModel model)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return NotFound();

            var wasPublished = announcement.IsPublished;

            announcement.Title = model.Title;
            announcement.Content = model.Content;
            announcement.Priority = model.Priority;
            announcement.IsPublished = model.IsPublished;
            announcement.ExpiresAt = model.ExpiresAt;

            if (model.IsPublished && !wasPublished)
            {
                announcement.PublishedAt = DateTime.UtcNow;
            }

            _context.Announcements.Update(announcement);
            await _context.SaveChangesAsync();

            // If newly published, broadcast it
            if (model.IsPublished && !wasPublished)
            {
                try
                {
                    var author = await _context.Users.FindAsync(announcement.AuthorId);
                    await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", new {
                        id = announcement.Id,
                        title = announcement.Title,
                        content = announcement.Content,
                        priority = announcement.Priority,
                        publishedAt = announcement.PublishedAt ?? announcement.CreatedAt,
                        authorName = author != null ? author.FullName : "Ban Quản Trị"
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR announcement update broadcast error: {ex.Message}");
                }
            }

            return Ok(new { success = true, message = "Cập nhật thông báo thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(Guid id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return NotFound();

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa thông báo thành công!" });
        }
    }

    public class CreateAnnouncementModel
    {
        public Guid? AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int Priority { get; set; } = 0;
        public bool IsPublished { get; set; } = false;
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateAnnouncementModel
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int Priority { get; set; } = 0;
        public bool IsPublished { get; set; } = false;
        public DateTime? ExpiresAt { get; set; }
    }
}
