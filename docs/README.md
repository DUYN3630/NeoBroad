# 📋 TỔNG QUAN DỰ ÁN NEOBOARD (EDU-AMS)
*Hệ thống Quản lý Tài sản & Vòng đời Thiết bị Giáo dục*

---

## 🎯 1. TẦM NHÌN DỰ ÁN
NeoBoard không chỉ là một trang web quản lý thiết bị cơ bản. Đây là giải pháp **quản trị khép kín vòng đời tài sản (Lifecycle Management)** cho trường học, giúp:
*   Tự động hóa quy trình mượn/trả cho Sinh viên qua QR Code.
*   Dự báo bảo trì (Pin, Bóng đèn, Linh kiện) trước khi xảy ra hỏng hóc.
*   Quản lý linh hoạt cả Thiết bị đơn lẻ (Asset) và Bộ công cụ (Toolset).

---

## 🛠️ 2. PHÂN RÃ CÁC GIAI ĐOẠN PHÁT TRIỂN (PHASES)

### PHASE 1: NỀN TẢNG & QUẢN TRỊ TÀI SẢN (FOUNDATION & AMS)
*Mục tiêu: Quản lý "Sức khỏe" thiết bị.*

*   **Backend (ASP.NET Core + MySQL):**
    *   Thiết kế Schema MySQL: `Assets`, `Toolsets`, `Categories`, `Locations`, `User`.
    *   API CRUD cho Asset & Toolset (Hỗ trợ upload ảnh thật).
    *   **Thuật toán Gen mã tài sản tự động:** Dựa trên Loại + Năm + STT.
    *   **Thuật toán Health Tracking:** Tính toán ngày bảo trì định kỳ và ngày dự kiến thay pin/linh kiện.
*   **Frontend (React + Vite):**
    *   Dashboard Quản trị: Hiển thị nhanh số lượng thiết bị hỏng/sắp đến hạn bảo trì.
    *   Trang Danh sách & Thêm mới (Sử dụng Side Drawer, hỗ trợ QR Code Preview).

### PHASE 2: LUỒNG MƯỢN TRẢ SINH VIÊN (STUDENT SELF-SERVICE)
*Mục tiêu: Tối ưu trải nghiệm mượn thiết bị trong 30 giây.*

*   **Backend:**
    *   API Xác thực sinh viên qua MSSV (Kết nối với bảng `Students`).
    *   Logic **Borrow/Return Transaction**: Xử lý mượn trả, tự động đổi trạng thái Asset.
    *   Check-point: Chặn sinh viên nợ thiết bị quá hạn.
*   **Frontend:**
    *   Trang mượn thiết bị dành cho Mobile: Quét mã QR -> Hiện thông tin máy -> Nhấn mượn.
    *   Trang "My Assets": Sinh viên xem các máy mình đang cầm và thời gian phải trả.

### PHASE 3: HỆ THỐNG TICKET & BẢO TRÌ REALTIME (IT OPERATIONS)
*Mục tiêu: Xử lý sự cố tức thì.*

*   **Backend:**
    *   API tạo Ticket: `Failure Ticket` (Do giáo viên báo hỏng), `Maintenance Ticket` (Hệ thống tự tạo do đến hạn).
    *   Tích hợp **SignalR/Socket.io**: Bắn thông báo realtime cho bộ phận IT khi có ticket mới.
    *   **Cron Job:** Quét hàng ngày để tự động tạo ticket bảo trì định kỳ.
*   **Frontend:**
    *   Màn hình "IT Workspace": Bảng Kanban quản lý công việc sửa chữa.
    *   Lịch (Calendar) bảo trì dự kiến trong tháng.

### PHASE 4: TƯƠNG TÁC & BÁO CÁO (COMMUNITY & BI)
*Mục tiêu: Kết nối và ra quyết định.*

*   **Backend:**
    *   Module Timeline: Đăng thông báo, tin tức trường học.
    *   Module Survey: Tạo form khảo sát chất lượng thiết bị.
    *   API Export Report: Xuất báo cáo kiểm kê tài sản cuối kỳ ra Excel/PDF (Dùng Background Job BullMQ).
*   **Frontend:**
    *   Trang Timeline (Newsfeed).
    *   Trang Analytics: Biểu đồ thống kê tần suất hỏng hóc, tỉ lệ khấu hao tài sản.

---

## 🚀 3. TÍNH NĂNG THÔNG MINH & BẢO MẬT CAO (SMART FEATURES)

### 🤖 Tự Động Hóa Bảo Trì (Proactive Maintenance)
*   **Background Worker:** Hệ thống tự động quét danh sách thiết bị hàng ngày.
*   **Auto-Ticket:** Tự động sinh `Maintenance Ticket` khi thiết bị đến hạn bảo trì định kỳ mà không cần Admin thao tác thủ công.
*   **Cảnh báo sớm:** Gửi thông báo cho kỹ thuật viên về các linh kiện sắp hết tuổi thọ (Pin, bóng đèn máy chiếu).

### 🛡️ Cơ Chế "Niềm Tin Tuyệt Đối" (Trust Verification Flow)
*   **QR + Selfie Evidence:** Khi mượn máy, sinh viên bắt buộc chụp hình selfie cùng thiết bị. Hình ảnh này là bằng chứng xác thực nhất về người cầm máy và tình trạng máy lúc mượn.
*   **Blockchain-like Audit Trail:** Mỗi giao dịch mượn/trả sẽ được "băm" (Hash) và liên kết với giao dịch trước đó. Điều này tạo ra một chuỗi dữ liệu bất biến, ngăn chặn việc Admin hoặc người dùng sửa đổi lịch sử mượn trả nhằm trốn tránh trách nhiệm.
*   **Digital Signature:** Hỗ trợ lưu trữ mã Hash giao dịch lên Blockchain (Smart Contract) để đảm bảo tính minh bạch tối đa.

---

## 📋 4. DANH SÁCH FILE DOCS CẦN CẬP NHẬT
 TRONG THƯ MỤC /docs
*   `01-system-design/database-design.md`: Cập nhật Schema cho Asset Health & Toolset.
*   `02-backend/phase-01-ams.md`: Chi tiết API quản lý vòng đời thiết bị.
*   `03-frontend/phase-02-borrow-flow.md`: Đặc tả UI cho trang mượn trả QR.
*   `05-deployment/docker-setup.md`: Cấu hình Docker cho Node.js + MySQL + Redis.
