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
    public class TimelineController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public TimelineController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.TimelinePosts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                    .ThenInclude(c => c.Author)
                .Where(p => p.IsPublished)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var result = posts.Select(p => new {
                id = p.Id,
                authorId = p.AuthorId,
                authorName = p.Author != null ? p.Author.FullName : "Ẩn danh",
                authorRole = p.Author != null ? p.Author.Role : 2,
                content = p.Content,
                imageUrl = p.ImageUrl,
                likeCount = p.LikeCount,
                commentCount = p.Comments.Count,
                createdAt = p.CreatedAt,
                comments = p.Comments.Select(c => new {
                    id = c.Id,
                    authorName = c.Author != null ? c.Author.FullName : "Ẩn danh",
                    authorRole = c.Author != null ? c.Author.Role : 2,
                    content = c.Content,
                    createdAt = c.CreatedAt
                }).OrderBy(c => c.createdAt).ToList()
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostModel model)
        {
            try
            {
                var user = await _context.Users.FindAsync(model.AuthorId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng." });
                }

                var post = new TimelinePost
                {
                    Id = Guid.NewGuid(),
                    AuthorId = model.AuthorId,
                    Content = model.Content,
                    ImageUrl = model.ImageUrl,
                    LikeCount = 0,
                    CommentCount = 0,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.TimelinePosts.Add(post);
                await _context.SaveChangesAsync();

                // Broadcast real-time Timeline post notification
                try
                {
                    await _hubContext.Clients.All.SendAsync("ReceiveTimelinePost", new
                    {
                        id = post.Id,
                        authorId = post.AuthorId,
                        authorName = user.FullName,
                        authorRole = user.Role,
                        content = post.Content,
                        imageUrl = post.ImageUrl,
                        likeCount = post.LikeCount,
                        commentCount = post.CommentCount,
                        createdAt = post.CreatedAt
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR timeline post broadcast error: {ex.Message}");
                }

                return Ok(new { 
                    success = true, 
                    message = "Đã đăng bài viết thành công!",
                    postId = post.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TimelineController Error] Exception: {ex.Message}");
                Console.WriteLine($"[TimelineController Error] InnerException: {ex.InnerException?.Message}");
                Console.WriteLine($"[TimelineController Error] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Lỗi hệ thống khi đăng bài.", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message 
                });
            }
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(Guid id)
        {
            var post = await _context.TimelinePosts.FindAsync(id);
            if (post == null) return NotFound();

            post.LikeCount += 1;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, likes = post.LikeCount });
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateCommentModel model)
        {
            var post = await _context.TimelinePosts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Không tìm thấy bài viết." });

            var user = await _context.Users.FindAsync(model.AuthorId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            var comment = new PostComment
            {
                Id = Guid.NewGuid(),
                PostId = id,
                AuthorId = model.AuthorId,
                Content = model.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.PostComments.Add(comment);
            
            post.CommentCount += 1;
            _context.TimelinePosts.Update(post);

            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                comment = new {
                    id = comment.Id,
                    authorName = user.FullName,
                    authorRole = user.Role,
                    content = comment.Content,
                    createdAt = comment.CreatedAt
                }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var post = await _context.TimelinePosts
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (post == null) return NotFound();

            _context.PostComments.RemoveRange(post.Comments);
            _context.TimelinePosts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa bài viết thành công." });
        }
    }

    public class CreatePostModel
    {
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    public class CreateCommentModel
    {
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
