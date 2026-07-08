using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using NeoBoard.Infrastructure.Data;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(AppDbContext context, IDistributedCache cache, ILogger<DashboardController> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        [HttpGet("Stats")]
        public async Task<IActionResult> GetStats()
        {
            const string cacheKey = "dashboard:stats";
            DashboardStatsDto? stats = null;

            try
            {
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    stats = JsonSerializer.Deserialize<DashboardStatsDto>(cachedData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read dashboard stats from Redis cache. Falling back to DB.");
            }

            if (stats == null)
            {
                var userCount = await _context.Users.CountAsync();
                var postCount = await _context.TimelinePosts.CountAsync();
                var announcementCount = await _context.Announcements.CountAsync();
                var surveyCount = await _context.Surveys.CountAsync();

                stats = new DashboardStatsDto
                {
                    TotalUsers = userCount,
                    TotalPosts = postCount,
                    TotalAnnouncements = announcementCount,
                    TotalSurveys = surveyCount,
                    TotalAssets = userCount,
                    MaintenancePending = announcementCount
                };

                try
                {
                    var options = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                    };
                    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(stats), options);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to write dashboard stats to Redis cache.");
                }
            }

            return Ok(stats);
        }
    }

    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalPosts { get; set; }
        public int TotalAnnouncements { get; set; }
        public int TotalSurveys { get; set; }
        public int TotalAssets { get; set; }
        public int MaintenancePending { get; set; }
    }
}
