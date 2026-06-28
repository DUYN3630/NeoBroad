# 🛠️ Cài Đặt Môi Trường — NeoBoard EDU-AMS

Tài liệu này hướng dẫn thiết lập môi trường phát triển cho hệ thống quản lý tài sản dựa trên ASP.NET Core và MySQL.

## 1. Yêu Cầu Cài Đặt (Prerequisites)

### 1.1 .NET SDK 8.0 hoặc 9.0
- **Mục đích:** Môi trường chạy và phát triển cho Backend (C#).
- **Tải tại:** [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
- **Kiểm tra:** `dotnet --version`.

### 1.2 Node.js 20 LTS+
- **Mục đích:** Môi trường chạy cho Frontend (React/Vite).
- **Tải tại:** [nodejs.org](https://nodejs.org/)
- **Kiểm tra:** `node -v`.

### 1.3 MySQL 8.0+
- **Mục đích:** Cơ sở dữ liệu chính của hệ thống.
- **Cài đặt:** Cài bản Community Server hoặc sử dụng XAMPP/Docker.
- **Port mặc định:** `3306`.

### 1.4 Git
- **Mục đích:** Quản lý mã nguồn.

---

## 2. Công Cụ Phát Triển (IDE & Tools)

- **Visual Studio 2022** (Khuyên dùng cho Backend) hoặc **VS Code**.
- **MySQL Workbench** hoặc **DBeaver**: Để quản lý Database.
- **Postman**: Để test API.

---

## 3. Thiết Lập Dự Án (Local Setup)

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/your-repo/neoboard.git
cd neoboard
```

### Bước 2: Cấu hình Backend (ASP.NET Core)
1. Mở file `source/backend/NeoBoard.sln` bằng Visual Studio.
2. Cập nhật chuỗi kết nối trong `source/backend/NeoBoard.Web/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=neoboard;User=root;Password=yourpassword;"
   }
   ```
3. Chạy Migration để tạo DB:
   ```bash
   cd source/backend/NeoBoard.Web
   dotnet ef database update
   ```

### Bước 3: Cấu hình Frontend (React + Vite)
```bash
cd source/frontend
npm install
npm run dev
```
*Mặc định Frontend chạy tại: http://localhost:5173*

---

## 4. Kiểm Tra Sức Khỏe Môi Trường (Health Check)

| Thành phần | Lệnh kiểm tra | Kết quả mong đợi |
|---|---|---|
| .NET SDK | `dotnet --version` | `8.0.x` hoặc `9.0.x` |
| Node.js | `node -v` | `v20.x.x` |
| MySQL | `mysqladmin -u root -p status` | `Uptime: ...` |

---

## 5. Xử Lý Sự Cố Thường Gặp

### Lỗi: "Entity Framework Core tools are not installed"
- **Fix:** Chạy lệnh `dotnet tool install --global dotnet-ef`.

### Lỗi: "Vite is not recognized"
- **Fix:** Xóa thư mục `node_modules`, xóa `package-lock.json` và chạy lại `npm install`.
