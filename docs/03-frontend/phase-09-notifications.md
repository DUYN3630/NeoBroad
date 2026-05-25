# Phase 09 — Frontend Notifications

> **Mục tiêu**: UI thông báo in-app — dropdown bell, danh sách notifications, badge count.

---

## Tasks

### 1. Components
- `NotificationBell` — Icon bell trên Header + badge unread count
- `NotificationDropdown` — Dropdown hiển thị 5 thông báo gần nhất
- `NotificationList` — Danh sách đầy đủ (trang riêng)
- `NotificationItem` — 1 thông báo (icon theo type, title, time, read status)

### 2. Pages
- `NotificationsPage` — Danh sách tất cả notifications, filter đã đọc/chưa đọc

### 3. Features
- Poll unread count mỗi 30 giây (hoặc SignalR real-time)
- Click notification → navigate đến resource liên quan
- Mark as read khi click
- "Mark all as read" button
- Empty state khi không có notification
- Animation khi có notification mới

### 4. Notification Type → Icon + Color Map
| Type | Icon | Color | Navigate to |
|---|---|---|---|
| `post_like` | ❤️ Heart | Red | `/timeline/{postId}` |
| `post_comment` | 💬 MessageCircle | Blue | `/timeline/{postId}` |
| `new_announcement` | 📢 Megaphone | Orange | `/announcements/{id}` |
| `survey_invite` | 📋 ClipboardList | Green | `/surveys/{id}` |
| `system_alert` | ⚠️ AlertTriangle | Yellow | — |

### 5. Notification Store
```typescript
// src/stores/notificationStore.ts
interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
}
```

---

## Acceptance Criteria

- [ ] Bell icon trên header hiển thị badge unread count
- [ ] Click bell → dropdown 5 notifications gần nhất + "Xem tất cả"
- [ ] Trang notifications đầy đủ với filter
- [ ] Click notification → navigate + mark read
- [ ] "Mark all as read" hoạt động
- [ ] Auto poll unread count
- [ ] Smooth animation badge

## Dependencies
- Phase 03 (Layout — Header component)
- Backend Phase 07 (Notifications API)
