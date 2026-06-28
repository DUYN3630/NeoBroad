using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Entities;
using NeoBoard.Infrastructure.Data;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ToolsetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ToolsetsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetToolsets()
        {
            var toolsets = await _context.Toolsets
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(toolsets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetToolset(Guid id)
        {
            var toolset = await _context.Toolsets.FindAsync(id);
            if (toolset == null)
                return NotFound(new { Message = "Không tìm thấy bộ công cụ." });

            return Ok(toolset);
        }

        [HttpPost]
        public async Task<IActionResult> CreateToolset([FromBody] Toolset toolset)
        {
            if (toolset == null)
                return BadRequest(new { Message = "Dữ liệu không hợp lệ." });

            toolset.Id = Guid.NewGuid();
            toolset.CreatedAt = DateTime.UtcNow;
            
            // Đảm bảo số lượng khả dụng ban đầu bằng tổng số lượng
            toolset.AvailableQuantity = toolset.TotalQuantity;

            _context.Toolsets.Add(toolset);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetToolset), new { id = toolset.Id }, toolset);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateToolset(Guid id, [FromBody] Toolset updatedToolset)
        {
            var toolset = await _context.Toolsets.FindAsync(id);
            if (toolset == null)
                return NotFound(new { Message = "Không tìm thấy bộ công cụ." });

            toolset.Name = updatedToolset.Name;
            toolset.Code = updatedToolset.Code;
            toolset.Description = updatedToolset.Description;
            toolset.TotalQuantity = updatedToolset.TotalQuantity;
            
            // Điều chỉnh số lượng khả dụng dựa trên chênh lệch tổng số lượng mới
            int difference = updatedToolset.TotalQuantity - toolset.TotalQuantity;
            toolset.AvailableQuantity = Math.Max(0, toolset.AvailableQuantity + difference);

            toolset.Status = updatedToolset.Status;
            toolset.Location = updatedToolset.Location;
            toolset.Custodian = updatedToolset.Custodian;
            toolset.Supplier = updatedToolset.Supplier;
            toolset.PurchaseDate = updatedToolset.PurchaseDate;
            toolset.WarrantyMonths = updatedToolset.WarrantyMonths;
            toolset.ItemsDetail = updatedToolset.ItemsDetail;
            toolset.LastMaintenanceDate = updatedToolset.LastMaintenanceDate;
            toolset.Department = updatedToolset.Department;

            await _context.SaveChangesAsync();

            return Ok(toolset);
        }

        [HttpPut("{id}/ToggleStatus")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var toolset = await _context.Toolsets.FindAsync(id);
            if (toolset == null)
                return NotFound(new { Message = "Không tìm thấy bộ công cụ." });

            if (toolset.Status == "Available")
            {
                toolset.Status = "InUse";
                if (toolset.AvailableQuantity > 0)
                {
                    toolset.AvailableQuantity -= 1;
                }
            }
            else
            {
                toolset.Status = "Available";
                if (toolset.AvailableQuantity < toolset.TotalQuantity)
                {
                    toolset.AvailableQuantity += 1;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(toolset);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteToolset(Guid id)
        {
            var toolset = await _context.Toolsets.FindAsync(id);
            if (toolset == null)
                return NotFound(new { Message = "Không tìm thấy bộ công cụ." });

            _context.Toolsets.Remove(toolset);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa bộ công cụ thành công." });
        }
    }
}
