using NeoBoard.Domain.Entities;
using System.Threading.Tasks;

namespace NeoBoard.Application.Common.Interfaces
{
    public interface ISecuritySettingsService
    {
        Task<SecuritySettings> GetSettingsAsync();
        Task SaveSettingsAsync(SecuritySettings settings);
        bool IsLocalIp(string ipAddress);
    }
}
