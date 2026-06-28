using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;

namespace NeoBoard.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public NewsController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public IActionResult GetTechNews()
        {
            var mockNews = new[]
            {
                new {
                    title = "Phòng Lab mới nhập 10 bộ kính thực tế ảo Apple Vision Pro & Meta Quest 3",
                    description = "Đăng ký mượn ngay hôm nay tại NeoBoard để trải nghiệm làm đồ án thực tế ảo (VR/AR) và nghiên cứu khoa học tiên tiến.",
                    url = "https://tuyensinh.uit.edu.vn/",
                    coverImage = "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=60",
                    publishedAt = System.DateTime.UtcNow.AddHours(-2),
                    author = "Admin Phòng Lab"
                },
                new {
                    title = "Hackathon NeoBoard 2026: Sân chơi lập trình lớn nhất năm cho sinh viên Công nghệ",
                    description = "Tổng giá trị giải thưởng lên đến 50 triệu đồng cùng cơ hội thực tập trực tiếp tại các tập đoàn công nghệ hàng đầu.",
                    url = "https://tuyensinh.uit.edu.vn/",
                    coverImage = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=60",
                    publishedAt = System.DateTime.UtcNow.AddHours(-14),
                    author = "Khoa CNTT"
                },
                new {
                    title = "Nhận miễn phí tài khoản ChatGPT Plus & Gemini Advanced cho Sinh viên",
                    description = "Hướng dẫn chi tiết nhận tài khoản AI bản quyền thông qua gói tài trợ chuyển đổi số giáo dục học kỳ này.",
                    url = "https://tuyensinh.uit.edu.vn/",
                    coverImage = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60",
                    publishedAt = System.DateTime.UtcNow.AddDays(-1),
                    author = "Phòng Công nghệ"
                },
                new {
                    title = "Thay đổi quy chế: Nâng hạn mức mượn thiết bị lên đến 14 ngày cho Đồ án Tốt nghiệp",
                    description = "Chính sách mới được phê duyệt hỗ trợ tối đa cho sinh viên năm cuối thực hiện khóa luận tốt nghiệp.",
                    url = "https://tuyensinh.uit.edu.vn/",
                    coverImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=60",
                    publishedAt = System.DateTime.UtcNow.AddDays(-2),
                    author = "Phòng Đào tạo"
                },
                new {
                    title = "Mẹo tối ưu dung lượng RAM và dọn dẹp hệ điều hành máy tính cho Sinh viên",
                    description = "Chia sẻ các bước tối ưu giúp máy tính cá nhân chạy mượt mà khi code, làm đồ họa hoặc thiết kế 3D.",
                    url = "https://tuyensinh.uit.edu.vn/",
                    coverImage = "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&auto=format&fit=crop&q=60",
                    publishedAt = System.DateTime.UtcNow.AddDays(-3),
                    author = "CLB Tin Học"
                }
            };

            return Ok(mockNews);
        }
    }

    public class DevToArticle
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? CoverImage { get; set; }
        public string? SocialImage { get; set; }
        public System.DateTime PublishedAt { get; set; }
        public DevToUser? User { get; set; }
    }

    public class DevToUser
    {
        public string Name { get; set; } = string.Empty;
    }
}
