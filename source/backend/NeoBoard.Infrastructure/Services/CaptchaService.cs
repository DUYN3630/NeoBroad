using System;
using System.IO;
using System.Text;
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

            try
            {
                // Generate a simple, cross-platform SVG captcha
                var svgBuilder = new StringBuilder();
                svgBuilder.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"60\" viewBox=\"0 0 150 60\">");
                svgBuilder.Append("<rect width=\"100%\" height=\"100%\" fill=\"#f8f9fa\" rx=\"6\"/>");
                
                // Add some noise lines
                for (int i = 0; i < 4; i++)
                {
                    int x1 = random.Next(0, 50);
                    int y1 = random.Next(0, 60);
                    int x2 = random.Next(100, 150);
                    int y2 = random.Next(0, 60);
                    string color = $"rgb({random.Next(100, 200)},{random.Next(100, 200)},{random.Next(100, 200)})";
                    svgBuilder.Append($"<line x1=\"{x1}\" y1=\"{y1}\" x2=\"{x2}\" y2=\"{y2}\" stroke=\"{color}\" stroke-width=\"1.5\"/>");
                }

                // Add some noise circles
                for (int i = 0; i < 15; i++)
                {
                    int cx = random.Next(0, 150);
                    int cy = random.Next(0, 60);
                    int r = random.Next(2, 5);
                    string color = $"rgb({random.Next(150, 220)},{random.Next(150, 220)},{random.Next(150, 220)})";
                    svgBuilder.Append($"<circle cx=\"{cx}\" cy=\"{cy}\" r=\"{r}\" fill=\"{color}\" opacity=\"0.6\"/>");
                }

                // Render captcha characters with slight rotation/transform
                for (int i = 0; i < captchaCode.Length; i++)
                {
                    char c = captchaCode[i];
                    int x = 20 + (i * 28) + random.Next(-3, 3);
                    int y = 40 + random.Next(-4, 4);
                    int angle = random.Next(-15, 15);
                    string color = $"rgb({random.Next(0, 80)},{random.Next(0, 80)},{random.Next(0, 80)})";
                    
                    svgBuilder.Append($"<text x=\"{x}\" y=\"{y}\" font-family=\"monospace, sans-serif\" font-size=\"30\" font-weight=\"bold\" fill=\"{color}\" transform=\"rotate({angle} {x} {y})\">{c}</text>");
                }

                svgBuilder.Append("</svg>");

                var svgBytes = Encoding.UTF8.GetBytes(svgBuilder.ToString());
                var base64Svg = Convert.ToBase64String(svgBytes);
                var dataUrl = $"data:image/svg+xml;base64,{base64Svg}";

                return new CaptchaModel
                {
                    CaptchaID = captchaID,
                    Captcha = dataUrl,
                    Code = captchaCode
                };
            }
            catch (Exception ex)
            {
                // Fallback in case of any unexpected errors
                Console.WriteLine($"[Captcha Generate Error] {ex.Message}");
                return new CaptchaModel
                {
                    CaptchaID = captchaID,
                    Captcha = "",
                    Code = captchaCode
                };
            }
        }

        public bool IsCaptchaValid(string captchaId, string captchaValue, string storedValue)
        {
            return !string.IsNullOrEmpty(captchaId) && 
                   !string.IsNullOrEmpty(captchaValue) && 
                   captchaValue.ToUpperInvariant() == storedValue;
        }
    }
}
