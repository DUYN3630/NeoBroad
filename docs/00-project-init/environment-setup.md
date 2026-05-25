# 🖥️ Hướng Dẫn Cài Đặt Môi Trường — NeoBoard

## Bước 1: Cài Đặt Phần Mềm Cần Thiết

### 1.1 .NET SDK 9

```bash
# Tải tại: https://dotnet.microsoft.com/download/dotnet/9.0
# Kiểm tra sau khi cài:
dotnet --version
```

### 1.2 Node.js 20 LTS

```bash
# Tải tại: https://nodejs.org/
# Hoặc dùng nvm-windows:
nvm install 20
nvm use 20

# Kiểm tra:
node --version
npm --version
```

### 1.3 PostgreSQL 16+

```bash
# Tải tại: https://www.postgresql.org/download/
# Ghi nhớ password của user 'postgres' khi cài

# Hoặc chạy bằng Docker:
docker run -d \
  --name neoboard-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=NeoBoard \
  -p 5432:5432 \
  postgres:16
```

### 1.4 Git

```bash
# Tải tại: https://git-scm.com/
git --version
```

### 1.5 IDE (Khuyến nghị)

- **Visual Studio 2022** (Community) — cho backend .NET
- **VS Code** — cho frontend React (cài extensions: ESLint, Prettier, ES7 Snippets)
- **Rider** — IDE all-in-one (cả .NET lẫn React)

---

## Bước 2: Clone & Cấu Hình Dự Án

### 2.1 Clone repository

```bash
git clone <repo-url> Vide_code
cd Vide_code
```

### 2.2 Cấu hình Backend

```bash
cd source/backend

# Restore NuGet packages
dotnet restore

# Tạo file cấu hình local (KHÔNG commit file này)
# Copy appsettings.json → appsettings.Development.json
# Sửa connection string:
```

```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=NeoBoard;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-at-least-32-chars-long!!!",
    "Issuer": "NeoBoard",
    "Audience": "NeoBoard-Client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

### 2.3 Tạo Database

```bash
cd source/backend/NeoBoard.Web

# Chạy migration
dotnet ef database update

# Nếu chưa có migration tool:
dotnet tool install --global dotnet-ef
```

### 2.4 Cấu hình Frontend

```bash
cd source/frontend

# Install dependencies
npm install

# Tạo file .env.local (KHÔNG commit file này)
```

```env
# .env.local
VITE_API_BASE_URL=https://localhost:5001/api
VITE_APP_NAME=NeoBoard
```

---

## Bước 3: Chạy Dự Án

### 3.1 Chạy Backend

```bash
cd source/backend/NeoBoard.Web
dotnet run

# API sẽ chạy tại:
# https://localhost:5001
# Swagger: https://localhost:5001/swagger
```

### 3.2 Chạy Frontend

```bash
cd source/frontend
npm run dev

# App sẽ chạy tại:
# http://localhost:5173
```

### 3.3 Chạy bằng Docker Compose (tùy chọn)

```bash
cd Vide_code
docker-compose up -d

# Sẽ khởi động:
# - PostgreSQL (port 5432)
# - Backend API (port 5001)
# - Frontend (port 5173)
```

---

## Bước 4: Kiểm Tra Cài Đặt

| Kiểm tra      | Lệnh / URL                       | Kết quả mong đợi    |
| ------------- | -------------------------------- | ------------------- |
| .NET SDK      | `dotnet --version`               | `9.x.x`             |
| Node.js       | `node --version`                 | `v20.x.x`           |
| PostgreSQL    | `psql --version`                 | `16.x`              |
| Backend API   | `https://localhost:5001/swagger` | Trang Swagger hiện  |
| Frontend      | `http://localhost:5173`          | Trang NeoBoard hiện |
| DB Connection | Chạy `dotnet ef database update` | Không lỗi           |

---

## Xử Lý Lỗi Thường Gặp

### Lỗi: "Connection refused" khi kết nối PostgreSQL

```
Nguyên nhân: PostgreSQL chưa chạy hoặc sai port
Fix: Kiểm tra service PostgreSQL đang chạy → kiểm tra port 5432
```

### Lỗi: "dotnet ef not found"

```bash
dotnet tool install --global dotnet-ef
# Restart terminal sau khi cài
```

### Lỗi: CORS khi frontend gọi API

```
Nguyên nhân: Backend chưa cấu hình CORS
Fix: Xem docs/02-backend/phase-01-foundation.md → phần CORS configuration
```

### Lỗi: "HTTPS certificate not trusted"

```bash
dotnet dev-certs https --trust
```
