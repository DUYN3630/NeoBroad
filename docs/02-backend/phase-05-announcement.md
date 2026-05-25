# Phase 05 — Announcements (Thông Báo Công Ty)

> **Mục tiêu**: Hệ thống thông báo chính thức từ ban lãnh đạo đến toàn bộ nhân viên.

---

## Tasks

### 1. Announcement Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `GET /api/v1/announcements` | GET | All | Danh sách thông báo (published) |
| `GET /api/v1/announcements/{id}` | GET | All | Chi tiết thông báo |
| `POST /api/v1/announcements` | POST | Admin+ | Tạo thông báo |
| `PUT /api/v1/announcements/{id}` | PUT | Admin+ | Sửa thông báo |
| `DELETE /api/v1/announcements/{id}` | DELETE | Admin+ | Xóa thông báo |
| `POST /api/v1/announcements/{id}/publish` | POST | Admin+ | Publish thông báo |
| `POST /api/v1/announcements/{id}/read` | POST | All | Đánh dấu đã đọc |
| `GET /api/v1/announcements/{id}/stats` | GET | Admin+ | Thống kê đã đọc/chưa đọc |

### 2. Features
- **Priority levels**: Normal, Important, Urgent
- **Draft/Published**: Admin soạn draft trước, publish khi sẵn sàng
- **Expiry**: Thông báo tự ẩn sau ngày hết hạn
- **Read tracking**: Theo dõi ai đã đọc/chưa đọc
- **Pin**: Ghim thông báo quan trọng lên đầu
- **Đính kèm file**: Link đến FileService

### 3. Read Tracking
- Bảng `AnnouncementReads` (AnnouncementId, UserId, ReadAt)
- API thống kê: % đã đọc, danh sách chưa đọc

---

## Acceptance Criteria

- [ ] Admin tạo/sửa/xóa thông báo
- [ ] Draft → Publish workflow
- [ ] Employee xem danh sách thông báo published
- [ ] Đánh dấu đã đọc, hiển thị badge "chưa đọc"
- [ ] Filter theo priority, thời gian
- [ ] Thống kê read rate cho admin
- [ ] Thông báo hết hạn tự động ẩn

## Dependencies
- Phase 02 (Auth), Phase 03 (User Management)
