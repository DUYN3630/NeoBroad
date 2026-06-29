namespace NeoBoard.Domain.Entities
{
    public class CaptchaModel
    {
        public string Captcha { get; set; } = string.Empty;
        public string CaptchaID { get; set; } = string.Empty;
        public string? Code { get; set; } // Dùng để lưu tạm mã captcha trước khi gửi về client
    }
}
