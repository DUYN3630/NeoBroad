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
            // Kết hợp các thành phần để tạo chuỗi input cho hash (Blockchain-lite style)
            string input = $"{studentCode}|{assetId}|{selfieUrl}|{previousHash}|{timestamp.Ticks}";
            return ComputeHash(input);
        }

        public bool VerifyHash(string input, string hash)
        {
            string computedHash = ComputeHash(input);
            return computedHash.Equals(hash, StringComparison.OrdinalIgnoreCase);
        }
    }
}
