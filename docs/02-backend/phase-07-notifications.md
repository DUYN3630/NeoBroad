# Phase 07 — Notifications (Thông Báo Real-time)

> **Mục tiêu**: Hệ thống thông báo in-app real-time cho các sự kiện trong hệ thống.

---

## Tasks

### 1. Notification Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `GET /api/v1/notifications` | GET | Self | Danh sách thông báo của user |
| `GET /api/v1/notifications/unread-count` | GET | Self | Số thông báo chưa đọc |
| `PUT /api/v1/notifications/{id}/read` | PUT | Self | Đánh dấu đã đọc |
| `PUT /api/v1/notifications/read-all` | PUT | Self | Đánh dấu tất cả đã đọc |
| `DELETE /api/v1/notifications/{id}` | DELETE | Self | Xóa thông báo |

### 2. Notification Types
```csharp
public static class NotificationType
{
    public const string PostLike = "post_like";
    public const string PostComment = "post_comment";
    public const string NewAnnouncement = "new_announcement";
    public const string SurveyInvite = "survey_invite";
    public const string SurveyClosed = "survey_closed";
    public const string SystemAlert = "system_alert";
    public const string UserMention = "user_mention";
}
```

### 3. Notification Service
```csharp
// NeoBoard.Application/Interfaces/INotificationService.cs
public interface INotificationService
{
    Task SendAsync(Guid userId, string title, string message, string type, Guid? referenceId = null);
    Task SendToManyAsync(IEnumerable<Guid> userIds, string title, string message, string type);
    Task SendToAllAsync(string title, string message, string type);
}
```

### 4. SignalR Hub (Real-time) — Optional cho v1
```csharp
// Nếu muốn push notification real-time
// NeoBoard.Web/Hubs/NotificationHub.cs
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
    }
}
```

### 5. Tự Động Gửi Notification Khi
| Sự kiện | Người nhận | Message |
|---|---|---|
| Ai đó like post của bạn | Post author | "{name} đã thích bài viết của bạn" |
| Ai đó comment post | Post author | "{name} đã bình luận bài viết của bạn" |
| Announcement mới published | All users | "Thông báo mới: {title}" |
| Survey mới | All users | "Khảo sát mới: {title}" |
| Survey đóng | Survey participants | "Khảo sát '{title}' đã đóng" |

---

## Acceptance Criteria

- [ ] User xem danh sách notifications, phân trang
- [ ] Badge đếm unread notifications
- [ ] Đánh dấu đọc 1 hoặc tất cả
- [ ] Tự động tạo notification khi có sự kiện liên quan
- [ ] API unread-count để frontend poll
- [ ] (Optional) SignalR real-time push

## Dependencies
- Phase 02 (Auth) — để biết user hiện tại
- Phase 04, 05, 06 — để tích hợp event triggers
