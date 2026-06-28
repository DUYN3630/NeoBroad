using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Threading.Tasks;

namespace NeoBoard.Web.Middlewares
{
    public class SecurityExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public SecurityExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<SecurityExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred in the request pipeline.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var success = false;
            var message = "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên.";
            object? errors = null;

            if (exception is ArgumentException)
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                message = exception.Message;
            }
            else
            {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                // Nếu là môi trường Development, ta có thể trả về lỗi chi tiết hơn, ngược lại thì giấu đi
                if (_env.IsDevelopment())
                {
                    message = exception.Message;
                    errors = new
                    {
                        detail = exception.StackTrace,
                        source = exception.Source
                    };
                }
            }

            var responseObj = new
            {
                success,
                message,
                data = (object?)null,
                errors
            };

            var jsonResult = JsonConvert.SerializeObject(responseObj, new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
            });

            return context.Response.WriteAsync(jsonResult);
        }
    }
}
