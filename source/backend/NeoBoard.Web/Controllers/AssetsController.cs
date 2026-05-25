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

            await _context.SaveChangesAsync();

            return Ok(asset);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsset(Guid id)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null)
                return NotFound(new { Message = "Không tìm thấy thiết bị." });

            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa thiết bị thành công." });
        }
    }
}
