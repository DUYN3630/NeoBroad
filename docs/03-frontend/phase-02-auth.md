# Phase 02 — Frontend Auth (Xác Thực)

> **Mục tiêu**: Trang đăng nhập, đăng ký, quên mật khẩu, auth state management, route protection.

---

## Tasks

### 1. Auth Store (Zustand)
```typescript
// src/stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}
```

### 2. Tạo Pages
| Trang | Route | Mô tả |
|---|---|---|
| `LoginPage` | `/login` | Form đăng nhập (email + password) |
| `RegisterPage` | `/register` | Form đăng ký |
| `ForgotPasswordPage` | `/forgot-password` | Gửi email reset password |

### 3. Components cần tạo
- `LoginForm` — form đăng nhập với validation (Zod)
- `RegisterForm` — form đăng ký
- `AuthLayout` — layout cho trang auth (centered card, background)
- `ProtectedRoute` — HOC kiểm tra auth, redirect nếu chưa login

### 4. Auth API Hooks (React Query)
```typescript
// src/features/auth/api/
export const useLogin = () => useMutation({ ... });
export const useRegister = () => useMutation({ ... });
export const useRefreshToken = () => useMutation({ ... });
export const useCurrentUser = () => useQuery({ ... });
```

### 5. Auto Refresh Token
- Axios interceptor bắt 401 → tự động gọi refresh
- Nếu refresh fail → redirect về `/login`
- Queue các request pending khi đang refresh

### 6. Persist Auth
- Lưu tokens vào localStorage (qua Zustand persist)
- Khi app load → kiểm tra token → validate → hydrate user

---

## UI/UX Notes

- Login page: Clean, modern, dark/light support
- Logo NeoBoard ở trên form
- "Remember me" checkbox
- Social login buttons (UI only cho v1)
- Loading state khi submit
- Error messages clear, specific

---

## Acceptance Criteria

- [ ] Login thành công → redirect về Dashboard
- [ ] Login sai → hiển thị error message
- [ ] Register thành công → auto login
- [ ] Validation form client-side (email format, password length)
- [ ] Protected routes redirect về `/login` nếu chưa auth
- [ ] Token persist qua page refresh
- [ ] Auto refresh token khi hết hạn
- [ ] Logout clear token + redirect

## Dependencies
- Phase 01 (Setup) hoàn thành
- Backend Phase 02 (Auth API) ready
