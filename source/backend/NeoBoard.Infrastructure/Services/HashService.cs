using System.Security.Cryptography;
using System.Text;
using NeoBoard.Application.Common.Interfaces;

namespace NeoBoard.Infrastructure.Services
{
    public class HashService : IHashService
    {
        public string ComputeHash(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }

        public string ComputeTransactionHash(string studentCode, string assetId, string selfieUrl, string previousHash, DateTime timestamp)
        {
            // Định dạng ngày giờ dạng chuẩn giây yyyy-MM-dd HH:mm:ss để tránh mất chính xác khi lưu xuống DB
            string formattedTime = timestamp.ToString("yyyy-MM-dd HH:mm:ss");
            string input = $"{studentCode}|{assetId}|{selfieUrl}|{previousHash}|{formattedTime}";
            return ComputeHash(input);
        }

        public bool VerifyHash(string input, string hash)
        {
            string computedHash = ComputeHash(input);
            return computedHash.Equals(hash, StringComparison.OrdinalIgnoreCase);
        }
    }
}
