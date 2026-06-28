using Microsoft.AspNetCore.Mvc;
using NeoBoard.Domain.Repositories;
using System.Threading.Tasks;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentRepository _studentRepository;

        public StudentsController(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        [HttpGet("search/{studentCode}")]
        public async Task<IActionResult> GetByCode(string studentCode)
        {
            var student = await _studentRepository.GetByCodeAsync(studentCode);
            
            if (student == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sinh viên với mã này." });
            }

            if (student.IsBlocked)
            {
                return BadRequest(new { success = false, message = "Sinh viên này hiện đang bị khóa quyền mượn thiết bị." });
            }

            return Ok(new { 
                success = true, 
                data = new {
                    id = student.Id,
                    studentCode = student.StudentCode,
                    fullName = student.FullName,
                    className = student.ClassName,
                    department = student.Department
                } 
            });
        }
    }
}
