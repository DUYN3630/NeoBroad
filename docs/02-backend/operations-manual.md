# 📖 Operations Manual — Hướng Dẫn Vận Hành Backend NeoBoard

> Tài liệu này dành cho developer/devops khi vận hành, triển khai, và bảo trì hệ thống backend.

---

## 1. Khởi Động Dự Án

### Lần đầu tiên
```bash
# 1. Clone repo
git clone <repo-url>
cd Vide_code/source/backend

# 2. Restore packages
dotnet restore

# 3. Tạo file cấu hình local
cp NeoBoard.Web/appsettings.json NeoBoard.Web/appsettings.Development.json
# Sửa connection string, JWT secret trong file Development

# 4. Tạo database
dotnet ef database update --project NeoBoard.Infrastructure --startup-project NeoBoard.Web

# 5. Chạy
cd NeoBoard.Web
dotnet run
```

### Lần chạy thường
```bash
cd source/backend/NeoBoard.Web
dotnet run
# Hoặc: dotnet watch run (hot reload)
```

---

## 2. Cấu Hình Môi Trường

### appsettings Structure
```
appsettings.json                 ← Config mặc định (commit)
appsettings.Development.json     ← Config dev local (KHÔNG commit)
appsettings.Production.json      ← Config production (KHÔNG commit)
```

### Biến môi trường quan trọng
| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `ConnectionStrings.DefaultConnection` | PostgreSQL connection string | ✅ |
| `Jwt.SecretKey` | JWT signing key (≥32 chars) | ✅ |
| `Jwt.Issuer` | JWT issuer | ✅ |
| `Jwt.Audience` | JWT audience | ✅ |
| `Jwt.AccessTokenExpirationMinutes` | Thời hạn access token | ✅ |
| `Jwt.RefreshTokenExpirationDays` | Thời hạn refresh token | ✅ |
| `FileStorage.BasePath` | Thư mục lưu file upload | ✅ |
| `FileStorage.MaxFileSizeMB` | Giới hạn size file | ✅ |
| `Cors.AllowedOrigins` | Frontend URLs | ✅ |

### Tạo JWT Secret Key
```bash
# Tạo key random an toàn
openssl rand -base64 64
# Hoặc dùng dotnet:
dotnet user-secrets set "Jwt:SecretKey" "your-super-secret-key..."
```

---

## 3. Database Operations

### Migration Commands
```bash
# Tạo migration mới
dotnet ef migrations add <MigrationName> \
  --project NeoBoard.Infrastructure \
  --startup-project NeoBoard.Web

# Apply migration
dotnet ef database update \
  --project NeoBoard.Infrastructure \
  --startup-project NeoBoard.Web

# Rollback migration
dotnet ef database update <PreviousMigrationName> \
  --project NeoBoard.Infrastructure \
  --startup-project NeoBoard.Web

# Xóa migration cuối (chưa apply)
dotnet ef migrations remove \
  --project NeoBoard.Infrastructure \
  --startup-project NeoBoard.Web

# Tạo SQL script từ migration
dotnet ef migrations script \
  --project NeoBoard.Infrastructure \
  --startup-project NeoBoard.Web \
  --output migration.sql
```

### Backup & Restore
```bash
# Backup PostgreSQL
pg_dump -U postgres -h localhost NeoBoard > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -h localhost NeoBoard < backup_20260407.sql

# Backup chỉ schema
pg_dump -U postgres --schema-only NeoBoard > schema.sql

# Backup chỉ data
pg_dump -U postgres --data-only NeoBoard > data.sql
```

### Seed Data
```bash
# Seed data được chạy tự động khi database update
# Hoặc chạy manual:
dotnet run --project NeoBoard.Web -- --seed
```

---

## 4. Monitoring & Health Check

### Health Check Endpoint
```
GET /health          → 200 OK nếu system healthy
GET /health/ready    → 200 OK nếu tất cả dependencies ready (DB, cache, etc.)
```

### Health Check Setup
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "database")
    .AddCheck("disk_space", () => /* check disk */);

app.MapHealthChecks("/health");
```

### Logging Configuration (Serilog)
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/neoboard-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  }
}
```

### Log Levels
| Level | Khi nào dùng |
|---|---|
| `Debug` | Chi tiết kỹ thuật (chỉ dev) |
| `Information` | Request/response, business events |
| `Warning` | Điều bất thường nhưng không lỗi |
| `Error` | Exception caught, cần xem xét |
| `Fatal` | App crash, cần action ngay |

---

## 5. Troubleshooting Guide

### Lỗi thường gặp khi vận hành

#### Database connection refused
```
Triệu chứng: "Npgsql.NpgsqlException: Failed to connect"
Kiểm tra:
1. PostgreSQL service đang chạy?
2. Connection string đúng host/port/username/password?
3. Database "NeoBoard" đã tạo chưa?
4. pg_hba.conf cho phép kết nối từ host?
```

#### Migration pending
```
Triệu chứng: "There are pending model changes"
Fix: dotnet ef database update
```

#### JWT token invalid
```
Triệu chứng: 401 Unauthorized cho mọi request
Kiểm tra:
1. SecretKey trong appsettings giống key khi tạo token?
2. Token đã hết hạn?
3. Issuer/Audience match?
```

#### File upload fails
```
Triệu chứng: 413 Entity Too Large hoặc 400
Kiểm tra:
1. File size > MaxFileSizeMB?
2. File extension nằm trong AllowedExtensions?
3. Upload folder có quyền write?
4. Kestrel MaxRequestBodySize config đủ chưa?
```

---

## 6. API Documentation (Swagger)

### Truy cập
- Development: `https://localhost:5001/swagger`
- Cấu hình JWT token trong Swagger UI: Nhấn "Authorize" → paste Bearer token

### Export OpenAPI Spec
```bash
# Swagger JSON endpoint
curl https://localhost:5001/swagger/v1/swagger.json > openapi.json
```

---

## 7. Security Checklist

- [ ] **HTTPS only** — redirect HTTP → HTTPS
- [ ] **CORS** — chỉ allow domains cụ thể
- [ ] **JWT secret** — ít nhất 256 bits, không hardcode
- [ ] **Password hashing** — BCrypt, cost factor ≥ 12
- [ ] **Input validation** — FluentValidation cho mọi endpoint
- [ ] **SQL injection** — EF Core parameterized queries (mặc định an toàn)
- [ ] **Rate limiting** — ASP.NET Core RateLimiter middleware
- [ ] **File upload** — validate extension, size, rename to UUID
- [ ] **Sensitive data** — không log password, token, PII
- [ ] **Headers** — X-Content-Type-Options, X-Frame-Options, CSP

---

## 8. Performance Notes

### Database
- Đã tạo index cho các query thường dùng (xem `database-design.md`)
- Sử dụng `AsNoTracking()` cho read-only queries
- Pagination bắt buộc cho list endpoints (max 100 items/page)

### Caching Strategy (v2)
- Response caching cho static endpoints
- In-memory cache cho configuration data
- Distributed cache (Redis) cho production

### Query Optimization
- Dùng `Include()` cẩn thận — chỉ include khi cần
- Dùng `Select()` projection thay vì load toàn bộ entity
- Monitor slow queries qua EF Core logging
