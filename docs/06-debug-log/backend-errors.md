# 🐛 Backend Errors Log

> Lỗi backend đã gặp và cách fix. Đọc file này TRƯỚC khi debug.
> Format: xem `README.md`

---

<!-- GHI LỖI MỚI Ở ĐÂY (mới nhất trên cùng) -->

## [2026-05-25] — Lỗi 500 Internal Server Error (Database Connection Failed)

**🏷️ Tags:** #backend #postgresql #db-connection #500-error
**📌 File liên quan:** `appsettings.json`, `NeoBoard.Infrastructure\Data\AppDbContext.cs`

**🔴 Triệu chứng:**
> Các API endpoints (`/api/v1/Assets`, `/api/v1/Toolsets`, `/api/v1/Maintenance/DashboardStats`) trả về mã lỗi **500**. Frontend báo lỗi `AxiosError: Request failed with status code 500`.

**🔍 Nguyên nhân gốc:**
> Backend không thể kết nối tới cơ sở dữ liệu PostgreSQL. Các nguyên nhân khả thi:
> 1. Dịch vụ PostgreSQL chưa chạy trên port 5432.
> 2. Database `NeoBoard_DB` chưa được tạo.
> 3. Thông tin đăng nhập (Username/Password) trong `appsettings.json` không chính xác.

**✅ Cách fix:**
> 1. Kiểm tra PostgreSQL service: Đảm bảo PostgreSQL đang chạy (Lệnh: `netstat -ano | findstr :5432`).
> 2. Nếu dùng Docker: Chạy `docker-compose up -d` trong thư mục `Vide_code`.
> 3. Kiểm tra chuỗi kết nối trong `appsettings.json`:
>    - Host: `localhost`
>    - Port: `5432`
>    - Database: `NeoBoard_DB`
>    - Username: `postgres`
>    - Password: (Kiểm tra lại password thực tế của bạn)
> 4. Chạy Migration để tạo bảng: `cd source/backend/NeoBoard.Web && dotnet ef database update`.

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn kiểm tra kết nối Database trước khi chạy Backend. Sử dụng các công cụ như `pgAdmin` hoặc `psql` để thử kết nối thủ công trước.

---


**🏷️ Tags:** #backend #compilation #refactor
**📌 File liên quan:** Tất cả các Controller trong `NeoBoard.Web\Controllers`

**🔴 Triệu chứng:**
> `Build failed with 33 error(s)`. Các lỗi `error CS0246: The type or namespace name 'Asset' could not be found`.

**🔍 Nguyên nhân gốc:**
> Các Controller cũ vẫn tham chiếu đến các class `Asset`, `MaintenanceTicket`, `AmsUser`... đã bị xóa để chuyển sang hệ thống NeoBoard mới.

**✅ Cách fix:**
> 1. Xóa các Controller cũ của dự án AMS (`Assets`, `Maintenance`, `SpareParts`, `Tasks`, `Toolsets`, `Roles`, `Users`, `Account`, `Home`, `Reports`).
> 2. Cập nhật `AuthController.cs` và `NotificationsController.cs` để tương thích với Domain Model và Database mới.
> 3. Build lại thành công.

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn giữ sự đồng nhất giữa Domain (Entities) và Web API (Controllers) trong kiến trúc Clean Architecture.

---

## [2026-04-10] — Lỗi kết nối ERR_CONNECTION_REFUSED & Outdated Endpoints

**🏷️ Tags:** #backend #connection #api #outdated
**📌 File liên quan:** `appsettings.json`, `launchSettings.json`, `.env`

**🔴 Triệu chứng:**
> Frontend báo lỗi `Failed to load resource: net::ERR_CONNECTION_REFUSED` tại `http://localhost:5054/api/v1/...` và không hiển thị dữ liệu.

**🔍 Nguyên nhân gốc:**
> 1. Backend chưa khởi chạy sau khi cấu hình lại PostgreSQL.
> 2. Frontend vẫn đang gọi các endpoint của dự án cũ (AMS): `/api/v1/Assets`, `/api/v1/Maintenance/DashboardStats`.

**✅ Cách fix:**
> 1. Chạy Backend: `cd source/backend/NeoBoard.Web && dotnet run`.
> 2. (Kế hoạch) Cập nhật Frontend để gọi đúng các API mới của NeoBoard theo thiết kế.

**⚡ AI Fix Speed:** ⚡ Vừa

**💡 Bài học:** Luôn kiểm tra trạng thái chạy của Backend và đồng bộ các API endpoints giữa Frontend và Backend sau khi refactor.

**⚠️ Cảnh báo cho AI:** Cần cập nhật lại code Frontend để khớp với các Entity mới đã tạo trong Database NeoBoard.

---

## [2026-04-09] — Lỗi trùng lặp LoginRequest (CS0101)

**🏷️ Tags:** #backend #compilation #dto
**📌 File liên quan:** `NeoBoard.Application\DTOs\LoginRequest.cs` và `AuthDto.cs`

**🔴 Triệu chứng:**
> `error CS0101: The namespace 'NeoBoard.Application.DTOs' already contains a definition for 'LoginRequest'`

**🔍 Nguyên nhân gốc:**
> Class `LoginRequest` được định nghĩa trong cả hai file `LoginRequest.cs` và `AuthDto.cs` trong cùng một namespace.

**✅ Cách fix:**
```powershell
del "assets-management\Vide_code\source\backend\NeoBoard.Application\DTOs\LoginRequest.cs"
```
> Giữ lại định nghĩa trong `AuthDto.cs` để quản lý tập trung các DTO liên quan đến Auth.

**⚡ AI Fix Speed:** ⚡ Cực nhanh

**💡 Bài học:** Kiểm tra kỹ các file DTO khi copy-paste code từ các dự án khác để tránh định nghĩa class trùng lặp.

**⚠️ Cảnh báo cho AI:** Luôn dùng `grep_search` để tìm class trước khi tạo mới.

---

## [2026-04-07] — Template Entry (Xóa entry này khi có lỗi thật)

**🏷️ Tags:** #backend #template
**📌 File liên quan:** `N/A`

**🔴 Triệu chứng:**
> Đây là entry mẫu, xóa khi có lỗi thật đầu tiên

**🔍 Nguyên nhân gốc:**
> Template

**✅ Cách fix:**
```
Không có
```

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn ghi log lỗi ngay sau khi fix

**⚠️ Cảnh báo cho AI:** N/A

---
