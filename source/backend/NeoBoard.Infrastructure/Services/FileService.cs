using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using NeoBoard.Application.Common.Interfaces;

namespace NeoBoard.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private const string RootUploadFolder = "uploads";

        public FileService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> SaveBase64ImageAsync(string base64Data, string subFolder)
        {
            if (string.IsNullOrEmpty(base64Data)) return string.Empty;

            // Xử lý chuỗi base64 (loại bỏ prefix: data:image/jpeg;base64,)
            string base64String = base64Data;
            if (base64Data.Contains(","))
            {
                base64String = base64Data.Split(',')[1];
            }

            byte[] imageBytes = Convert.FromBase64String(base64String);

            // 1. Kiểm tra kích thước tệp tin (Tối đa 2MB = 2,097,152 bytes)
            if (imageBytes.Length > 2 * 1024 * 1024)
            {
                throw new ArgumentException("Kích thước tệp tin ảnh tải lên vượt quá giới hạn cho phép (tối đa 2MB).");
            }

            // 2. Kiểm tra định dạng tệp tin ảnh hợp lệ (jpg, png, webp)
            string extension = ".jpg";
            bool isValidImage = false;

            if (base64Data.StartsWith("data:image/jpeg", StringComparison.OrdinalIgnoreCase) || 
                base64Data.StartsWith("data:image/jpg", StringComparison.OrdinalIgnoreCase))
            {
                extension = ".jpg";
                isValidImage = true;
            }
            else if (base64Data.StartsWith("data:image/png", StringComparison.OrdinalIgnoreCase))
            {
                extension = ".png";
                isValidImage = true;
            }
            else if (base64Data.StartsWith("data:image/webp", StringComparison.OrdinalIgnoreCase))
            {
                extension = ".webp";
                isValidImage = true;
            }
            else if (!base64Data.Contains(","))
            {
                // Nếu là chuỗi Base64 thô không có Prefix, kiểm tra Magic Bytes (chữ ký nhị phân)
                if (imageBytes.Length >= 4)
                {
                    // JPEG: FF D8 FF
                    if (imageBytes[0] == 0xFF && imageBytes[1] == 0xD8 && imageBytes[2] == 0xFF)
                    {
                        extension = ".jpg";
                        isValidImage = true;
                    }
                    // PNG: 89 50 4E 47
                    else if (imageBytes[0] == 0x89 && imageBytes[1] == 0x50 && imageBytes[2] == 0x4E && imageBytes[3] == 0x47)
                    {
                        extension = ".png";
                        isValidImage = true;
                    }
                    // WEBP: RIFF .... WEBP
                    else if (imageBytes.Length >= 12 && 
                             imageBytes[0] == 0x52 && imageBytes[1] == 0x49 && imageBytes[2] == 0x46 && imageBytes[3] == 0x46 && 
                             imageBytes[8] == 0x57 && imageBytes[9] == 0x45 && imageBytes[10] == 0x42 && imageBytes[11] == 0x50)
                    {
                        extension = ".webp";
                        isValidImage = true;
                    }
                }
            }

            if (!isValidImage)
            {
                throw new ArgumentException("Định dạng ảnh không hợp lệ. Chỉ cho phép định dạng tệp tin ảnh là .jpg, .png hoặc .webp.");
            }
            
            // Tạo thư mục nếu chưa tồn tại
            string folderPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", RootUploadFolder, subFolder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Tạo tên file ngẫu nhiên với phần mở rộng động
            string fileName = $"{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(folderPath, fileName);

            await File.WriteAllBytesAsync(filePath, imageBytes);

            // Trả về relative path để truy cập qua URL
            return $"/{RootUploadFolder}/{subFolder}/{fileName}";
        }

        public bool DeleteFile(string relativePath)
        {
            try
            {
                string fullPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", relativePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
