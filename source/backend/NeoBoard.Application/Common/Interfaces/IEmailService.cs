using System.Threading.Tasks;

namespace NeoBoard.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendVerificationCodeAsync(string to, string code);
    }
}
