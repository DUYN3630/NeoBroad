using NeoBoard.Domain.Entities;

namespace NeoBoard.Application.Common.Interfaces
{
    public interface ICaptchaService
    {
        CaptchaModel GenerateCaptcha(string webRootPath);
        bool IsCaptchaValid(string captchaId, string captchaValue, string storedValue);
    }
}
