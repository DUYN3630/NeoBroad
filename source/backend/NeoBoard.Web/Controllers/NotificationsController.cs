using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class NotificationsController : ControllerBase
    {
        [HttpGet]
        public ActionResult GetNotifications()
        {
            var notifications = new List<object>
            {
                new { Id = 1, Title = "Thông báo hệ thống", Message = "Chào mừng bạn đến với NeoBoard.", Type = "Info", Time = "Vừa xong" },
                new { Id = 2, Title = "Khảo sát mới", Message = "Bạn có một khảo sát chưa hoàn thành.", Type = "Survey", Time = "1 giờ trước" }
            };
            return Ok(notifications);
        }
    }
}
