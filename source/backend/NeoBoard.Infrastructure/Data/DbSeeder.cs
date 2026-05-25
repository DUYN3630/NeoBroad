using NeoBoard.Infrastructure.Data;
using NeoBoard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace NeoBoard.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        // 1. Seed Users
        var users = new List<User>();
        for (int i = 1; i <= 12; i++)
        {
            users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = $"user{i}@neobroad.com",
                PasswordHash = "BCrypt_Hash_Placeholder",
                FullName = $"User Number {i}",
                Role = i == 1 ? 0 : 3, // First user is Admin
                Department = i % 2 == 0 ? "IT" : "HR",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await context.Users.AddRangeAsync(users);

        // 2. Seed Assets
        var assets = new List<Asset>();
        var types = new[] { "Laptop", "Monitor", "Keyboard", "Mouse" };
        var statuses = new[] { "Available", "InUse", "Maintenance" };
        for (int i = 1; i <= 12; i++)
        {
            assets.Add(new Asset
            {
                Id = Guid.NewGuid(),
                Name = $"{types[i % 4]} Model {i}",
                SerialNumber = $"SN-{1000 + i}",
                Type = types[i % 4],
                Status = statuses[i % 3],
                Department = i % 3 == 0 ? "IT" : "Marketing",
                Price = 500 + (i * 100),
                CreatedAt = DateTime.UtcNow
            });
        }
        await context.Assets.AddRangeAsync(assets);

        // 3. Seed Toolsets
        var toolsets = new List<Toolset>();
        for (int i = 1; i <= 12; i++)
        {
            toolsets.Add(new Toolset
            {
                Id = Guid.NewGuid(),
                Name = $"Toolset Group {i}",
                Code = $"TS-{i:D3}",
                Description = $"Description for toolset {i}",
                TotalQuantity = 10,
                AvailableQuantity = 10,
                CreatedAt = DateTime.UtcNow
            });
        }
        await context.Toolsets.AddRangeAsync(toolsets);

        // 4. Seed Announcements
        var announcements = new List<Announcement>();
        for (int i = 1; i <= 12; i++)
        {
            announcements.Add(new Announcement
            {
                Id = Guid.NewGuid(),
                Title = $"Announcement {i}",
                Content = $"This is the content for announcement number {i}. Important updates!",
                Priority = i % 3,
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                AuthorId = users[0].Id
            });
        }
        await context.Announcements.AddRangeAsync(announcements);

        await context.SaveChangesAsync();
    }
}
