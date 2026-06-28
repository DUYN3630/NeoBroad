# 🤖 CHỈ THỊ PHỐI HỢP ĐA AGENT (MULTI-AGENT ORCHESTRATION)
*Dành cho Agent A (Backend) và Agent B (Frontend)*

Để hoàn thành dự án NeoBoard EDU-AMS một cách hiệu quả và không xung đột, hai bạn sẽ chia vai trò như sau:

---

## 🏗️ AGENT A: KIẾN TRÚC SƯ BACKEND & BLOCKCHAIN
**Phạm vi:** `source/backend/`
**Nhiệm vụ trọng tâm:**
1.  **Khởi tạo:** Dựng Project NestJS + Prisma + MySQL.
2.  **Cơ sở dữ liệu:** Tạo Database Schema từ file `docs/01-system-design/database-design.md`.
3.  **Xác thực:** Cấu hình JWT Auth và phân quyền (Admin, Student, IT).
4.  **Logic Nghiệp vụ:**
    *   Viết API quản lý Asset/Toolset & Vòng đời thiết bị.
    *   Viết Service `AssetHealth` tự động nhắc lịch bảo trì.
    *   Viết `BorrowTransactionService` (MySQL Transaction).
5.  **Blockchain Layer:** Tích hợp Hashing và lưu vết giao dịch lên Ledger.
6.  **Hàng đợi:** Cấu hình Redis & BullMQ để xuất báo cáo.

**📍 Ghi chú phối hợp:** Phải cung cấp tài liệu Swagger (`/api/docs`) ngay khi xong một API để Agent B có thể kết nối.

---

## 🎨 AGENT B: KỸ SƯ FRONTEND & TRẢI NGHIỆM BẢO MẬT
**Phạm vi:** `source/frontend/`
**Nhiệm vụ trọng tâm:**
1.  **Khởi tạo:** Dựng Project Next.js 15 + Tailwind + Shadcn UI.
2.  **Giao diện chính:** Layout Dashboard, Bảng danh sách thiết bị chuyên nghiệp (Side Drawer).
3.  **Module Sinh viên:** 
    *   Trang mượn máy: Tích hợp Camera để quét QR Code.
    *   **Selfie Verification:** Tích hợp luồng chụp ảnh selfie khi mượn trả.
4.  **Tương tác:** 
    *   Kết nối API của Agent A bằng React Query.
    *   Xử lý Optimistic UI cho các thao tác mượn/trả.
5.  **IT Kanban:** Dựng bảng quản lý Ticket bảo trì cho nhân viên IT.
6.  **Realtime:** Kết nối Socket.io để hiển thị thông báo tức thì.

**📍 Ghi chú phối hợp:** Sử dụng Mock dữ liệu (nếu cần) theo chuẩn của Agent A để dựng giao diện trước khi API thật sẵn sàng.

---

## 🤝 QUY TẮC CHUNG ĐỂ KHÔNG XUNG ĐỘT

1.  **Contract-First:** Agent A định nghĩa cấu trúc API (Route, Request Body, Response) trước trong file `docs/API_CONTRACTS.md` (nếu chưa có Swagger).
2.  **Biến môi trường:** Thống nhất dùng chung các key trong file `.env` (Ví dụ: `VITE_API_BASE_URL`).
3.  **Git:** Nếu làm chung 1 Repo, Agent A commit vào folder `source/backend`, Agent B commit vào folder `source/frontend`. Tuyệt đối không sửa file của nhau trừ khi cần thiết.
4.  **Tài liệu tham chiếu:** Luôn đọc kỹ `docs/ROADMAP.md` và `docs/CONVENTIONS.md` trước khi code.

---

## 🚀 CÂU LỆNH KHỞI ĐẦU (PROMPT)

**Dành cho Agent A:**
> "Chào Agent A. Bạn là chuyên gia Backend. Hãy đọc toàn bộ thư mục `/docs`, đặc biệt là file `AGENTS_INSTRUCTIONS.md` để hiểu vai trò của mình. Nhiệm vụ đầu tiên của bạn là khởi tạo Project NestJS và cấu hình Prisma kết nối MySQL theo Schema đã thiết kế."

**Dành cho Agent B:**
> "Chào Agent B. Bạn là chuyên gia Frontend. Hãy đọc toàn bộ thư mục `/docs`, đặc biệt là file `AGENTS_INSTRUCTIONS.md` để hiểu vai trò của mình. Nhiệm vụ đầu tiên của bạn là khởi tạo Project Next.js và dựng bộ khung Layout (Sidebar/Header) chuẩn Enterprise."
