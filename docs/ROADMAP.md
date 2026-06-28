# 🚀 LỘ TRÌNH PHÁT TRIỂN CHI TIẾT (BLOCKCHAIN & SECURITY EDITION)
*Hệ thống Quản lý Tài sản NeoBoard EDU-AMS - Phiên bản Bảo mật Tuyệt đối*

---

## 🏁 GIAI ĐOẠN 1: NỀN TẢNG & QUẢN TRỊ TÀI SẢN (FOUNDATION)
*Mục tiêu: Xây dựng bộ khung quản lý tài sản cơ bản và hệ thống QR.*

### 1.1 Backend - Infrastructure
- [ ] Khởi tạo NestJS + Prisma + MySQL 8.0.
- [ ] Thiết lập Redis cho Caching & BullMQ.
- [ ] Xây dựng Schema Database: Assets, Toolsets, Locations, Categories.
- [ ] **Logic:** Hoàn thiện thuật toán `AssetCodeGenerator` & In mã QR hàng loạt.

### 1.2 Frontend - Admin Dashboard
- [ ] Khởi tạo Next.js 15 + Tailwind + Shadcn UI.
- [ ] Trang Quản lý Asset/Toolset: CRUD với giao diện Side Drawer.
- [ ] Dashboard: Thống kê tổng quan số lượng và tình trạng thiết bị.

---

## 📸 GIAI ĐOẠN 2: XÁC THỰC DANH TÍNH & SELFIE (IDENTITY)
*Mục tiêu: Đảm bảo đúng người, đúng việc qua xác thực khuôn mặt.*

### 2.1 Identity Flow
- [ ] **Backend:** API Xác thực sinh viên qua MSSV. Tích hợp thư viện lưu trữ ảnh (S3/Cloudinary).
- [ ] **Frontend:** Trang mượn thiết bị (Mobile First). 
- [ ] **Task quan trọng:** Tích hợp Camera API để chụp ảnh Selfie khi mượn/trả.
- [ ] **Nâng cao:** Sử dụng `face-api.js` ở Frontend để kiểm tra sự hiện diện của khuôn mặt (Liveness Detection).

---

## ⛓️ GIAI ĐOẠN 3: LỚP BẢO MẬT BLOCKCHAIN (IMMUTABILITY)
*Mục tiêu: Biến mọi giao dịch mượn trả thành bằng chứng không thể chối cãi.*

### 3.1 Blockchain Integration
- [ ] **Backend:** Tích hợp `Ethers.js` hoặc `Web3.js`.
- [ ] **Task quan trọng:** Thuật toán Hashing (SHA-256) kết hợp *[MSSV + Mã TB + Ảnh Selfie]* để tạo mã định danh duy nhất cho mỗi giao dịch.
- [ ] **Ledger:** Lưu trữ Hash này lên Blockchain (Private Ledger) để đảm bảo tính toàn vẹn (không thể sửa xóa lịch sử).

---

## 🛠️ GIAI ĐOẠN 4: VÒNG ĐỜI & BẢO TRÌ DỰ BÁO (LIFECYCLE)
*Mục tiêu: Quản lý "sức khỏe" linh kiện (Pin, bóng đèn).*

### 4.1 Asset Health & Maintenance
- [ ] **Logic:** Xây dựng hệ thống theo dõi tuổi thọ linh kiện (Battery/Bulb lifespan).
- [ ] **Backend Cron Jobs:** Quét hàng ngày để tự động tạo `Maintenance Ticket` cho các thiết bị sắp đến hạn.
- [ ] **Realtime:** Sử dụng Socket.io để thông báo lỗi thiết bị ngay lập tức cho đội IT.

---

## 📊 GIAI ĐOẠN 5: BI, BÁO CÁO & KIỂM TOÁN (AUDIT)
*Mục tiêu: Tổng kết và tối ưu vận hành.*

### 5.1 Analytics & Reporting
- [ ] **BI Dashboard:** Biểu đồ phân tích tỉ lệ hỏng hóc, tần suất mượn trả.
- [ ] **Export Engine:** Sử dụng BullMQ để xuất báo cáo kiểm kê tài sản cuối kỳ ra Excel/PDF.
- [ ] **Audit Logs:** Trang xem lịch sử giao dịch (đối chiếu dữ liệu MySQL và Blockchain).

---

## ✅ TIÊU CHUẨN HOÀN THIỆN (DEFINITION OF DONE)
1. [ ] Sinh viên quét QR, chụp ảnh Selfie và mượn máy thành công.
2. [ ] Mọi giao dịch mượn trả đều được Hash và lưu vết trên Blockchain.
3. [ ] Hệ thống tự tạo Ticket bảo trì khi pin laptop dưới 20% tuổi thọ dự kiến.
4. [ ] Admin có thể xuất báo cáo kiểm kê chỉ với 1 click.
5. [ ] Toàn bộ hệ thống chạy ổn định trên Docker Compose.
