using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NeoBoard.Infrastructure.Services
{
    public class PredictiveMaintenanceService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PredictiveMaintenanceService> _logger;

        public PredictiveMaintenanceService(IServiceProvider serviceProvider, ILogger<PredictiveMaintenanceService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Predictive Maintenance Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Predictive Maintenance Service is scanning asset health...");

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        await CheckAssetHealthAsync(context);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking asset health.");
                }

                // Chạy mỗi 24 giờ (hoặc ngắn hơn để test: 1 giờ)
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }

            _logger.LogInformation("Predictive Maintenance Service is stopping.");
        }

        private async Task CheckAssetHealthAsync(AppDbContext context)
        {
            // 1. Quét tất cả thiết bị để kiểm tra và tự động sinh ticket bảo trì định kỳ theo chu kỳ thiết bị
            var assets = await context.Assets.ToListAsync();
            foreach (var asset in assets)
            {
                var lastMaint = asset.LastMaintenance ?? asset.CreatedAt;
                var nextMaint = lastMaint.AddMonths(asset.MaintenanceIntervalMonths);

                if (DateTime.UtcNow >= nextMaint)
                {
                    // Kiểm tra xem đã có Ticket chưa hoàn thành cho thiết bị này chưa
                    var existingTicket = await context.MaintenanceTickets
                        .AnyAsync(t => t.AssetId == asset.Id && (t.Status == "Assigned" || t.Status == "InProgress"));

                    if (!existingTicket)
                    {
                        var ticket = new MaintenanceTicket
                        {
                            Id = Guid.NewGuid(),
                            AssetId = asset.Id,
                            AssignedTechnicianId = asset.AssignedTechnicianId,
                            Description = $"Bảo trì định kỳ tự động thiết bị: {asset.Name} (Mã: {asset.AssetCode}) - Chu kỳ {asset.MaintenanceIntervalMonths} tháng",
                            Status = "Assigned",
                            ScheduledDate = nextMaint,
                            TotalCost = 0,
                            CreatedAt = DateTime.UtcNow
                        };

                        asset.Status = "Maintenance";
                        context.MaintenanceTickets.Add(ticket);
                        _logger.LogInformation($"Auto-generated maintenance ticket for asset: {asset.Name} ({asset.Id}) assigned to tech: {asset.AssignedTechnicianId}");
                    }
                }
            }

            // 2. Chạy logic đánh giá sức khỏe dự đoán (Predictive Health)
            var assetsWithHealth = await context.Assets
                .Include(a => a.Health)
                .Where(a => a.Health != null)
                .ToListAsync();

            foreach (var asset in assetsWithHealth)
            {
                var health = asset.Health!;
                bool needsUpdate = false;

                // Đồng bộ ngày lịch bảo trì dự đoán
                if (DateTime.UtcNow >= health.NextScheduledMaintenance)
                {
                    _logger.LogWarning($"Asset {asset.Name} ({asset.SerialNumber}) reached scheduled maintenance date.");
                    health.HealthStatus = "Warning";
                    health.HealthNotes = "Đã đến hạn bảo trì định kỳ.";
                    needsUpdate = true;
                    
                    await CreateMaintenanceNotification(context, asset, "Hạn bảo trì định kỳ");
                }

                if (asset.Type == "Laptop" && health.BatteryHealthPercentage < 20)
                {
                    _logger.LogCritical($"Asset {asset.Name} has low battery health: {health.BatteryHealthPercentage}%");
                    health.HealthStatus = "Critical";
                    health.HealthNotes = "Tuổi thọ pin xuống thấp (< 20%). Cần thay thế.";
                    needsUpdate = true;
                    
                    await CreateMaintenanceNotification(context, asset, "Thay thế pin");
                }

                if (needsUpdate)
                {
                    context.AssetHealths.Update(health);
                }
            }

            await context.SaveChangesAsync();
        }

        private async Task CreateMaintenanceNotification(AppDbContext context, Asset asset, string reason)
        {
            // Kiểm tra xem đã có thông báo chưa để tránh spam
            var existingNotification = await context.Notifications
                .AnyAsync(n => n.ReferenceId == (Guid?)asset.Id && n.Title.Contains("Bảo trì") && !n.IsRead);

            if (!existingNotification)
            {
                // Lấy Admin đầu tiên để gửi thông báo (tạm thời)
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == 0); // 0 = Admin
                if (admin != null)
                {
                    var newNotif = new NeoBoard.Domain.Entities.Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = admin.Id,
                        Title = "Cảnh báo bảo trì thiết bị",
                        Message = $"Thiết bị {asset.Name} ({asset.SerialNumber}) cần được kiểm tra: {reason}.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false,
                        Type = "Maintenance",
                        ReferenceId = asset.Id
                    };
                    context.Notifications.Add(newNotif);
                }
            }
        }
    }
}
