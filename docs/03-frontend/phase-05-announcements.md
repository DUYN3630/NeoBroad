# Phase 05 — Frontend Announcements

> **Mục tiêu**: Giao diện xem và quản lý thông báo công ty.

---

## Tasks

### 1. Pages
- `AnnouncementsPage` — Danh sách thông báo (filter: tất cả, chưa đọc, priority)
- `AnnouncementDetailPage` — Chi tiết thông báo

### 2. Components
- `AnnouncementCard` — Card hiển thị thông báo (title, preview, priority badge, read status)
- `PriorityBadge` — Badge hiển thị mức độ ưu tiên (Normal/Important/Urgent)
- `ReadStatusIndicator` — Indicator đã đọc / chưa đọc
- `AnnouncementForm` — Form tạo/sửa (Admin only)

### 3. Features
- Filter theo priority, trạng thái đọc
- Search theo tiêu đề
- Badge "Chưa đọc" highlight
- Auto mark as read khi mở chi tiết
- Admin: tạo/sửa/publish/xóa thông báo
- Admin: xem thống kê read rate

---

## Acceptance Criteria

- [ ] Danh sách thông báo, filter/search
- [ ] Click → mở chi tiết, tự đánh dấu đã đọc
- [ ] Priority badge màu khác nhau
- [ ] Admin tạo/sửa/publish thông báo
- [ ] Thống kê read rate cho admin

## Dependencies
- Phase 03 (Layout)
- Backend Phase 05 (Announcements API)
