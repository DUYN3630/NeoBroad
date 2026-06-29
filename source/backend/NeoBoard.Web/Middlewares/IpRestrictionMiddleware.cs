using Microsoft.AspNetCore.Http;
using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NeoBoard.Web.Middlewares
{
    public class IpRestrictionMiddleware
    {
        private readonly RequestDelegate _next;

        public IpRestrictionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ISecuritySettingsService settingsService, AppDbContext dbContext)
        {
            var settings = await settingsService.GetSettingsAsync();
            if (settings.IpRestrictionEnabled)
            {
                var user = context.User;
                var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;

                // Nếu người dùng đăng nhập là Admin (Role = 0)
                if (roleClaim == "0")
                {
                    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    if (!settingsService.IsLocalIp(ip))
                    {
                        var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        Guid? userId = Guid.TryParse(userIdStr, out var g) ? g : null;
                        var userEmail = user.FindFirst(ClaimTypes.Email)?.Value ?? "admin";

                        // Ghi nhận nhật ký bị chặn do IP
                        var activity = new UserActivity
                        {
                            UserId = userId,
                            Action = "LOGIN_DENIED_IP",
                            Description = $"{userEmail} (Bị từ chối - Giới hạn IP)",
                            IpAddress = ip,
                            CreatedAt = DateTime.UtcNow
                        };
                        dbContext.UserActivities.Add(activity);
                        await dbContext.SaveChangesAsync();

                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new { success = false, message = "Truy cập bị từ chối: Chỉ cho phép truy cập từ mạng nội bộ." });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
