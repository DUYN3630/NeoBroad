using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        [HttpGet]
        public ActionResult GetActivities()
        {
            var logs = new List<object>
            {
                new { Id = 1, User = "Administrator", Action = "Thêm thiết bị mới", Target = "Dell XPS 15", Time = "10 phút trước", Type = "Create" },
                new { Id = 2, User = "Administrator", Action = "Duyệt sửa chữa", Target = "#FL-1", Time = "1 giờ trước", Type = "Update" },
                new { Id = 3, User = "Kỹ thuật viên A", Action = "Hoàn thành Task", Target = "Sửa máy in", Time = "3 giờ trước", Type = "Success" },
                new { Id = 4, User = "Administrator", Action = "Xóa người dùng", Target = "staff_test@ams.com", Time = "Hôm qua", Type = "Delete" }
            };
            return Ok(logs);
        }
    }
}
