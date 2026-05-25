# Phase 03 — User Management (Quản Lý Người Dùng)

> **Mục tiêu**: CRUD users, phân quyền (RBAC), quản lý phòng ban, theo dõi hoạt động.

---

## Tasks

### 1. User CRUD Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `GET /api/v1/users` | GET | Admin+ | Danh sách users (phân trang, search, filter) |
| `GET /api/v1/users/{id}` | GET | Admin+ / Self | Chi tiết user |
| `POST /api/v1/users` | POST | Admin+ | Tạo user mới |
| `PUT /api/v1/users/{id}` | PUT | Admin+ / Self | Cập nhật user |
| `DELETE /api/v1/users/{id}` | DELETE | SuperAdmin | Xóa user (soft delete) |
| `PATCH /api/v1/users/{id}/activate` | PATCH | Admin+ | Kích hoạt/vô hiệu hóa |
| `PATCH /api/v1/users/{id}/role` | PATCH | SuperAdmin | Thay đổi role |

### 2. Role-Based Access Control (RBAC)
```csharp
// Custom Authorization Policy
[Authorize(Roles = "SuperAdmin,Admin")]
public class UsersController : ControllerBase { }

// Hoặc dùng Policy-based
[Authorize(Policy = "RequireAdminRole")]
```

**Ma trận quyền:**
| Chức năng | SuperAdmin | Admin | Manager | Employee |
|---|---|---|---|---|
| Xem danh sách users | ✅ | ✅ | ✅ (cùng dept) | ❌ |
| Tạo user | ✅ | ✅ | ❌ | ❌ |
| Sửa user | ✅ | ✅ | ❌ | ❌ (chỉ self) |
| Xóa user | ✅ | ❌ | ❌ | ❌ |
| Đổi role | ✅ | ❌ | ❌ | ❌ |
| Xem activity log | ✅ | ✅ | ❌ | ❌ |

### 3. User Activity Logging
- Ghi lại mọi hành động quan trọng: login, logout, CRUD operations
- Lưu vào bảng `UserActivities`

### 4. Department Management
- CRUD departments (nếu cần bảng riêng hoặc dùng string đơn giản)

### 5. User Profile
- `PUT /api/v1/users/profile` — User tự cập nhật thông tin cá nhân
- `PUT /api/v1/users/profile/avatar` — Upload avatar
- `PUT /api/v1/users/profile/password` — Đổi mật khẩu

---

## Acceptance Criteria

- [ ] Admin có thể CRUD users
- [ ] SuperAdmin có thể thay đổi role
- [ ] Employee chỉ sửa được profile của mình
- [ ] Danh sách users hỗ trợ phân trang, search theo tên/email
- [ ] Filter users theo role, department, active status
- [ ] Activity log ghi lại đầy đủ hành động
- [ ] Soft delete (không xóa thật, chỉ set IsActive = false)

## Dependencies
- Phase 02 (Auth) hoàn thành
