# 🏗️ Kiến Trúc Backend (ASP.NET Core) — NeoBoard EDU-AMS

## 1. Cấu Trúc Clean Architecture

Backend được tổ chức theo mô hình Clean Architecture, tách biệt rõ ràng giữa các lớp:

```
source/backend/
├── NeoBoard.Domain/         # Core: Entities, Interfaces, Domain Logic
├── NeoBoard.Application/    # Use Cases: DTOs, Mappings, Services
├── NeoBoard.Infrastructure/ # Data Access: DbContext, Repositories, Migrations
└── NeoBoard.Web/            # Entry Point: Controllers, Program.cs, Settings
```

## 2. Luồng Xử Lý (Request Lifecycle)

1. **Client** gửi Request -> **Middleware** (Authentication, Logging).
2. **Controller** (Web) tiếp nhận Request.
3. **Application Service** (Application) thực hiện logic nghiệp vụ.
4. **Repository/DbContext** (Infrastructure) tương tác với MySQL.
5. **Domain Entities** (Domain) đại diện cho dữ liệu và quy tắc cốt lõi.
6. Kết quả trả về qua **DTO** để đảm bảo an toàn dữ liệu.

## 3. Quy Tắc Đặt Tên (Naming Convention)

| Đối tượng | Quy tắc | Ví dụ |
|---|---|---|
| Class | PascalCase | `AssetController`, `UserService` |
| Interface | IPascalCase | `IUserRepository` |
| Method | PascalCase | `GetAssetById()` |
| Variable | camelCase | `assetId` |
| DTO | PascalCase + Suffix | `LoginRequest`, `UserDto` |

---

## 4. Công Nghệ Sử Dụng

- **Entity Framework Core:** Quản lý cơ sở dữ liệu và truy vấn.
- **JWT Authentication:** Bảo mật hệ thống thông qua token.
- **Kendo UI:** Các thành phần giao diện phía server.
- **Dependency Injection:** Tích hợp sẵn trong ASP.NET Core để quản lý vòng đời đối tượng.
