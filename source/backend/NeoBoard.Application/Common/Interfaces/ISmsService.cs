using System.Threading.Tasks;

namespace NeoBoard.Application.Common.Interfaces
{
    public interface ISmsService
    {
        Task SendSmsAsync(string phoneNumber, string message);
        Task SendVerificationCodeAsync(string phoneNumber, string code);
    }
}
