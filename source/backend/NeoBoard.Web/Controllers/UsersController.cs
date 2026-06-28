using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeoBoard.Domain.Repositories;
using NeoBoard.Domain.Entities;
using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly AppDbContext _context;

        public UsersController(
            IUserRepository userRepository, 
            IPasswordService passwordService,
            AppDbContext context)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users.ToListAsync();
            var result = users.Select(u => new {
                u.Id,
                u.Email,
                username = u.Email.Split('@')[0],
                u.FullName,
                role = u.Role,
                roleName = u.Role == 0 ? "Admin" : u.Role == 1 ? "Staff" : u.Role == 2 ? "Teacher" : "Student",
                u.Department,
                jobTitle = u.Role == 0 ? "Quản trị viên" : u.Role == 1 ? "Kỹ thuật viên" : u.Role == 2 ? "Giảng viên" : "Sinh viên",
                u.IsActive,
                u.CreatedAt
            });
            return Ok(result);
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.FullName))
                return BadRequest(new { message = "Email và Họ tên không được để trống" });

            var existing = await _userRepository.GetByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest(new { message = "Email đã tồn tại trên hệ thống" });

            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                PasswordHash = _passwordService.HashPassword(dto.Password ?? "123456"),
                Role = MapRoleNameToCode(dto.RoleName),
                Department = dto.Department,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            user.Email = dto.Email;
            user.FullName = dto.FullName;
            user.Role = MapRoleNameToCode(dto.RoleName);
            user.Department = dto.Department;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa người dùng thành công" });
        }

        private int MapRoleNameToCode(string roleName)
        {
            return roleName switch
            {
                "Admin" => 0,
                "Staff" => 1,
                "Technician" => 1,
                "Teacher" => 2,
                _ => 3 // Student
            };
        }
    }

    public class UserCreateDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UserUpdateDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public bool IsActive { get; set; }
    }
}
