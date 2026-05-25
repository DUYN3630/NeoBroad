using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaintenanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // Lấy thống kê thật từ Database
            var totalAssets = await _context.Assets.CountAsync();
            var maintenanceCount = await _context.Assets.CountAsync(a => a.Status == "Maintenance");
            
            return Ok(new {
                totalAssets = totalAssets,
                maintenancePending = maintenanceCount,
                repairingCount = 0, // Sẽ cập nhật khi có bảng Repairs
                successRate = "100%"
            });
        }

        [HttpGet("Schedules")]
        public IActionResult GetSchedules()
        {
            // Hiện tại trả về danh sách rỗng từ DB (hoặc bạn có thể thêm dữ liệu vào bảng tương ứng)
            return Ok(new List<object>());
        }

        [HttpGet("Tickets")]
        public IActionResult GetTickets()
        {
            // Trả về danh sách ticket bảo trì
            return Ok(new List<object>());
        }

        [HttpGet("Failures")]
        public IActionResult GetFailures()
        {
            // Fix lỗi 404 cho trang Phiếu báo hỏng
            return Ok(new List<object>());
        }

        [HttpGet("Repairs")]
        public IActionResult GetRepairs()
        {
            // Fix lỗi 404 cho trang Phiếu sửa chữa
            return Ok(new List<object>());
        }
    }
}
