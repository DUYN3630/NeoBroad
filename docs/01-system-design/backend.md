# 🏗️ Thiết Kế Backend — NeoBoard

## Kiến Trúc: Clean Architecture

```
NeoBoard Backend Solution
├── NeoBoard.Domain/              # Tầng lõi - Entities & Business Rules
│   ├── Entities/                 # Domain entities (User, Post, Survey...)
│   ├── Enums/                    # Enumerations
│   ├── Exceptions/               # Domain exceptions
│   └── Interfaces/               # Repository interfaces (contracts)
│
├── NeoBoard.Application/         # Tầng ứng dụng - Use Cases
│   ├── Common/                   # Shared: Result, PagedList, Behaviors
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Interfaces/               # Service interfaces
│   ├── Mappings/                 # AutoMapper profiles
│   ├── Validators/               # FluentValidation validators
│   └── Features/                 # CQRS - Commands & Queries (theo feature)
│       ├── Auth/
│       ├── Users/
│       ├── Timeline/
│       ├── Announcements/
│       ├── Surveys/
│       ├── Notifications/
│       └── Files/
│
├── NeoBoard.Infrastructure/      # Tầng hạ tầng - Implementation
│   ├── Data/
│   │   ├── AppDbContext.cs       # EF Core DbContext
│   │   ├── Configurations/      # Entity type configurations (Fluent API)
│   │   ├── Migrations/          # EF Core migrations
│   │   └── Seeders/             # Seed data
│   ├── Repositories/            # Repository implementations
│   ├── Services/                # External service implementations
│   │   ├── JwtService.cs
│   │   ├── EmailService.cs
│   │   ├── FileStorageService.cs
│   │   └── NotificationService.cs
│   └── DependencyInjection.cs   # IServiceCollection extensions
│
└── NeoBoard.Web/                 # Tầng trình bày - API Controllers
    ├── Controllers/              # API controllers
    │   ├── AuthController.cs
    │   ├── UsersController.cs
    │   ├── TimelineController.cs
    │   ├── AnnouncementsController.cs
    │   ├── SurveysController.cs
    │   ├── NotificationsController.cs
    │   └── FilesController.cs
    ├── Middleware/                # Custom middleware
    │   ├── ExceptionHandlingMiddleware.cs
    │   └── RequestLoggingMiddleware.cs
    ├── Filters/                  # Action filters
    ├── Extensions/               # App builder extensions
    ├── appsettings.json
    └── Program.cs                # Entry point + DI configuration
```

---

## Cấu Hình & Conventions

### 1. API Route Convention
```
/api/v1/{resource}              # Collection
/api/v1/{resource}/{id}         # Single item
/api/v1/{resource}/{id}/{sub}   # Sub-resource
```

**Ví dụ:**
```
GET    /api/v1/users              # Lấy danh sách users
GET    /api/v1/users/123          # Lấy user cụ thể
POST   /api/v1/users              # Tạo user mới
PUT    /api/v1/users/123          # Cập nhật user
DELETE /api/v1/users/123          # Xóa user
GET    /api/v1/users/123/posts    # Lấy posts của user
```

### 2. Response Format Chuẩn

```json
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Lấy dữ liệu thành công"
}

// Thành công + phân trang
{
  "success": true,
  "data": {
    "items": [ ... ],
    "totalCount": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  },
  "message": null
}

// Lỗi
{
  "success": false,
  "data": null,
  "message": "Không tìm thấy người dùng",
  "errors": [
    { "field": "email", "message": "Email đã tồn tại" }
  ]
}
```

### 3. Naming Convention

| Thứ | Convention | Ví dụ |
|---|---|---|
| Class / Interface | PascalCase | `UserService`, `IUserRepository` |
| Method | PascalCase | `GetUserByIdAsync()` |
| Property | PascalCase | `FirstName`, `CreatedAt` |
| Biến local | camelCase | `currentUser`, `totalCount` |
| Constant | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Private field | _camelCase | `_userRepository` |
| Controller | PascalCase + "Controller" | `UsersController` |
| DTO | PascalCase + Suffix | `UserDto`, `CreateUserRequest` |

### 4. Database Convention

| Thứ | Convention | Ví dụ |
|---|---|---|
| Table name | PascalCase, số nhiều | `Users`, `SurveyResponses` |
| Column name | PascalCase | `FirstName`, `CreatedAt` |
| Primary Key | `Id` | `Id` (Guid hoặc int) |
| Foreign Key | `{Entity}Id` | `UserId`, `PostId` |
| Index | `IX_{Table}_{Column}` | `IX_Users_Email` |
| Unique | `UQ_{Table}_{Column}` | `UQ_Users_Email` |

### 5. Middleware Pipeline (thứ tự trong Program.cs)

```csharp
// Program.cs - Thứ tự middleware QUAN TRỌNG
app.UseExceptionHandling();       // 1. Global error handling
app.UseHttpsRedirection();        // 2. Force HTTPS
app.UseCors("AllowFrontend");     // 3. CORS
app.UseAuthentication();          // 4. JWT Authentication
app.UseAuthorization();           // 5. Authorization
app.UseRequestLogging();          // 6. Request logging
app.MapControllers();             // 7. Route to controllers
```

### 6. Dependency Injection Pattern

```csharp
// Mỗi tầng có file DependencyInjection.cs riêng
// NeoBoard.Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IJwtService, JwtService>();
        // ... đăng ký các service khác

        return services;
    }
}

// Program.cs
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();
```

---

## Cấu Hình Quan Trọng

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=NeoBoard;..."
  },
  "Jwt": {
    "SecretKey": "...",
    "Issuer": "NeoBoard",
    "Audience": "NeoBoard-Client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "FileStorage": {
    "BasePath": "./uploads",
    "MaxFileSizeMB": 10,
    "AllowedExtensions": [".jpg", ".png", ".pdf", ".docx", ".xlsx"]
  },
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": ["Console", "File"]
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

---

## Checklist Trước Khi Code

- [ ] Tạo solution với 4 projects theo cấu trúc trên
- [ ] Cài NuGet packages cần thiết
- [ ] Cấu hình PostgreSQL connection
- [ ] Setup EF Core + DbContext
- [ ] Cấu hình JWT Authentication
- [ ] Setup Serilog logging
- [ ] Cấu hình CORS
- [ ] Tạo global exception handler middleware
- [ ] Setup Swagger
- [ ] Tạo base ApiResponse class
