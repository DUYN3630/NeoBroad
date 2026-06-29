using NeoBoard.Application.Common.Interfaces;
using NeoBoard.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace NeoBoard.Infrastructure.Services
{
    public class SecuritySettingsService : ISecuritySettingsService
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _filePath;
        private static readonly object _lock = new();

        public SecuritySettingsService(IWebHostEnvironment env)
        {
            _env = env;
            _filePath = Path.Combine(_env.ContentRootPath, "security_settings.json");
        }

        public Task<SecuritySettings> GetSettingsAsync()
        {
            if (!File.Exists(_filePath))
            {
                return Task.FromResult(new SecuritySettings());
            }

            lock (_lock)
            {
                try
                {
                    var json = File.ReadAllText(_filePath);
                    var settings = JsonSerializer.Deserialize<SecuritySettings>(json);
                    return Task.FromResult(settings ?? new SecuritySettings());
                }
                catch
                {
                    return Task.FromResult(new SecuritySettings());
                }
            }
        }

        public Task SaveSettingsAsync(SecuritySettings settings)
        {
            lock (_lock)
            {
                try
                {
                    var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(_filePath, json);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[SecuritySettingsService] Error saving settings: {ex.Message}");
                }
            }
            return Task.CompletedTask;
        }

        public bool IsLocalIp(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress)) return false;

            // Xử lý các dạng loopback đặc trưng
            if (ipAddress == "::1" || ipAddress == "127.0.0.1" || ipAddress.Equals("localhost", StringComparison.OrdinalIgnoreCase))
                return true;

            if (IPAddress.TryParse(ipAddress, out var ip))
            {
                if (IPAddress.IsLoopback(ip)) return true;

                var bytes = ip.GetAddressBytes();
                if (bytes.Length == 4) // IPv4
                {
                    // 10.0.0.0/8
                    if (bytes[0] == 10) return true;
                    // 172.16.0.0/12
                    if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
                    // 192.168.0.0/16
                    if (bytes[0] == 192 && bytes[1] == 168) return true;
                    // 169.254.0.0/16 (Link-local)
                    if (bytes[0] == 169 && bytes[1] == 254) return true;
                }
                else if (bytes.Length == 16) // IPv6
                {
                    // Link-local: fe80::/10
                    if (bytes[0] == 0xfe && (bytes[1] & 0xc0) == 0x80) return true;
                    // Unique local address: fc00::/7
                    if ((bytes[0] & 0xfe) == 0xfc) return true;
                }
            }
            return false;
        }
    }
}
