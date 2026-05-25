# Phase 04 — Timeline (Bảng Tin Nội Bộ)

> **Mục tiêu**: Social feed nội bộ — đăng bài, like, comment, theo dõi hoạt động.

---

## Tasks

### 1. Timeline Post Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `GET /api/v1/timeline` | GET | All | Lấy feed (phân trang, mới nhất trước) |
| `GET /api/v1/timeline/{id}` | GET | All | Chi tiết bài viết |
| `POST /api/v1/timeline` | POST | All | Đăng bài mới |
| `PUT /api/v1/timeline/{id}` | PUT | Author/Admin | Sửa bài |
| `DELETE /api/v1/timeline/{id}` | DELETE | Author/Admin | Xóa bài |
| `POST /api/v1/timeline/{id}/like` | POST | All | Like/unlike bài |
| `GET /api/v1/timeline/{id}/comments` | GET | All | Lấy comments |
| `POST /api/v1/timeline/{id}/comments` | POST | All | Viết comment |
| `DELETE /api/v1/timeline/comments/{id}` | DELETE | Author/Admin | Xóa comment |

### 2. Post Entity
- Content (text, có thể hỗ trợ markdown)
- Đính kèm hình ảnh (link tới FileService)
- LikeCount, CommentCount (denormalized cho performance)

### 3. Like System
- Bảng `PostLikes` (PostId, UserId) — unique constraint
- Toggle: like → unlike → like

### 4. Comment System
- Bảng `PostComments` — flat comments (không cần nested cho v1)
- Sắp xếp theo thời gian (cũ → mới)

### 5. Feed Algorithm
- V1: Sắp xếp theo `CreatedAt DESC` (mới nhất trước)
- Phân trang cursor-based hoặc offset-based

---

## Acceptance Criteria

- [ ] User đăng bài text + optional image
- [ ] Feed hiển thị bài mới nhất, phân trang
- [ ] Like/unlike toggle hoạt động, count cập nhật đúng
- [ ] Comment CRUD hoạt động
- [ ] Chỉ author hoặc admin mới sửa/xóa bài
- [ ] Tạo notification khi có like/comment (tích hợp Phase 07)

## Dependencies
- Phase 02 (Auth), Phase 03 (User Management)
