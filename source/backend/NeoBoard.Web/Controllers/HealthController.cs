using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using NeoBoard.Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IDistributedCache _cache;

        public HealthController(AppDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpGet("redis")]
        public async Task<IActionResult> CheckRedis()
        {
            try
            {
                var testKey = "health:test";
                var testVal = DateTime.UtcNow.ToString("o");
                
                // Try writing to Redis
                await _cache.SetStringAsync(testKey, testVal, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10)
                });

                // Try reading from Redis
                var readVal = await _cache.GetStringAsync(testKey);

                if (readVal == testVal)
                {
                    return Ok(new {
                        status = "Success",
                        message = "Kết nối Redis thành công và thao tác Đọc/Ghi hoạt động tốt!",
                        timestamp = readVal
                    });
                }

                return StatusCode(500, new {
                    status = "Error",
                    message = "Thao tác Đọc/Ghi trên Redis không đồng bộ hoặc không khớp."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {
                    status = "Exception",
                    message = $"Không thể kết nối đến Redis: {ex.Message}",
                    detail = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("database")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                // Thử kết nối tới Database
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (canConnect)
                {
                    return Ok(new { 
                        status = "Success", 
                        message = "Kết nối MySQL thành công!",
                        database = _context.Database.GetDbConnection().Database,
                        dataSource = _context.Database.GetDbConnection().DataSource
                    });
                }
                
                return StatusCode(500, new { 
                    status = "Error", 
                    message = "Backend chạy được nhưng không thể kết nối tới MySQL. Kiểm tra lại Port (3306/3307) và Database name." 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    status = "Exception", 
                    message = $"Lỗi kết nối: {ex.Message}",
                    detail = ex.InnerException?.Message 
                });
            }
        }
    }
}
