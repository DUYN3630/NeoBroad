# Phase 01 — Foundation (Nền Tảng Backend)

> **Mục tiêu**: Thiết lập solution structure, cài packages, cấu hình cơ bản để các phase sau build trên nền này.

---

## Tasks

### 1. Tạo Solution Structure
```bash
# Tạo solution
dotnet new sln -n NeoBoard

# Tạo 4 projects
dotnet new classlib -n NeoBoard.Domain -o NeoBoard.Domain
dotnet new classlib -n NeoBoard.Application -o NeoBoard.Application
dotnet new classlib -n NeoBoard.Infrastructure -o NeoBoard.Infrastructure
dotnet new webapi -n NeoBoard.Web -o NeoBoard.Web

# Thêm vào solution
dotnet sln add NeoBoard.Domain NeoBoard.Application NeoBoard.Infrastructure NeoBoard.Web

# Thiết lập references (dependency hướng vào trong)
dotnet add NeoBoard.Application reference NeoBoard.Domain
dotnet add NeoBoard.Infrastructure reference NeoBoard.Domain
dotnet add NeoBoard.Infrastructure reference NeoBoard.Application
dotnet add NeoBoard.Web reference NeoBoard.Application
dotnet add NeoBoard.Web reference NeoBoard.Infrastructure
```

### 2. Install NuGet Packages

**NeoBoard.Domain** — Không cần package nào (pure C#)

**NeoBoard.Application**
```bash
dotnet add package MediatR
dotnet add package AutoMapper
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
```

**NeoBoard.Infrastructure**
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package BCrypt.Net-Next
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Console
```

**NeoBoard.Web**
```bash
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### 3. Cấu hình AppDbContext
```csharp
// NeoBoard.Infrastructure/Data/AppDbContext.cs
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    // ... thêm DbSet cho các entity khác

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

### 4. Tạo Base Response Class
```csharp
// NeoBoard.Application/Common/ApiResponse.cs
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<FieldError>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
```

### 5. Cấu hình CORS
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 6. Setup Global Exception Handling Middleware
### 7. Setup Serilog Logging
### 8. Setup Swagger/OpenAPI
### 9. Tạo Initial Migration

---

## Acceptance Criteria

- [ ] Solution chạy được `dotnet run` không lỗi
- [ ] Swagger hiện tại `https://localhost:5001/swagger`
- [ ] Kết nối PostgreSQL thành công
- [ ] Migration tạo database thành công
- [ ] CORS cho phép frontend localhost:5173
- [ ] Logging ghi vào console + file
- [ ] Global exception handler catch lỗi, trả JSON format chuẩn

## Dependencies
- Không phụ thuộc phase nào khác (đây là phase đầu tiên)
