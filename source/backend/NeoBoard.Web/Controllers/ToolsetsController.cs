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
            toolset.AvailableQuantity = updatedToolset.AvailableQuantity;

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
