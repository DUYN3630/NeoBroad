# Phase 08 — Frontend Admin (Trang Quản Trị)

> **Mục tiêu**: Admin dashboard với quản lý users, cài đặt hệ thống, báo cáo thống kê.

---

## Tasks

### 1. Pages
- `AdminDashboardPage` — Tổng quan thống kê hệ thống
- `AdminUsersPage` — Quản lý users (CRUD, filter, search)
- `AdminUserDetailPage` — Chi tiết + sửa user
- `AdminSettingsPage` — Cấu hình hệ thống
- `AdminReportsPage` — Báo cáo thống kê

### 2. Admin Dashboard Widgets
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  👥 Total    │  📊 Active   │  📝 Posts    │  📋 Surveys  │
│  Users: 150  │  Today: 89   │  This Week:  │  Active: 3   │
│  +12 this wk │  59% rate    │  45 posts    │  Pending: 2  │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌─────────────────────────────┬─────────────────────────────┐
│  📈 User Activity Chart     │  📊 Department Distribution │
│  Line chart (7 ngày)        │  Pie chart                  │
└─────────────────────────────┴─────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  🕐 Recent Activities                                       │
│  - Admin A created user "Nguyễn Văn B" - 5 phút trước     │
│  - Manager C published announcement "..." - 1 giờ trước    │
└─────────────────────────────────────────────────────────────┘
```

### 3. User Management Table
- Data table với columns: Avatar, Name, Email, Role, Department, Status, Actions
- Search by name/email
- Filter by role, department, status
- Bulk actions: activate/deactivate
- Inline edit role
- Pagination (server-side)

### 4. System Settings
- App name, logo
- JWT settings (view only)
- CORS origins
- File upload limits
- Notification settings

### 5. Reports & Charts (Recharts)
- User registration trend (line chart)
- Active users per day/week/month
- Posts per department (bar chart)
- Survey completion rates
- Top active users

---

## Acceptance Criteria

- [ ] Admin dashboard hiển thị stats cards + charts
- [ ] User management CRUD với table, search, filter, pagination
- [ ] Role change, activate/deactivate users
- [ ] System settings page (view/edit)
- [ ] Reports with interactive charts
- [ ] Chỉ Admin/SuperAdmin mới truy cập được admin pages

## Dependencies
- Phase 03 (Layout)
- Backend Phase 03 (User Management API)
