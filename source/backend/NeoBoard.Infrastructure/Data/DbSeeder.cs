using NeoBoard.Infrastructure.Data;
using NeoBoard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NeoBoard.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context, NeoBoard.Application.Common.Interfaces.IPasswordService passwordService)
        {
            Console.WriteLine("--- STARTING DATABASE SEEDING ---");
            
            try 
            {
                // 1. Danh sách tài khoản chuẩn
                var sv1Id = Guid.Parse("f4ee38f4-7891-4037-8520-bd2dc6d102c2");
                var sv2Id = Guid.Parse("00000000-0000-0000-0000-000000000002");
                var sv3Id = Guid.Parse("00000000-0000-0000-0000-000000000003");
                var sv4Id = Guid.Parse("00000000-0000-0000-0000-000000000004");

                var seedUsers = new List<(Guid Id, string Email, string Pass, string Name, int Role)>
                {
                    (Guid.Parse("00000000-0000-0000-0000-000000000001"), "admin@ams.com", "Admin@123", "Super Administrator", 0),
                    (Guid.Parse("00000000-0000-0000-0000-000000000011"), "admin1@ams.com", "Admin@123", "Quản trị viên 1", 0),
                    (Guid.Parse("00000000-0000-0000-0000-000000000012"), "admin2@ams.com", "Admin@123", "Quản trị viên 2", 0),
                    (Guid.Parse("00000000-0000-0000-0000-000000000013"), "admin3@ams.com", "Admin@123", "Quản trị viên 3", 0),

                    (Guid.Parse("00000000-0000-0000-0000-000000000021"), "staff@ams.com", "Staff@123", "Nguyễn Văn Nhân Viên", 1),
                    (Guid.Parse("00000000-0000-0000-0000-000000000022"), "staff1@ams.com", "Staff@123", "Kỹ thuật viên 1", 1),
                    (Guid.Parse("00000000-0000-0000-0000-000000000023"), "staff2@ams.com", "Staff@123", "Kỹ thuật viên 2", 1),
                    (Guid.Parse("00000000-0000-0000-0000-000000000024"), "staff3@ams.com", "Staff@123", "Kỹ thuật viên 3", 1),

                    (Guid.Parse("00000000-0000-0000-0000-000000000031"), "teacher1@ams.com", "Teacher@123", "Giảng viên 1", 2),
                    (Guid.Parse("00000000-0000-0000-0000-000000000032"), "teacher2@ams.com", "Teacher@123", "Giảng viên 2", 2),
                    (Guid.Parse("00000000-0000-0000-0000-000000000033"), "teacher3@ams.com", "Teacher@123", "Giảng viên 3", 2),

                    (sv1Id, "sv1001@student.edu.vn", "Student@123", "Sinh Viên Test 1", 3),
                    (sv2Id, "sv1002@student.edu.vn", "Student@123", "Sinh Viên Test 2", 3),
                    (sv3Id, "sv1003@student.edu.vn", "Student@123", "Sinh Viên Test 3", 3),
                    (sv4Id, "sv1004@student.edu.vn", "Student@123", "Sinh Viên Test 4", 3)
                };

                foreach (var item in seedUsers)
                {
                    var existing = await context.Users.FirstOrDefaultAsync(u => u.Email == item.Email);
                    if (existing == null)
                    {
                        Console.WriteLine($"Adding user: {item.Email}");
                        context.Users.Add(new User
                        {
                            Id = item.Id,
                            Email = item.Email,
                            PasswordHash = passwordService.HashPassword(item.Pass),
                            FullName = item.Name,
                            Role = item.Role,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                    else if (!existing.PasswordHash.StartsWith("$2b$"))
                    {
                        Console.WriteLine($"Updating user password to BCrypt: {item.Email}");
                        existing.PasswordHash = passwordService.HashPassword(item.Pass);
                        existing.Role = item.Role; // Ensure role is correct
                        context.Users.Update(existing);
                    }
                }
                
                await context.SaveChangesAsync();

                // 2. Seed Students search table
                var studentInfo = await context.Students.FirstOrDefaultAsync(s => s.StudentCode == "SV1001");
                if (studentInfo == null)
                {
                    Console.WriteLine("Seeding Student search record 1...");
                    context.Students.Add(new Student {
                        Id = sv1Id,
                        StudentCode = "SV1001",
                        FullName = "Sinh Viên Test 1",
                        ClassName = "DCT1211",
                        Email = "sv1001@student.edu.vn",
                        Department = "CNTT"
                    });
                }

                var studentInfo2 = await context.Students.FirstOrDefaultAsync(s => s.StudentCode == "SV1002");
                if (studentInfo2 == null)
                {
                    Console.WriteLine("Seeding Student search record 2...");
                    context.Students.Add(new Student {
                        Id = sv2Id,
                        StudentCode = "SV1002",
                        FullName = "Sinh Viên Test 2",
                        ClassName = "DCT1211",
                        Email = "sv1002@student.edu.vn",
                        Department = "CNTT"
                    });
                }

                var studentInfo3 = await context.Students.FirstOrDefaultAsync(s => s.StudentCode == "SV1003");
                if (studentInfo3 == null)
                {
                    Console.WriteLine("Seeding Student search record 3...");
                    context.Students.Add(new Student {
                        Id = sv3Id,
                        StudentCode = "SV1003",
                        FullName = "Sinh Viên Test 3",
                        ClassName = "DCT1211",
                        Email = "sv1003@student.edu.vn",
                        Department = "CNTT"
                    });
                }

                var studentInfo4 = await context.Students.FirstOrDefaultAsync(s => s.StudentCode == "SV1004");
                if (studentInfo4 == null)
                {
                    Console.WriteLine("Seeding Student search record 4...");
                    context.Students.Add(new Student {
                        Id = sv4Id,
                        StudentCode = "SV1004",
                        FullName = "Sinh Viên Test 4",
                        ClassName = "DCT1211",
                        Email = "sv1004@student.edu.vn",
                        Department = "CNTT"
                    });
                }

                await context.SaveChangesAsync();

                // 3. Seed Assets (Thiết bị)
                if (!await context.Assets.AnyAsync())
                {
                    Console.WriteLine("Seeding Assets...");
                    var assets = new List<Asset>
                    {
                        new Asset { Name = "Dell XPS 15 9530", AssetCode = "LAP-2026-0001", Type = "Laptop", SerialNumber = "SNDELLXPS001", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-12), Price = 38000000, WarrantyMonths = 24, WarrantyExpiration = DateTime.UtcNow.AddMonths(12), Department = "Phòng Kỹ thuật", Location = "Phòng Lab 1", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-3), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "MacBook Pro 14 M3 Pro", AssetCode = "LAP-2026-0002", Type = "Laptop", SerialNumber = "SNMACBOOK002", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-6), Price = 45000000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(6), Department = "Phòng Kỹ thuật", Location = "Phòng Lab 1", Custodian = "Super Administrator", LastMaintenance = DateTime.UtcNow.AddMonths(-1), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Lenovo ThinkPad X1 Carbon Gen 11", AssetCode = "LAP-2026-0003", Type = "Laptop", SerialNumber = "SNTHINKPAD003", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-18), Price = 42000000, WarrantyMonths = 36, WarrantyExpiration = DateTime.UtcNow.AddMonths(18), Department = "Phòng Kỹ thuật", Location = "Phòng Lab 2", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-5), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Asus ROG Zephyrus G14", AssetCode = "LAP-2026-0004", Type = "Laptop", SerialNumber = "SNROGZEPHY004", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-9), Price = 32000000, WarrantyMonths = 24, WarrantyExpiration = DateTime.UtcNow.AddMonths(15), Department = "Phòng Đào tạo", Location = "Phòng Tự học", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-2), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "HP EliteBook 840 G10", AssetCode = "LAP-2026-0005", Type = "Laptop", SerialNumber = "SNHPELITE005", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-4), Price = 26000000, WarrantyMonths = 24, WarrantyExpiration = DateTime.UtcNow.AddMonths(20), Department = "Phòng Hành chính", Location = "Văn phòng Đoàn", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = null, MaintenanceIntervalMonths = 6 },
                        
                        new Asset { Name = "Màn hình Dell UltraSharp U2422H 24\"", AssetCode = "MON-2026-0001", Type = "Monitor", SerialNumber = "SNDELLMON001", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-10), Price = 6500000, WarrantyMonths = 36, WarrantyExpiration = DateTime.UtcNow.AddMonths(26), Department = "Phòng Hành chính", Location = "Phòng Làm việc 1", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-2), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Màn hình ASUS ProArt PA278CV 27\"", AssetCode = "MON-2026-0002", Type = "Monitor", SerialNumber = "SNASUSMON002", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-8), Price = 9800000, WarrantyMonths = 36, WarrantyExpiration = DateTime.UtcNow.AddMonths(28), Department = "Phòng Đào tạo", Location = "Phòng Thiết kế", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-4), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Màn hình Gaming LG UltraGear 27GR75Q", AssetCode = "MON-2026-0003", Type = "Monitor", SerialNumber = "SNLGMON003", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-14), Price = 7200000, WarrantyMonths = 24, WarrantyExpiration = DateTime.UtcNow.AddMonths(10), Department = "Phòng Đào tạo", Location = "Phòng Lab Đồ họa", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-1), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Máy chiếu Epson EB-X51", AssetCode = "MON-2026-0004", Type = "Monitor", SerialNumber = "SNEPSONPROJ04", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-20), Price = 13500000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(-8), Department = "Phòng Đào tạo", Location = "Giảng đường A201", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-3), MaintenanceIntervalMonths = 6 },
                        
                        new Asset { Name = "Máy in HP LaserJet Pro M404dn", AssetCode = "PRN-2026-0001", Type = "Printer", SerialNumber = "SNHPPRINTER001", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-24), Price = 5500000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(-12), Department = "Phòng Hành chính", Location = "Sảnh chính", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-1), MaintenanceIntervalMonths = 3 },
                        new Asset { Name = "Máy in Canon LBP2900", AssetCode = "PRN-2026-0002", Type = "Printer", SerialNumber = "SNCANON002", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-36), Price = 3200000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(-24), Department = "Phòng Kế toán", Location = "Phòng Kế toán", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-2), MaintenanceIntervalMonths = 3 },
                        new Asset { Name = "Máy in màu đa năng Brother T720DW", AssetCode = "PRN-2026-0003", Type = "Printer", SerialNumber = "SNBROTHER003", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-11), Price = 6800000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(1), Department = "Phòng Nhân sự", Location = "Văn phòng Đoàn", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = DateTime.UtcNow.AddMonths(-2), MaintenanceIntervalMonths = 3 },
                        
                        new Asset { Name = "Switch Cisco Catalyst 2960 24-Port", AssetCode = "NET-2026-0001", Type = "Network", SerialNumber = "SNCISCOSW001", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-15), Price = 18000000, WarrantyMonths = 36, WarrantyExpiration = DateTime.UtcNow.AddMonths(21), Department = "Phòng Kỹ thuật", Location = "Phòng Server", Custodian = "Super Administrator", LastMaintenance = DateTime.UtcNow.AddMonths(-3), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Router Mikrotik RB4011iGS+", AssetCode = "NET-2026-0002", Type = "Network", SerialNumber = "SNMIKROTIK002", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-5), Price = 6200000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(7), Department = "Phòng Kỹ thuật", Location = "Phòng Server", Custodian = "Super Administrator", LastMaintenance = DateTime.UtcNow.AddMonths(-1), MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Bộ phát Wifi UniFi U6-Lite AP", AssetCode = "NET-2026-0003", Type = "Network", SerialNumber = "SNUNIFIWIFI003", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-3), Price = 3500000, WarrantyMonths = 12, WarrantyExpiration = DateTime.UtcNow.AddMonths(9), Department = "Phòng Kỹ thuật", Location = "Hành lang A1", Custodian = "Nguyễn Văn Nhân Viên", LastMaintenance = null, MaintenanceIntervalMonths = 6 },
                        new Asset { Name = "Firewall Fortinet FortiGate 60F", AssetCode = "NET-2026-0004", Type = "Network", SerialNumber = "SNFORTIGATE004", Status = "Active", PurchaseDate = DateTime.UtcNow.AddMonths(-7), Price = 14500000, WarrantyMonths = 24, WarrantyExpiration = DateTime.UtcNow.AddMonths(17), Department = "Phòng Kỹ thuật", Location = "Phòng Server", Custodian = "Super Administrator", LastMaintenance = null, MaintenanceIntervalMonths = 6 }
                    };
                    context.Assets.AddRange(assets);
                    await context.SaveChangesAsync();
                }

                // 4. Seed Toolsets (Bộ dụng cụ)
                if (!await context.Toolsets.AnyAsync())
                {
                    Console.WriteLine("Seeding Toolsets...");
                    var toolsets = new List<Toolset>
                    {
                        new Toolset { Name = "Bộ dụng cụ sửa máy tính chuyên nghiệp iFixit", Code = "TOOL-PC-01", Description = "Bao gồm tua vít đa năng 64 đầu, nhíp, keo tản nhiệt Noctua, vòng đeo tay chống tĩnh điện", TotalQuantity = 10, AvailableQuantity = 10, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ dụng cụ bấm mạng RJ45 & Khắc phục sự cố", Code = "TOOL-NET-02", Description = "Bao gồm kìm bấm mạng, máy test cáp mạng Noyafa, dao tuốt dây, hạt mạng RJ45 Cat6", TotalQuantity = 15, AvailableQuantity = 15, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ hàn mạch điện tử Weller & Đồng hồ vạn năng", Code = "TOOL-ELC-03", Description = "Bao gồm mỏ hàn thiếc điều chỉnh nhiệt độ, cuộn thiếc hàn, đồng hồ vạn năng kỹ thuật số Fluke 17B+", TotalQuantity = 8, AvailableQuantity = 8, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ thí nghiệm Vật lý quang học cơ bản", Code = "TOOL-PHY-04", Description = "Lăng kính thủy tinh, thấu kính hội tụ/phân kỳ, nguồn sáng Laser phục vụ học phần quang học", TotalQuantity = 20, AvailableQuantity = 20, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ hóa chất thí nghiệm hóa hữu cơ", Code = "TOOL-CHE-05", Description = "Ống nghiệm chịu nhiệt, giá đỡ, bộ cốc đong thủy tinh chia vạch và các chất phản ứng thông dụng", TotalQuantity = 12, AvailableQuantity = 12, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ dụng cụ vệ sinh thiết bị văn phòng chuyên dụng", Code = "TOOL-CLN-06", Description = "Bình khí nén xịt bụi, dung dịch vệ sinh màn hình LCD, khăn Microfiber, chổi cọ quét bụi", TotalQuantity = 25, AvailableQuantity = 25, CreatedAt = DateTime.UtcNow },
                        new Toolset { Name = "Bộ thí nghiệm Vi điều khiển Arduino Uno R3 Starter", Code = "TOOL-ARD-07", Description = "Board Arduino Uno R3 kèm dây cáp, Breadboard, cảm biến nhiệt độ, LCD 1602, LED, điện trở", TotalQuantity = 30, AvailableQuantity = 30, CreatedAt = DateTime.UtcNow }
                    };
                    context.Toolsets.AddRange(toolsets);
                    await context.SaveChangesAsync();
                }

                // 5. Seed UserActivities (Nhật ký truy cập)
                if (!await context.UserActivities.AnyAsync(a => a.Action.StartsWith("LOGIN")))
                {
                    Console.WriteLine("Seeding login activities...");
                    
                    var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@ams.com");
                    var staffUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "staff@ams.com");

                    var activities = new List<UserActivity>
                    {
                        new UserActivity
                        {
                            UserId = adminUser?.Id,
                            Action = "LOGIN_SUCCESS",
                            Description = "admin@ams.com (Thành công)",
                            IpAddress = "192.168.1.1",
                            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
                        },
                        new UserActivity
                        {
                            UserId = staffUser?.Id,
                            Action = "LOGIN_SUCCESS",
                            Description = "tech_01@ams.com (Thành công)",
                            IpAddress = "113.161.12.34",
                            CreatedAt = DateTime.UtcNow.AddMinutes(-25)
                        },
                        new UserActivity
                        {
                            UserId = null,
                            Action = "LOGIN_DENIED_IP",
                            Description = "guest_user (Bị từ chối - Giới hạn IP)",
                            IpAddress = "Unknown",
                            CreatedAt = DateTime.UtcNow.AddHours(-1)
                        }
                    };

                    context.UserActivities.AddRange(activities);
                    await context.SaveChangesAsync();
                }
                
                Console.WriteLine("--- DATABASE SEEDING COMPLETED ---");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR DURING SEEDING: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"INNER: {ex.InnerException.Message}");
            }
        }
    }
}
