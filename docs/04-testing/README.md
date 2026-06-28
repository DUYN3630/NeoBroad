# 🧪 Chiến Lược Kiểm Thử — NeoBoard EDU-AMS

Dự án áp dụng mô hình kiểm thử phân tầng để đảm bảo độ tin cậy của hệ thống quản lý tài sản.

## 1. Unit Testing (Kiểm thử đơn vị)
- **Backend:** Sử dụng **Jest** (mặc định trong NestJS).
  - Kiểm tra logic của Service (Ví dụ: Thuật toán gen mã tài sản, tính ngày bảo trì).
- **Frontend:** Sử dụng **Vitest** + **React Testing Library**.
  - Kiểm tra các component UI (Button, Input, Form validation).

## 2. Integration Testing (Kiểm thử tích hợp)
- Kiểm tra sự phối hợp giữa Service và Database (sử dụng một database MySQL test riêng).
- Kiểm tra luồng Mượn/Trả có đảm bảo Transaction hoạt động đúng không.

## 3. E2E Testing (Kiểm thử toàn quy trình)
- **Công cụ:** **Playwright**.
- **Kịch bản chính:**
  - Sinh viên Đăng nhập -> Quét mã QR -> Nhấn mượn -> Kiểm tra trạng thái máy đã đổi sang "Borrowed" chưa.
  - Admin thêm thiết bị mới -> Kiểm tra mã tài sản có tự sinh đúng chuẩn không.

---

## 4. Các Lệnh Chạy Test

- **Backend:**
  - `npm run test` (Chạy toàn bộ unit test).
  - `npm run test:cov` (Xem độ bao phủ - Coverage).
- **Frontend:**
  - `npm run test` (Chạy vitest).

---

## 5. Tiêu Chuẩn Hoàn Thành (Definition of Done)
- Code mới phải có Unit Test đi kèm.
- Độ bao phủ (Code Coverage) tối thiểu 70%.
- Toàn bộ E2E test cho luồng Mượn/Trả phải vượt qua (Pass) trước khi Release.
