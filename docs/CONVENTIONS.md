# 📏 Coding Conventions — NeoBoard

> Quy ước coding cho toàn bộ dự án. Mọi member (và AI agent) phải tuân thủ.

---

## 1. Git Conventions

### Branch Naming
```
main              ← Production
develop           ← Development
feature/{name}    ← Tính năng mới     (VD: feature/user-management)
bugfix/{name}     ← Sửa lỗi          (VD: bugfix/login-redirect)
hotfix/{name}     ← Fix urgent        (VD: hotfix/jwt-expiry)
```

### Commit Message
```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
style: format code (không thay đổi logic)
refactor: tái cấu trúc code
test: thêm/sửa test
chore: việc lặt vặt (update deps, config)
```

**Ví dụ:**
```
feat: thêm endpoint POST /api/v1/auth/login
fix: sửa lỗi refresh token không revoke token cũ
docs: cập nhật API docs cho survey endpoints
```

---

## 2. Backend Conventions (.NET)

### Naming
| Thứ | Convention | Ví dụ |
|---|---|---|
| Namespace | `NeoBoard.{Layer}.{Feature}` | `NeoBoard.Application.Features.Auth` |
| Class | PascalCase | `UserService` |
| Interface | I + PascalCase | `IUserRepository` |
| Method | PascalCase + Async | `GetUserByIdAsync()` |
| Property | PascalCase | `FullName` |
| Private field | _camelCase | `_userRepository` |
| Constant | PascalCase | `MaxFileSize` |
| Enum member | PascalCase | `UserRole.Admin` |

### Code Style
- Dùng **var** khi type rõ ràng: `var user = new User();`
- Dùng **explicit type** khi không rõ: `User user = GetUser();`
- **Async/await** cho tất cả I/O operations
- **Không dùng** `#region` — chia file nhỏ thay vì dùng region
- 1 class = 1 file
- Max 200 dòng / file (nếu hơn → tách)

### Controller Convention
```csharp
[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    // GET trước, POST, PUT, PATCH, DELETE sau
    // Mỗi action return IActionResult hoặc ActionResult<T>
}
```

---

## 3. Frontend Conventions (React)

### Naming
| Thứ | Convention | Ví dụ |
|---|---|---|
| Component | PascalCase.tsx | `UserCard.tsx` |
| Hook | use + camelCase | `useAuth.ts` |
| Utility | camelCase | `formatDate.ts` |
| Constant | UPPER_SNAKE | `MAX_PAGE_SIZE` |
| CSS Module | PascalCase.module.css | `UserCard.module.css` |
| Event handler | handle + Event | `handleSubmit`, `handleClick` |
| Boolean prop | is/has/can prefix | `isLoading`, `hasError`, `canEdit` |

### Code Style
- **Functional components** only — không dùng class components
- **Named exports** — không dùng default export (trừ pages)
- **Destructure props** — `({ user, onEdit }: Props) =>`
- **Early return** cho conditions
- Max file 150 dòng (tách component nếu hơn)
- Import order: React → 3rd party → @/ alias → relative → styles

### Component Structure
```tsx
// 1. Imports
import { type FC } from 'react';

// 2. Types
interface Props { ... }

// 3. Component
export const MyComponent: FC<Props> = ({ ... }) => {
  // 3a. Hooks
  // 3b. Derived state
  // 3c. Handlers
  // 3d. Effects
  // 3e. Render
  return ( ... );
};
```

---

## 4. API Conventions

| Quy tắc | Giá trị |
|---|---|
| Base URL | `/api/v1/` |
| Resource naming | Số nhiều, lowercase | `/users`, `/surveys` |
| Nested resource | `/users/{id}/posts` |
| Pagination | `?page=1&pageSize=20` |
| Sorting | `?sortBy=createdAt&sortOrder=desc` |
| Searching | `?search=keyword` |
| Filtering | `?role=admin&isActive=true` |

---

## 5. Quy Ước Chung

### ❌ KHÔNG LÀM
- Không commit code chưa test
- Không hardcode credentials/secrets
- Không `console.log` trong production code
- Không ignore lỗi TypeScript/ESLint bằng `// @ts-ignore`
- Không dùng `any` type (trừ trường hợp bất khả kháng)
- Không sửa file không liên quan khi fix bug

### ✅ LUÔN LÀM
- Luôn xử lý error cases
- Luôn validate input
- Luôn dùng TypeScript strict mode
- Luôn viết meaningful variable names
- Luôn ghi debug log khi fix xong lỗi
