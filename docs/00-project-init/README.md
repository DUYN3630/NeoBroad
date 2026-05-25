# 📋 NeoBoard — Giới Thiệu Dự Án

## Dự Án Là Gì?

**NeoBoard** là nền tảng dashboard quản trị doanh nghiệp hiện đại theo mô hình SaaS (Software as a Service). Hệ thống cung cấp giao diện trực quan, chuyên nghiệp để doanh nghiệp quản lý toàn bộ hoạt động từ một nơi duy nhất.

## Mục Tiêu Kinh Doanh

1. **Tập trung hóa quản lý**: Gộp các công cụ rời rạc (CRM, ERP, quản lý dự án) vào một nền tảng thống nhất
2. **Ra quyết định nhanh hơn**: Dashboard trực quan với biểu đồ, thống kê real-time
3. **Tăng hiệu suất vận hành**: Tự động hóa quy trình, giảm thao tác thủ công
4. **Bảo mật & phân quyền**: Kiểm soát chặt chẽ ai được làm gì trong hệ thống

## Tính Năng Chính

### 📊 Quản Lý Dữ Liệu & Báo Cáo
- Dashboard tổng quan với biểu đồ, thống kê
- Báo cáo tình hình kinh doanh real-time
- Export báo cáo (PDF, Excel)
- Widget tùy chỉnh theo nhu cầu

### 👥 Quản Trị Người Dùng
- Quản lý tài khoản (CRUD)
- Phân quyền theo vai trò (Role-based Access Control)
- Theo dõi hoạt động người dùng (Activity Log)
- Quản lý nhóm / phòng ban

### 🛠️ Điều Khiển Hệ Thống
- Cấu hình hệ thống
- Giám sát trạng thái dịch vụ (Service Health)
- Quản lý nội dung (Content Management)
- System logs & audit trail

### 💼 Ứng Dụng Doanh Nghiệp
- **CRM**: Quản lý khách hàng, pipeline bán hàng
- **ERP**: Quản lý tài nguyên doanh nghiệp
- **Quản lý dự án**: Task board, timeline, milestone
- **Quản lý kho**: Inventory, nhập/xuất hàng

### 🔔 Tương Tác & Truyền Thông
- **Timeline**: Feed hoạt động nội bộ
- **Announcements**: Thông báo toàn công ty
- **Survey**: Khảo sát nội bộ
- **Notifications**: Thông báo real-time (push + in-app)

### 📁 Quản Lý File
- Upload/download tài liệu
- Phân loại theo danh mục
- Tìm kiếm nhanh
- Kiểm soát truy cập file

## Đối Tượng Người Dùng

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| **Super Admin** | Quản trị viên cao nhất | Toàn quyền hệ thống |
| **Admin** | Quản trị viên | Quản lý user, nội dung, cấu hình |
| **Manager** | Quản lý phòng ban | Xem báo cáo, quản lý nhóm |
| **Employee** | Nhân viên | Xem dashboard, tương tác nội dung |

## Tiến Độ Phát Triển

| Phase | Backend | Frontend | Trạng thái |
|---|---|---|---|
| Foundation & Setup | `docs/02-backend/phase-01` | `docs/03-frontend/phase-01` | ⬜ Chưa bắt đầu |
| Authentication | `phase-02` | `phase-02` | ⬜ Chưa bắt đầu |
| User Management | `phase-03` | — | ⬜ Chưa bắt đầu |
| Layout | — | `phase-03` | ⬜ Chưa bắt đầu |
| Timeline | `phase-04` | `phase-04` | ⬜ Chưa bắt đầu |
| Announcements | `phase-05` | `phase-05` | ⬜ Chưa bắt đầu |
| Survey | `phase-06` | `phase-06` | ⬜ Chưa bắt đầu |
| My Page | — | `phase-07` | ⬜ Chưa bắt đầu |
| Admin | — | `phase-08` | ⬜ Chưa bắt đầu |
| Notifications | `phase-07` | `phase-09` | ⬜ Chưa bắt đầu |
| File Service | `phase-08` | — | ⬜ Chưa bắt đầu |
