# 🧪 Chiến Lược Kiểm Thử — NeoBoard (EDU-AMS)

Dự án áp dụng mô hình kiểm thử phân tầng nghiêm ngặt để đảm bảo chất lượng, tính an toàn và bảo mật của hệ thống quản lý tài sản doanh nghiệp.

> [!IMPORTANT]
> Để xem chi tiết các kịch bản kiểm thử cho từng module nghiệp vụ (Auth, AMS Core, Borrow/Return, Blockchain, Kanban Maintenance, SignalR), vui lòng đọc tài liệu **[Kế hoạch Kiểm thử Toàn diện hệ thống (system-testing-plan.md)](file:///d:/ĐỒ ÁN/NeoBoard/docs/04-testing/system-testing-plan.md)**.

---

## 1. Các Tầng Kiểm Thử (Testing Layers)

### 1.1 Unit Testing (Kiểm thử đơn vị)
*   **Backend (.NET 9):** Sử dụng **xUnit** + **Moq** + **FluentAssertions**.
    *   Tập trung kiểm thử logic nghiệp vụ độc lập tại tầng Domain và Application (ví dụ: thuật toán tự sinh mã tài sản, công thức tính điểm sức khỏe thiết bị, băm giao dịch Blockchain).
*   **Frontend (React 19):** Sử dụng **Vitest** + **React Testing Library**.
    *   Kiểm thử hành vi của các component giao diện (AssetModal, ToolsetModal, TaskForm) và trạng thái global store (Zustand).

### 1.2 Integration Testing (Kiểm thử tích hợp)
*   **Backend Database:** Sử dụng **Testcontainers for .NET** chạy container MySQL 8.0 độc lập cho mỗi phiên chạy test tích hợp database.
*   **Backend API:** Sử dụng **WebApplicationFactory** để kiểm thử tích hợp các REST API endpoint thông qua HTTP Client ảo trong bộ nhớ.
*   **Frontend API Mocking:** Sử dụng **Mock Service Worker (MSW)** để chặn và trả về dữ liệu mock chuẩn hóa ở mức mạng.

### 1.3 End-to-End Testing (Kiểm thử toàn quy trình - E2E)
*   **Công cụ:** **Playwright** (chạy đa luồng, hỗ trợ giả lập giao diện di động cho cổng sinh viên/giảng viên và giả lập quét QR code).

---

## 2. Các Lệnh Chạy Test

### 2.1 Backend (.NET)
```bash
# Khởi chạy toàn bộ test suite (Unit & Integration)
dotnet test source/backend/NeoBoard.sln

# Chạy test và thu thập độ bao phủ code (Coverage)
dotnet test source/backend/NeoBoard.sln /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
```

### 2.2 Frontend (React)
```bash
# Chạy Vitest trong chế độ watch
cd source/frontend
npm run test

# Chạy test một lần duy nhất và thu thập độ bao phủ code
npm run test -- --run --coverage
```

---

## 3. Tiêu Chuẩn Hoàn Thành (Definition of Done)
*   Mọi tính năng mới hoặc bản sửa lỗi (bug fix) phải đi kèm unit test / integration test.
*   Độ bao phủ code (Coverage) phải đạt tối thiểu **85%** đối với Domain/Application backend và **70%** đối với Frontend UI.
*   Tất cả các bài kiểm tra E2E tự động phải vượt qua (Pass) 100% trước khi merge Pull Request vào các nhánh `develop` và `main`.
