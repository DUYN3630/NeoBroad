using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;
using NeoBoard.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using NeoBoard.Web.Hubs;
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
        private readonly IFileService _fileService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public MaintenanceController(AppDbContext context, IFileService fileService, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _fileService = fileService;
            _hubContext = hubContext;
        }

        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalAssets = await _context.Assets.CountAsync();
            var brokenAssets = await _context.Assets.CountAsync(a => a.Status == "Broken");
            var maintenanceCount = await _context.Assets.CountAsync(a => a.Status == "Maintenance");
            var scheduledCount = await _context.MaintenanceTickets.CountAsync(t => t.Status == "Assigned" || t.Status == "InProgress");
            
            // 1. Availability Rate (% active/in-use/available out of total assets)
            var goodAssetsCount = await _context.Assets.CountAsync(a => a.Status == "Active" || a.Status == "Available" || a.Status == "InUse");
            var availabilityRate = totalAssets > 0 
                ? (int)Math.Round((double)goodAssetsCount / totalAssets * 100) 
                : 100;

            // 2. SLA Compliance (completed in 48 hours)
            var tickets = await _context.MaintenanceTickets.ToListAsync();
            var completedTickets = tickets
                .Where(t => t.Status == "Completed" && t.MaintenanceDate.HasValue)
                .ToList();
            var completedTasksCount = completedTickets.Count;
            var slaMet = completedTickets.Count(t => (t.MaintenanceDate!.Value - t.ScheduledDate).TotalHours <= 48);
            var slaRatio = completedTasksCount > 0 
                ? (int)Math.Round((double)slaMet / completedTasksCount * 100) 
                : 100;

            // 3. Maintenance cost this month
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var totalCostThisMonth = completedTickets
                .Where(t => t.MaintenanceDate >= startOfMonth)
                .Sum(t => t.TotalCost);

            // 4. Asset Type & Status Distribution for Stacked Bar Chart
            var assets = await _context.Assets.ToListAsync();
            var assetDistribution = assets
                .GroupBy(a => a.Type)
                .Select(g => new { 
                    type = string.IsNullOrEmpty(g.Key) ? "Khác" : g.Key, 
                    active = g.Count(a => a.Status == "Active" || a.Status == "Available" || a.Status == "InUse"),
                    maintenance = g.Count(a => a.Status == "Maintenance"),
                    broken = g.Count(a => a.Status == "Broken")
                })
                .Take(5)
                .ToList();

            if (!assetDistribution.Any())
            {
                assetDistribution = new[] {
                    new { type = "Thiết bị Công nghệ", active = 25, maintenance = 2, broken = 1 },
                    new { type = "Thiết bị IoT", active = 15, maintenance = 1, broken = 2 },
                    new { type = "Thiết bị Điện", active = 18, maintenance = 3, broken = 0 }
                }.ToList();
            }

            // 5. 6-Month Maintenance trends (completed vs scheduled tickets)
            var monthlyTrends = new List<object>();
            for (int i = 5; i >= 0; i--)
            {
                var targetDate = DateTime.UtcNow.AddMonths(-i);
                var targetMonth = targetDate.Month;
                var targetYear = targetDate.Year;

                var completedCount = tickets
                    .Count(t => t.Status == "Completed" && t.MaintenanceDate.HasValue && t.MaintenanceDate.Value.Month == targetMonth && t.MaintenanceDate.Value.Year == targetYear);
                
                var createdCount = tickets
                    .Count(t => t.ScheduledDate.Month == targetMonth && t.ScheduledDate.Year == targetYear);

                monthlyTrends.Add(new
                {
                    month = $"T{targetMonth}",
                    completed = completedCount,
                    created = createdCount
                });
            }

            // 6. Technician workload
            var technicians = await _context.Users
                .Where(u => u.Role == 1 || u.Role == 0) // Staff/Admin
                .ToListAsync();
            
            var techWorkload = technicians.Select(tech => new {
                name = tech.FullName,
                done = tickets.Count(t => t.AssignedTechnicianId == tech.Id && t.Status == "Completed"),
                pending = tickets.Count(t => t.AssignedTechnicianId == tech.Id && (t.Status == "Assigned" || t.Status == "InProgress"))
            })
            .Where(w => w.done > 0 || w.pending > 0)
            .Take(5)
            .ToList();

            if (!techWorkload.Any())
            {
                techWorkload = new[] {
                    new { name = "Nguyễn Văn Nhân Viên", done = 8, pending = 3 },
                    new { name = "Super Administrator", done = 4, pending = 1 }
                }.ToList();
            }

            // 7. Critical Alerts (broken assets)
            var criticalAlerts = assets
                .Where(a => a.Status == "Broken")
                .OrderByDescending(a => a.CreatedAt)
                .Take(3)
                .Select(a => new {
                    id = a.Id.ToString(),
                    name = a.Name,
                    code = a.AssetCode,
                    location = a.Location
                })
                .ToList();

            // 8. Upcoming prevention
            var upcomingMaintenances = tickets
                .Where(t => (t.Status == "Assigned" || t.Status == "InProgress") && t.ScheduledDate >= DateTime.UtcNow)
                .OrderBy(t => t.ScheduledDate)
                .Take(3)
                .Select(t => {
                    var asset = assets.FirstOrDefault(a => a.Id == t.AssetId);
                    return new {
                        id = t.Id.ToString(),
                        assetName = asset != null ? asset.Name : "Thiết bị không rõ",
                        scheduledDate = t.ScheduledDate,
                        description = t.Description
                    };
                })
                .ToList();

            // 9. Pending borrow requests
            var pendingRequests = await _context.BorrowRequests
                .Include(r => r.User)
                .Include(r => r.Student)
                .Where(r => r.Status == "Pending")
                .OrderByDescending(r => r.RequestDate)
                .Take(3)
                .Select(r => new {
                    id = r.Id.ToString(),
                    requesterName = r.User != null ? r.User.FullName : (r.Student != null ? r.Student.FullName : "Sinh viên"),
                    purpose = r.Purpose,
                    createdAt = r.RequestDate
                })
                .ToListAsync();

            return Ok(new {
                totalAssets = totalAssets,
                brokenAssets = brokenAssets,
                pendingFailures = maintenanceCount,
                scheduledMaintenances = scheduledCount,
                
                availabilityRate = availabilityRate,
                slaRatio = slaRatio,
                totalCostThisMonth = totalCostThisMonth,
                pendingBorrowCount = pendingRequests.Count,

                assetDistribution = assetDistribution,
                monthlyTrends = monthlyTrends,
                techWorkload = techWorkload,
                criticalAlerts = criticalAlerts,
                upcomingMaintenances = upcomingMaintenances,
                pendingRequests = pendingRequests
            });
        }

        [HttpGet("HealthAnalytics")]
        public async Task<IActionResult> GetHealthAnalytics()
        {
            var assets = await _context.Assets.ToListAsync();
            var available = assets.Count(a => a.Status == "Available" || a.Status == "Active");
            var inUse = assets.Count(a => a.Status == "InUse");
            var maintenance = assets.Count(a => a.Status == "Maintenance");
            var broken = assets.Count(a => a.Status == "Broken");

            // Thống kê số tiền chi cho việc sửa chữa/thay thế linh kiện bảo trì trong tháng hiện tại
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var totalCostThisMonth = await _context.MaintenanceTickets
                .Where(t => t.Status == "Completed" && t.MaintenanceDate >= startOfMonth && t.MaintenanceDate < endOfMonth)
                .SumAsync(t => t.TotalCost);

            return Ok(new {
                available,
                inUse,
                maintenance,
                broken,
                totalCostThisMonth
            });
        }

        [HttpGet("Schedules")]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Where(t => t.Status != "Completed")
                .OrderBy(t => t.ScheduledDate)
                .Select(t => new {
                    id = t.Id.ToString(),
                    assetId = t.AssetId.ToString(),
                    scheduledDate = t.ScheduledDate,
                    description = t.Description,
                    status = t.Status == "Assigned" ? "scheduled" : "in_progress"
                })
                .ToListAsync();

            return Ok(schedules);
        }

        [HttpPost("AutoScheduleAll")]
        public async Task<IActionResult> AutoScheduleAll()
        {
            var assets = await _context.Assets.ToListAsync();
            var technician = await _context.Users.FirstOrDefaultAsync(u => u.FullName.Contains("Nhân Viên") || u.Role == 1);
            Guid? techId = technician?.Id;

            // Xóa các lịch bảo trì chưa hoàn thành cũ để tránh trùng lặp
            var existingTickets = await _context.MaintenanceTickets.Where(t => t.Status != "Completed").ToListAsync();
            _context.MaintenanceTickets.RemoveRange(existingTickets);

            int count = 0;
            foreach (var asset in assets)
            {
                // Để 2 thiết bị đầu tiên có hạn bảo trì là hôm nay (UTC), các thiết bị sau cộng thêm ngày
                var scheduledDate = count < 2 ? DateTime.UtcNow : DateTime.UtcNow.AddDays(count);
                
                var ticket = new MaintenanceTicket
                {
                    Id = Guid.NewGuid(),
                    AssetId = asset.Id,
                    Description = $"Bảo trì định kỳ thiết bị: {asset.Name}",
                    Status = "Assigned",
                    ScheduledDate = scheduledDate,
                    AssignedTechnicianId = techId,
                    Notes = $"Lên lịch bảo trì tự động. Kỹ thuật viên phụ trách: {technician?.FullName ?? "Kỹ thuật viên hệ thống"}."
                };

                asset.Status = "Maintenance";
                var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                if (health != null)
                {
                    health.HealthStatus = "Warning";
                    health.HealthNotes = "Bảo trì định kỳ tự động.";
                    _context.AssetHealths.Update(health);
                }
                _context.MaintenanceTickets.Add(ticket);
                count++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, scheduledCount = count, technicianName = technician?.FullName });
        }

        [HttpPost("Schedules")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleModel model)
        {
            Guid? techId = null;
            if (!string.IsNullOrEmpty(model.Technician))
            {
                var tech = await _context.Users.FirstOrDefaultAsync(u => u.FullName.Contains(model.Technician));
                if (tech != null) techId = tech.Id;
            }

            var ticket = new MaintenanceTicket
            {
                Id = Guid.NewGuid(),
                AssetId = model.AssetId,
                Description = $"{model.Title}: {model.Description}",
                Status = "Assigned",
                ScheduledDate = model.StartDate,
                AssignedTechnicianId = techId,
                Notes = $"Lên lịch thủ công. Nhà thầu: {model.Contractor}. Ngân sách dự kiến: {model.EstimatedCost}"
            };

            var asset = await _context.Assets.FindAsync(model.AssetId);
            if (asset != null)
            {
                asset.Status = "Maintenance";
                var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                if (health != null)
                {
                    health.HealthStatus = "Warning";
                    health.HealthNotes = $"Lên lịch bảo trì: {model.Title}.";
                    _context.AssetHealths.Update(health);
                }
            }

            _context.MaintenanceTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpGet("Tickets")]
        public async Task<IActionResult> GetTickets()
        {
            var tickets = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Include(t => t.AssignedTechnician)
                .Where(t => t.Status == "Completed")
                .OrderByDescending(t => t.MaintenanceDate)
                .Select(t => new {
                    id = t.Id.ToString(),
                    assetId = t.AssetId.ToString(),
                    technician = t.AssignedTechnician != null ? t.AssignedTechnician.FullName : "Kỹ thuật viên hệ thống",
                    description = t.Description,
                    status = t.Status,
                    maintenanceDate = t.MaintenanceDate ?? t.CreatedAt,
                    totalCost = t.TotalCost,
                    verificationResult = t.VerificationResult ?? "Passed"
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpPost("Tickets")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketModel model)
        {
            Guid? techId = null;
            if (!string.IsNullOrEmpty(model.Technician))
            {
                var tech = await _context.Users.FirstOrDefaultAsync(u => u.FullName.Contains(model.Technician));
                if (tech != null) techId = tech.Id;
            }

            var ticket = new MaintenanceTicket
            {
                Id = Guid.NewGuid(),
                AssetId = model.AssetId,
                AssignedTechnicianId = techId,
                Description = model.Description,
                Status = "Completed",
                MaintenanceDate = model.MaintenanceDate,
                TotalCost = model.TotalCost,
                VerificationResult = model.VerificationResult,
                ScheduledDate = model.MaintenanceDate,
                Notes = "Lập thủ công từ kết quả bảo trì"
            };

            var asset = await _context.Assets.FindAsync(model.AssetId);
            if (asset != null)
            {
                asset.LastMaintenance = model.MaintenanceDate;
                asset.Status = model.VerificationResult == "Passed" ? "Active" : "Broken";
                var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                if (health != null)
                {
                    health.HealthStatus = model.VerificationResult == "Passed" ? "Good" : "Critical";
                    health.HealthNotes = model.VerificationResult == "Passed" 
                        ? "Bảo trì hoàn thành. Thiết bị hoạt động tốt." 
                        : "Bảo trì thất bại. Thiết bị gặp sự cố.";
                    _context.AssetHealths.Update(health);
                }
            }

            _context.MaintenanceTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost("Tickets/{id}/complete")]
        public async Task<IActionResult> CompleteTicket(Guid id, [FromBody] CompleteTicketModel model)
        {
            var ticket = await _context.MaintenanceTickets.FindAsync(id);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy ticket bảo trì." });

            string photoUrl = string.Empty;
            if (!string.IsNullOrEmpty(model.EvidencePhoto))
            {
                photoUrl = await _fileService.SaveBase64ImageAsync(model.EvidencePhoto, "maintenance");
            }

            ticket.Status = "Completed";
            ticket.MaintenanceDate = DateTime.UtcNow;
            ticket.TotalCost = model.TotalCost;
            ticket.VerificationResult = model.VerificationResult;
            ticket.ActionTaken = model.ActionTaken;
            ticket.SparePartsUsed = model.SparePartsUsed;
            ticket.Notes = model.Notes;
            ticket.EvidencePhotoUrl = photoUrl;

            var asset = await _context.Assets.FindAsync(ticket.AssetId);
            if (asset != null)
            {
                asset.LastMaintenance = DateTime.UtcNow;
                asset.Status = model.VerificationResult == "Passed" ? "Active" : "Broken";
                var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                if (health != null)
                {
                    health.HealthStatus = model.VerificationResult == "Passed" ? "Good" : "Critical";
                    health.HealthNotes = model.VerificationResult == "Passed" 
                        ? $"Bảo trì/Sửa chữa hoàn thành: {model.ActionTaken}." 
                        : "Kiểm tra sau sửa chữa không đạt yêu cầu. Thiết bị hỏng.";
                    _context.AssetHealths.Update(health);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, photoUrl = photoUrl });
        }

        [HttpPost("Tickets/{id}/start")]
        public async Task<IActionResult> StartTicket(Guid id)
        {
            var ticket = await _context.MaintenanceTickets.FindAsync(id);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy ticket bảo trì." });

            ticket.Status = "InProgress";
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("Failures")]
        public async Task<IActionResult> GetFailures()
        {
            var failures = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Where(t => t.Description.StartsWith("[Báo hỏng]") || t.Description.StartsWith("[Tự động tạo]"))
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new {
                    id = t.Id,
                    assetId = t.AssetId,
                    reportedBy = t.Notes != null && t.Notes.StartsWith("Báo cáo bởi:") 
                        ? t.Notes.Replace("Báo cáo bởi:", "").Trim() 
                        : "Administrator",
                    description = t.Description,
                    status = t.Status == "Assigned" ? "Pending" : (t.Status == "InProgress" ? "In Progress" : "Resolved"),
                    reportedDate = t.CreatedAt
                })
                .ToListAsync();

            return Ok(failures);
        }

        [HttpPost("Failures")]
        public async Task<IActionResult> CreateFailure([FromBody] CreateFailureModel model)
        {
            var asset = await _context.Assets.FindAsync(model.AssetId);
            if (asset == null) return NotFound(new { message = "Không tìm thấy thiết bị." });

            asset.Status = "Broken";
            var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
            if (health != null)
            {
                health.HealthStatus = "Critical";
                health.HealthNotes = $"[Báo cáo hỏng] {model.Description}";
                _context.AssetHealths.Update(health);
            }

            var ticket = new MaintenanceTicket
            {
                Id = Guid.NewGuid(),
                AssetId = model.AssetId,
                Description = $"[Báo hỏng] [{model.Urgency}] {model.Description}",
                Status = "Assigned",
                Notes = $"Báo cáo bởi: {model.ReportedBy}",
                ScheduledDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.MaintenanceTickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Notify Admins and Staffs via SignalR
            try
            {
                var payload = new {
                    ticketId = ticket.Id.ToString(),
                    assetId = asset.Id.ToString(),
                    assetName = asset.Name,
                    reportedBy = model.ReportedBy,
                    urgency = model.Urgency,
                    description = model.Description
                };
                await _hubContext.Clients.Group("Admins").SendAsync("ReceiveFailureReport", payload);
                await _hubContext.Clients.Group("Staffs").SendAsync("ReceiveFailureReport", payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SignalR failure report error: {ex.Message}");
            }

            return Ok(new { success = true });
        }

        [HttpGet("Repairs")]
        public async Task<IActionResult> GetRepairs()
        {
            var repairs = await _context.MaintenanceTickets
                .Include(t => t.Asset)
                .Include(t => t.AssignedTechnician)
                .Where(t => (t.Status == "InProgress" || t.Status == "Completed") && (t.Description.StartsWith("[Báo hỏng]") || t.Description.StartsWith("[Tự động tạo]")))
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new {
                    id = t.Id,
                    assetId = t.AssetId,
                    technicianName = t.AssignedTechnician != null ? t.AssignedTechnician.FullName : "Kỹ thuật viên hệ thống",
                    repairDetails = t.Notes ?? t.Description,
                    estimatedCost = t.TotalCost,
                    status = t.Status == "InProgress" ? "Đang tiến hành" : "Đã hoàn thành",
                    startDate = t.CreatedAt
                })
                .ToListAsync();

            return Ok(repairs);
        }

        [HttpPost("ApproveFailure")]
        public async Task<IActionResult> ApproveFailure([FromBody] ApproveFailureModel model)
        {
            var ticket = await _context.MaintenanceTickets.FindAsync(model.FailureId);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy phiếu báo hỏng." });

            Guid? techId = null;
            if (!string.IsNullOrEmpty(model.TechnicianName))
            {
                var tech = await _context.Users.FirstOrDefaultAsync(u => u.FullName.Contains(model.TechnicianName));
                if (tech == null)
                {
                    tech = await _context.Users.FirstOrDefaultAsync(u => u.Role == 1);
                }
                if (tech != null) techId = tech.Id;
            }

            ticket.Status = "InProgress";
            ticket.AssignedTechnicianId = techId;
            ticket.ScheduledDate = model.EstimatedCompletionDate ?? DateTime.UtcNow.AddDays(3);
            
            ticket.Notes = $"Báo cáo bởi: {ticket.Notes?.Replace("Báo cáo bởi:", "").Trim()}. Chi tiết sửa chữa: {model.RepairDetails}. Linh kiện thay thế: {model.ReplacedParts}. Chi phí nhân công: {model.LaborCost}. Chi phí linh kiện: {model.PartsCost}.";
            ticket.TotalCost = model.LaborCost + model.PartsCost;

            var asset = await _context.Assets.FindAsync(ticket.AssetId);
            if (asset != null)
            {
                asset.Status = "Maintenance";
                var health = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == asset.Id);
                if (health != null)
                {
                    health.HealthStatus = "Warning";
                    health.HealthNotes = $"[Sửa chữa] Đang tiến hành sửa chữa: {model.RepairDetails}";
                    _context.AssetHealths.Update(health);
                }
            }

            await _context.SaveChangesAsync();

            // Notify Assigned Technician (Staff) via SignalR
            if (techId.HasValue)
            {
                try
                {
                    await _hubContext.Clients.Group($"Users_{techId.Value}").SendAsync("ReceiveMaintenanceAssignment", new {
                        ticketId = ticket.Id.ToString(),
                        assetName = asset?.Name ?? "Thiết bị",
                        message = $"🛠️ Bạn đã được phân công sửa chữa thiết bị [{asset?.Name}]. Chi tiết: {model.RepairDetails}"
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SignalR tech assignment notification error: {ex.Message}");
                }
            }

            return Ok(new { success = true });
        }

        [HttpGet("HealthReport")]
        public async Task<IActionResult> GetHealthReport()
        {
            var assetsWithoutHealth = await _context.Assets
                .Include(a => a.Health)
                .Where(a => a.Health == null)
                .ToListAsync();

            if (assetsWithoutHealth.Any())
            {
                var random = new Random();
                foreach (var asset in assetsWithoutHealth)
                {
                    var health = new AssetHealth
                    {
                        Id = Guid.NewGuid(),
                        AssetId = asset.Id,
                        BatteryCycleCount = asset.Type == "Laptop" ? random.Next(50, 300) : (int?)null,
                        BatteryHealthPercentage = asset.Type == "Laptop" ? random.Next(75, 98) : (int?)null,
                        BulbHoursUsed = asset.Name.Contains("chiếu") || (asset.Type == "Monitor" && asset.Name.Contains("Projector")) ? random.Next(100, 1500) : (int?)null,
                        MaintenanceCycleDays = asset.MaintenanceIntervalMonths * 30,
                        LastMaintenanceDate = asset.LastMaintenance ?? asset.CreatedAt,
                        NextScheduledMaintenance = (asset.LastMaintenance ?? asset.CreatedAt).AddMonths(asset.MaintenanceIntervalMonths),
                        HealthStatus = asset.Status == "Broken" ? "Critical" : "Good",
                        HealthNotes = asset.Status == "Broken" ? "Thiết bị lỗi hỏng đang chờ xử lý." : "Hoạt động bình thường."
                    };
                    _context.AssetHealths.Add(health);
                }
                await _context.SaveChangesAsync();
            }

            var reports = await _context.Assets
                .Include(a => a.Health)
                .Select(a => new {
                    id = a.Id.ToString(),
                    name = a.Name,
                    serialNumber = a.SerialNumber,
                    type = a.Type,
                    batteryHealth = a.Health != null ? a.Health.BatteryHealthPercentage : null,
                    batteryCycle = a.Health != null ? a.Health.BatteryCycleCount : null,
                    healthStatus = a.Health != null ? a.Health.HealthStatus : (a.Status == "Broken" ? "Critical" : "Good"),
                    nextMaintenance = a.Health != null && a.Health.NextScheduledMaintenance.HasValue 
                        ? a.Health.NextScheduledMaintenance.Value.ToString("yyyy-MM-dd") 
                        : (a.LastMaintenance ?? a.CreatedAt).AddMonths(a.MaintenanceIntervalMonths).ToString("yyyy-MM-dd"),
                    healthNotes = a.Health != null ? a.Health.HealthNotes : (a.Status == "Broken" ? "Thiết bị lỗi hỏng đang chờ xử lý." : "Hoạt động bình thường.")
                })
                .ToListAsync();

            return Ok(reports);
        }
    }

    public class CreateTicketModel
    {
        public Guid AssetId { get; set; }
        public string Technician { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public string VerificationResult { get; set; } = "Passed";
        public DateTime MaintenanceDate { get; set; }
    }

    public class CreateScheduleModel
    {
        public Guid AssetId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string MaintenanceType { get; set; } = "Preventive";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Priority { get; set; } = "Normal";
        public string Technician { get; set; } = string.Empty;
        public string Contractor { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public string MaintenanceCycle { get; set; } = "Once";
        public string Description { get; set; } = string.Empty;
        public string Checklist { get; set; } = string.Empty;
    }

    public class CompleteTicketModel
    {
        public string ActionTaken { get; set; } = string.Empty;
        public string SparePartsUsed { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public string VerificationResult { get; set; } = "Passed";
        public string Notes { get; set; } = string.Empty;
        public string? EvidencePhoto { get; set; } // Base64
    }

    public class CreateFailureModel
    {
        public Guid AssetId { get; set; }
        public string ReportedBy { get; set; } = "Administrator";
        public string Urgency { get; set; } = "Medium";
        public string Description { get; set; } = string.Empty;
    }

    public class ApproveFailureModel
    {
        public Guid FailureId { get; set; }
        public Guid AssetId { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public string RepairDetails { get; set; } = string.Empty;
        public string ReplacedParts { get; set; } = string.Empty;
        public decimal LaborCost { get; set; }
        public decimal PartsCost { get; set; }
        public DateTime? EstimatedCompletionDate { get; set; }
    }
}
