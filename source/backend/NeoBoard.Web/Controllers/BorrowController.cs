using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Domain.Entities;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class BorrowController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BorrowController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("MyRequests/{userId}")]
        public async Task<IActionResult> GetMyRequests(Guid userId)
        {
            var requests = await _context.BorrowRequests
                .Where(r => r.UserId == userId)
                .Include(r => r.Items)
                .ThenInclude(i => i.Asset)
                .ToListAsync();
            return Ok(requests);
        }

        [HttpPost("Request")]
        public async Task<IActionResult> CreateRequest([FromBody] BorrowRequest request)
        {
            _context.BorrowRequests.Add(request);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Yêu cầu mượn đã được gửi!" });
        }

        [HttpPost("Return/{itemId}")]
        public async Task<IActionResult> ReturnItem(Guid itemId, [FromBody] string condition)
        {
            var item = await _context.BorrowItems.FindAsync(itemId);
            if (item == null) return NotFound();

            item.ActualReturnDate = DateTime.UtcNow;
            item.ConditionOnReturn = condition;
            
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã ghi nhận trả thiết bị!" });
        }
    }
}
