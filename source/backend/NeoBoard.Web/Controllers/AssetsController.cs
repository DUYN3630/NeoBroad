using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssetsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssets()
        {
            var assets = await _context.Assets
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(assets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsset(Guid id)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null)
                return NotFound(new { Message = "Không tìm thấy thiết bị." });

            return Ok(asset);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsset([FromBody] Asset asset)
        {
            if (asset == null)
                return BadRequest(new { Message = "Dữ liệu không hợp lệ." });

            asset.Id = Guid.NewGuid();
            asset.CreatedAt = DateTime.UtcNow;

            _context.Assets.Add(asset);

            var health = new AssetHealth
            {
                Id = Guid.NewGuid(),
                AssetId = asset.Id,
                BatteryCycleCount = asset.Type == "Laptop" ? 0 : (int?)null,
                BatteryHealthPercentage = asset.Type == "Laptop" ? 100 : (int?)null,
                BulbHoursUsed = asset.Type == "Monitor" && asset.Name.Contains("Projector") ? 0 : (int?)null,
                MaintenanceCycleDays = asset.MaintenanceIntervalMonths * 30,
                LastMaintenanceDate = asset.LastMaintenance ?? asset.CreatedAt,
                NextScheduledMaintenance = (asset.LastMaintenance ?? asset.CreatedAt).AddMonths(asset.MaintenanceIntervalMonths),
                HealthStatus = asset.Status == "Broken" ? "Critical" : "Good",
                HealthNotes = asset.Status == "Broken" ? "Thiết bị lỗi hỏng đang chờ xử lý." : "Hoạt động bình thường."
            };
            _context.AssetHealths.Add(health);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAsset), new { id = asset.Id }, asset);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsset(Guid id, [FromBody] Asset updatedAsset)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null)
                return NotFound(new { Message = "Không tìm thấy thiết bị." });

            asset.Name = updatedAsset.Name;
            asset.SerialNumber = updatedAsset.SerialNumber;
            asset.Type = updatedAsset.Type;
            asset.Status = updatedAsset.Status;
            asset.Department = updatedAsset.Department;
            asset.Price = updatedAsset.Price;
            asset.LastMaintenance = updatedAsset.LastMaintenance;
            asset.AssetCode = updatedAsset.AssetCode;
            asset.Model = updatedAsset.Model;
            asset.Location = updatedAsset.Location;
            asset.Custodian = updatedAsset.Custodian;
            asset.Manufacturer = updatedAsset.Manufacturer;
            asset.Supplier = updatedAsset.Supplier;
            asset.InvoiceNumber = updatedAsset.InvoiceNumber;
            asset.TechnicalSpecs = updatedAsset.TechnicalSpecs;
            asset.Notes = updatedAsset.Notes;
            asset.PurchaseDate = updatedAsset.PurchaseDate;
            asset.WarrantyMonths = updatedAsset.WarrantyMonths;
            asset.WarrantyExpiration = updatedAsset.WarrantyExpiration;
            asset.MaintenanceIntervalMonths = updatedAsset.MaintenanceIntervalMonths;
            asset.AssignedTechnicianId = updatedAsset.AssignedTechnicianId;

            // Sync AssetHealth
            var healthRecord = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == id);
            if (healthRecord != null)
            {
                healthRecord.HealthStatus = asset.Status == "Broken" ? "Critical" : (asset.Status == "Maintenance" ? "Warning" : "Good");
                healthRecord.HealthNotes = asset.Status == "Broken" 
                    ? "Thiết bị được báo cáo lỗi hỏng." 
                    : (asset.Status == "Maintenance" ? "Thiết bị đang được bảo trì." : "Hoạt động bình thường.");
                _context.AssetHealths.Update(healthRecord);
            }

            await _context.SaveChangesAsync();

            return Ok(asset);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsset(Guid id)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null)
                return NotFound(new { Message = "Không tìm thấy thiết bị." });

            var healthRecord = await _context.AssetHealths.FirstOrDefaultAsync(h => h.AssetId == id);
            if (healthRecord != null)
            {
                _context.AssetHealths.Remove(healthRecord);
            }

            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa thiết bị thành công." });
        }
    }
}
