namespace NeoBoard.Domain.Entities
{
    public class CaptchaModel
    {
        public string Captcha { get; set; }
        public string CaptchaID { get; set; }
        public string? Code { get; set; } // Dùng để lưu tạm mã captcha trước khi gửi về client
    }
}
