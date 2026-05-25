# 🎮 Gamification — Tính Năng Game Hóa

> Tăng engagement bằng cách thêm yếu tố game vào nền tảng.

---

## Kế Hoạch Gamification

### 1. Points System (Hệ Thống Điểm)
| Hành động | Điểm |
|---|---|
| Đăng bài Timeline | +10 |
| Comment bài | +5 |
| Được like | +2 |
| Hoàn thành Survey | +15 |
| Đọc Announcement | +3 |
| Streak đăng nhập | +5/ngày |

### 2. Badges (Huy Hiệu)
- 🌟 **Newcomer** — Đăng bài đầu tiên
- 🔥 **On Fire** — 7 ngày liên tiếp active
- 💬 **Social Butterfly** — 50 comments
- 📊 **Survey Master** — Hoàn thành 10 surveys
- 👑 **Top Contributor** — Top 1 tháng

### 3. Leaderboard (Bảng Xếp Hạng)
- Xếp hạng theo tuần/tháng/tổng
- Theo department
- Top contributors

### 4. Implementation Notes
- Bảng `UserPoints` (UserId, Points, Action, CreatedAt)
- Bảng `UserBadges` (UserId, BadgeType, EarnedAt)
- Service tự động trao badge khi đạt điều kiện
- Widget leaderboard trên Dashboard
