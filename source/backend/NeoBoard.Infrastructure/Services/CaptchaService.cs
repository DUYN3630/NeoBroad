using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Domain.Entities;

namespace NeoBoard.Infrastructure.Services
{
    public class CaptchaService : ICaptchaService
    {
        public CaptchaModel GenerateCaptcha(string webRootPath)
        {
            var random = new Random();
            var captchaCode = random.Next(1000, 9999).ToString();
            var captchaID = Guid.NewGuid().ToString();

            var captchaPath = Path.Combine(webRootPath, "shared", "UserFiles", "Captcha");
            if (!Directory.Exists(captchaPath))
            {
                Directory.CreateDirectory(captchaPath);
            }

            var captchaFilePath = Path.Combine(captchaPath, $"{captchaID}.png");

            using (Bitmap bitmap = new Bitmap(150, 60))
            using (Graphics graphics = Graphics.FromImage(bitmap))
            {
                graphics.Clear(Color.White);
                using (Font font = new Font(FontFamily.GenericSansSerif, 24, FontStyle.Bold))
                using (Brush brush = new SolidBrush(Color.Black))
                {
                    graphics.DrawString(captchaCode, font, brush, 20, 15);
                }
                bitmap.Save(captchaFilePath, ImageFormat.Png);
            }

            return new CaptchaModel
            {
                CaptchaID = captchaID,
                Captcha = $"/shared/UserFiles/Captcha/{captchaID}.png",
                Code = captchaCode 
            };
        }

        public bool IsCaptchaValid(string captchaId, string captchaValue, string storedValue)
        {
            return !string.IsNullOrEmpty(captchaId) && 
                   !string.IsNullOrEmpty(captchaValue) && 
                   captchaValue.ToUpperInvariant() == storedValue;
        }
    }
}
