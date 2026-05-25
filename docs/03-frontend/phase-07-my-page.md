# Phase 07 — Frontend My Page (Trang Cá Nhân)

> **Mục tiêu**: Trang profile cá nhân, chỉnh sửa thông tin, xem activity log.

---

## Tasks

### 1. Pages
- `MyPage` — Trang profile chính

### 2. Sections / Tabs
- **Thông tin cá nhân**: Avatar, tên, email, phòng ban, role
- **Chỉnh sửa profile**: Form sửa tên, avatar
- **Đổi mật khẩu**: Form đổi password (old + new + confirm)
- **Hoạt động gần đây**: Timeline hoạt động cá nhân (bài đăng, comments, surveys)
- **Cài đặt**: Notification preferences, language, theme

### 3. Components
- `ProfileHeader` — Avatar lớn + info cơ bản
- `ProfileEditForm` — Form sửa thông tin
- `PasswordChangeForm` — Form đổi mật khẩu
- `ActivityTimeline` — Danh sách hoạt động gần đây
- `AvatarUpload` — Component upload + crop avatar

---

## Acceptance Criteria

- [ ] Hiển thị profile đầy đủ thông tin
- [ ] Sửa tên, upload avatar
- [ ] Đổi mật khẩu với validation
- [ ] Xem hoạt động gần đây
- [ ] Setting notification preferences

## Dependencies
- Phase 03 (Layout)
- Backend Phase 03 (User Management — profile APIs)
