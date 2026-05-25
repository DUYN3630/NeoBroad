# Phase 04 — Frontend Timeline

> **Mục tiêu**: Giao diện feed bài viết nội bộ — đăng bài, like, comment.

---

## Tasks

### 1. Pages
- `TimelinePage` — Feed bài viết, infinite scroll hoặc pagination

### 2. Components
- `PostCard` — Hiển thị 1 bài viết (author, content, image, like/comment count)
- `CreatePostForm` — Form đăng bài mới (text + image upload)
- `PostComments` — Danh sách comments + form viết comment
- `LikeButton` — Nút like/unlike với animation
- `PostActions` — Menu actions (sửa, xóa — cho author/admin)

### 3. API Integration
```typescript
// src/features/timeline/api/
export const useTimelinePosts = (params) => useInfiniteQuery({ ... });
export const useCreatePost = () => useMutation({ ... });
export const useLikePost = () => useMutation({ ... });
export const usePostComments = (postId) => useQuery({ ... });
export const useCreateComment = () => useMutation({ ... });
```

### 4. UI/UX Notes
- Feed style giống Facebook/LinkedIn internal
- Infinite scroll hoặc "Load more" button
- Optimistic update cho like/unlike (UI cập nhật ngay, revert nếu fail)
- Image preview trước khi post
- Skeleton loading cho posts

---

## Acceptance Criteria

- [ ] Hiển thị feed bài viết, load thêm khi scroll
- [ ] Đăng bài text + optional image
- [ ] Like/unlike toggle, count cập nhật
- [ ] Xem và viết comments
- [ ] Sửa/xóa bài (chỉ author hoặc admin)
- [ ] Empty state khi chưa có bài
- [ ] Loading states

## Dependencies
- Phase 03 (Layout)
- Backend Phase 04 (Timeline API)
