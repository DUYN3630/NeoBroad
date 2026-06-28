using BCrypt.Net;
using NeoBoard.Application.Common.Interfaces;

namespace NeoBoard.Infrastructure.Services
{
    public class PasswordService : IPasswordService
    {
        public string HashPassword(string password)
        {
            // Use BCrypt with a default work factor (11)
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                // In case of legacy SHA256 or invalid hashes during transition
                return false;
            }
        }
    }
}
