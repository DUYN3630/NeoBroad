using NeoBoard.Application.Common.Interfaces;
using System.Threading.Tasks;

namespace NeoBoard.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body)
        {
            // Mock sending email
            System.Console.WriteLine($"[EMAIL] To: {to}, Subject: {subject}, Body: {body}");
            return Task.CompletedTask;
        }

        public Task SendVerificationCodeAsync(string to, string code)
        {
            return SendEmailAsync(to, "Mã xác thực NeoBoard", $"Mã xác thực của bạn là: {code}");
        }
    }
}
