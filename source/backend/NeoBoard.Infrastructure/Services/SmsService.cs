using NeoBoard.Application.Common.Interfaces;
using System.Threading.Tasks;

namespace NeoBoard.Infrastructure.Services
{
    public class SmsService : ISmsService
    {
        public Task SendSmsAsync(string phoneNumber, string message)
        {
            // Mock sending SMS
            System.Console.WriteLine($"[SMS] To: {phoneNumber}, Message: {message}");
            return Task.CompletedTask;
        }

        public Task SendVerificationCodeAsync(string phoneNumber, string code)
        {
            return SendSmsAsync(phoneNumber, $"Ma xac thuc NeoBoard cua ban la: {code}");
        }
    }
}
