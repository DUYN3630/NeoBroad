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

            // Fallback to current directory if webRootPath is null
            var rootPath = webRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            var captchaPath = Path.Combine(rootPath, "shared", "UserFiles", "Captcha");
            if (!Directory.Exists(captchaPath))
            {
                Directory.CreateDirectory(captchaPath);
            }

            var captchaFilePath = Path.Combine(captchaPath, $"{captchaID}.png");

            try
            {
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
            }
            catch (Exception ex)
            {
                // If System.Drawing fails, we still return the model but without a generated image
                // In a real app, we'd log this: Console.WriteLine(ex.Message);
                return new CaptchaModel
                {
                    CaptchaID = captchaID,
                    Captcha = "", // No image
                    Code = captchaCode 
                };
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
