# Phase 02 — Authentication (Xác Thực)

> **Mục tiêu**: Implement hệ thống đăng nhập/đăng ký với JWT (Access Token + Refresh Token).

---

## Tasks

### 1. Tạo User Entity
```csharp
// NeoBoard.Domain/Entities/User.cs
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

### 2. Tạo RefreshToken Entity

### 3. Implement IJwtService
```csharp
// Chức năng:
// - GenerateAccessToken(User user) → string
// - GenerateRefreshToken() → string
// - ValidateToken(string token) → ClaimsPrincipal?
// - GetUserIdFromToken(string token) → Guid?
```

### 4. Tạo Auth Endpoints

| Endpoint | Method | Body | Response | Mô tả |
|---|---|---|---|---|
| `/api/v1/auth/register` | POST | `{ email, password, fullName }` | `{ user, accessToken, refreshToken }` | Đăng ký |
| `/api/v1/auth/login` | POST | `{ email, password }` | `{ user, accessToken, refreshToken }` | Đăng nhập |
| `/api/v1/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` | Refresh token |
| `/api/v1/auth/logout` | POST | `{ refreshToken }` | `{ message }` | Đăng xuất (revoke token) |
| `/api/v1/auth/me` | GET | — | `{ user }` | Lấy thông tin user hiện tại |

### 5. Cấu hình JWT Authentication Middleware
```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:SecretKey"]!))
        };
    });
```

### 6. Password Hashing (BCrypt)
### 7. Validation (FluentValidation)
### 8. Seed Super Admin Account

---

## Acceptance Criteria

- [ ] Đăng ký tạo user mới, hash password, trả JWT token
- [ ] Đăng nhập đúng email/password → trả JWT token
- [ ] Đăng nhập sai → trả lỗi 401
- [ ] Refresh token → cấp access token mới
- [ ] Logout → revoke refresh token
- [ ] API `/auth/me` trả user info khi có valid token
- [ ] Super Admin seed khi chạy migration

## Dependencies
- Phase 01 (Foundation) hoàn thành
