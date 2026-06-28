using System.Threading.Tasks;

namespace NeoBoard.Application.Common.Interfaces
{
    public interface IFileService
    {
        /// <summary>
        /// Lưu ảnh từ chuỗi Base64
        /// </summary>
        /// <param name="base64Data">Dữ liệu ảnh base64</param>
        /// <param name="subFolder">Thư mục con (ví dụ: selfies, avatars)</param>
        /// <returns>URL tương đối của file sau khi lưu</returns>
        Task<string> SaveBase64ImageAsync(string base64Data, string subFolder);
        
        /// <summary>
        /// Xóa file
        /// </summary>
        bool DeleteFile(string relativePath);
    }
}
