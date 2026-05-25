using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("Stats")]
        public async Task<IActionResult> GetStats()
        {
            var userCount = await _context.Users.CountAsync();
            var postCount = await _context.TimelinePosts.CountAsync();
            var announcementCount = await _context.Announcements.CountAsync();
            var surveyCount = await _context.Surveys.CountAsync();

            // Format này để khớp với những gì Frontend mong đợi (giả lập)
            return Ok(new {
                totalUsers = userCount,
                totalPosts = postCount,
                totalAnnouncements = announcementCount,
                totalSurveys = surveyCount,
                // Thêm các trường cũ để tránh crash frontend cũ
                totalAssets = userCount, 
                maintenancePending = announcementCount
            });
        }
    }
}
