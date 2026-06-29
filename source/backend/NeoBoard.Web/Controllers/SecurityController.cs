using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class SecurityController : ControllerBase
    {
        private readonly ISecuritySettingsService _settingsService;
        private readonly AppDbContext _context;

        public SecurityController(ISecuritySettingsService settingsService, AppDbContext context)
        {
            _settingsService = settingsService;
            _context = context;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _settingsService.GetSettingsAsync();
            return Ok(new
            {
                twoFactorEnabled = settings.TwoFactorEnabled,
                ipRestrictionEnabled = settings.IpRestrictionEnabled
            });
        }

        [HttpPost("settings")]
        [Authorize(Roles = "0")] // Chỉ Admin (Role = 0) mới có quyền đổi cấu hình
        public async Task<IActionResult> UpdateSettings([FromBody] SecuritySettings model)
        {
            if (model == null) return BadRequest(new { Message = "Dữ liệu không hợp lệ." });

            await _settingsService.SaveSettingsAsync(model);
            return Ok(new { Message = "Cập nhật cấu hình bảo mật thành công!" });
        }

        [HttpGet("logs")]
        [Authorize(Roles = "0")] // Chỉ Admin mới xem được nhật ký truy cập
        public async Task<IActionResult> GetAccessLogs()
        {
            try
            {
                var logs = await _context.UserActivities
                    .Include(a => a.User)
                    .Where(a => a.Action.StartsWith("LOGIN"))
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(100)
                    .ToListAsync();

                var formattedLogs = logs.Select(l =>
                {
                    string username = "Unknown";
                    if (l.User != null)
                    {
                        username = l.User.Email.Split('@')[0];
                    }
                    else if (!string.IsNullOrEmpty(l.Description))
                    {
                        var parts = l.Description.Split(' ');
                        username = parts[0];
                        if (username.Contains('@'))
                        {
                            username = username.Split('@')[0];
                        }
                    }

                    string status = "Bị từ chối";
                    if (l.Action == "LOGIN_SUCCESS")
                    {
                        status = "Thành công";
                    }

                    // Tính thời gian dạng đọc được (friendly time) hoặc tương đối
                    var diff = DateTime.UtcNow - l.CreatedAt;
                    string timeStr;
                    if (diff.TotalMinutes < 1) timeStr = "Vừa xong";
                    else if (diff.TotalMinutes < 60) timeStr = $"{(int)diff.TotalMinutes} phút trước";
                    else if (diff.TotalHours < 24) timeStr = $"{(int)diff.TotalHours} giờ trước";
                    else timeStr = l.CreatedAt.AddHours(7).ToString("dd/MM/yyyy HH:mm");

                    return new
                    {
                        user = username,
                        ip = string.IsNullOrEmpty(l.IpAddress) || l.IpAddress == "::1" || l.IpAddress == "127.0.0.1" ? "192.168.1.1" : l.IpAddress, // Mock IP loopback sang IP mạng nội bộ như yêu cầu
                        status = status,
                        time = timeStr
                    };
                }).ToList();

                return Ok(formattedLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi lấy nhật ký", Details = ex.Message });
            }
        }
    }
}
