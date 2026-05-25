using Microsoft.AspNetCore.Mvc;
using NeoBoard.Domain.Repositories;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest(new { success = false, message = "Cần mã sinh viên để tìm kiếm" });

            var user = await _userRepository.GetByCodeAsync(query);
            
            if (user == null)
                return NotFound(new { success = false, message = "Không tìm thấy người dùng" });

            return Ok(new { 
                success = true, 
                data = new {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    department = user.Department
                },
                message = "Tìm thấy người dùng"
            });
        }
    }
}
