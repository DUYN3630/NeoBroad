using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TasksController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetTasks()
        {
            return Ok(new List<object>());
        }
    }
}
