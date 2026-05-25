using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public HealthController(AppDbContext context)
        {
            _context = context;
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
                        message = "Kết nối PostgreSQL thành công!",
                        database = _context.Database.GetDbConnection().Database
                    });
                }
                
                return StatusCode(500, new { 
                    status = "Error", 
                    message = "Backend chạy được nhưng không thể kết nối tới PostgreSQL. Kiểm tra lại chuỗi kết nối hoặc Server Postgres." 
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
