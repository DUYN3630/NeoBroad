# 🎨 Thiết Kế Frontend — NeoBoard

## Kiến Trúc: Feature-Based Structure

```
source/frontend/
├── public/                       # Static assets
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/                      # App-level setup
│   │   ├── App.tsx               # Root component
│   │   ├── Router.tsx            # Route definitions
│   │   └── Providers.tsx         # Context providers wrapper
│   │
│   ├── assets/                   # Images, fonts, etc.
│   │
│   ├── components/               # Shared/Reusable components
│   │   ├── ui/                   # Primitive UI (Button, Input, Modal, Card)
│   │   ├── layout/               # Layout components (Sidebar, Header, Footer)
│   │   ├── charts/               # Chart components (BarChart, LineChart, PieChart)
│   │   ├── data-table/           # Data table component
│   │   └── feedback/             # Toast, Alert, Loading, ErrorBoundary
│   │
│   ├── features/                 # Feature modules (mỗi feature tự chứa)
│   │   ├── auth/                 # Đăng nhập, đăng ký, quên mật khẩu
│   │   │   ├── components/       # Components riêng của feature
│   │   │   ├── hooks/            # Custom hooks riêng
│   │   │   ├── api/              # API calls (React Query)
│   │   │   ├── types/            # TypeScript types
│   │   │   ├── utils/            # Helper functions
│   │   │   └── index.ts          # Barrel export
│   │   ├── dashboard/            # Trang chủ dashboard
│   │   ├── users/                # Quản lý người dùng
│   │   ├── timeline/             # Feed hoạt động
│   │   ├── announcements/        # Thông báo công ty
│   │   ├── surveys/              # Khảo sát
│   │   ├── my-page/              # Trang cá nhân
│   │   ├── admin/                # Quản trị hệ thống
│   │   ├── notifications/        # Thông báo
│   │   └── files/                # Quản lý file
│   │
│   ├── hooks/                    # Global custom hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/                      # Library configurations
│   │   ├── axios.ts              # Axios instance + interceptors
│   │   ├── queryClient.ts        # React Query client config
│   │   └── constants.ts          # App constants
│   │
│   ├── stores/                   # Zustand stores (client state)
│   │   ├── authStore.ts          # Auth state (user, token)
│   │   ├── uiStore.ts            # UI state (sidebar, theme)
│   │   └── notificationStore.ts
│   │
│   ├── types/                    # Global TypeScript types
│   │   ├── api.ts                # API response types
│   │   ├── user.ts               # User-related types
│   │   └── common.ts             # Shared types
│   │
│   ├── utils/                    # Global utility functions
│   │   ├── formatDate.ts
│   │   ├── formatNumber.ts
│   │   └── validation.ts
│   │
│   ├── styles/                   # Global styles
│   │   ├── globals.css           # CSS reset + custom properties
│   │   └── variables.css         # CSS variables (colors, spacing)
│   │
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts
│
├── .env.example                  # Environment variables template
├── .eslintrc.cjs                 # ESLint config
├── .prettierrc                   # Prettier config
├── index.html                    # HTML entry
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Cấu Hình & Conventions

### 1. Component Convention

```tsx
// ✅ Convention cho mỗi component
// src/features/users/components/UserCard.tsx

import { type FC } from 'react';
import styles from './UserCard.module.css'; // CSS Modules

interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className={styles.card}>
      <h3>{user.fullName}</h3>
      <button onClick={() => onEdit(user.id)}>Chỉnh sửa</button>
    </div>
  );
};
```

### 2. API Integration Pattern (React Query)

```tsx
// src/features/users/api/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { User, CreateUserRequest } from '../types';

// Query keys - centralized
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: object) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// GET - Lấy danh sách users
export const useUsers = (params?: { page: number; pageSize: number }) => {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn: () => apiClient.get('/users', { params }),
  });
};

// POST - Tạo user mới
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
```

### 3. Axios Instance Setup

```tsx
// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Tự động gắn JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Xử lý refresh token
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Thử refresh token
      // Nếu fail → redirect về login
    }
    return Promise.reject(error);
  }
);
```

### 4. Routing Structure

```tsx
// src/app/Router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  // Public routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  // Protected routes
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/timeline', element: <TimelinePage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/surveys', element: <SurveysPage /> },
      { path: '/my-page', element: <MyPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      // Admin routes
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/settings', element: <AdminSettingsPage /> },
      { path: '/admin/reports', element: <AdminReportsPage /> },
    ],
  },
]);
```

### 5. State Management Strategy

| Loại state | Giải pháp | Ví dụ |
|---|---|---|
| **Server state** | React Query | User list, posts, notifications |
| **Auth state** | Zustand (persist) | Token, current user |
| **UI state** | Zustand | Sidebar open/close, theme |
| **Form state** | React Hook Form | Login form, create post form |
| **URL state** | React Router | Current page, search params |

### 6. Naming Convention

| Thứ | Convention | Ví dụ |
|---|---|---|
| Component file | PascalCase.tsx | `UserCard.tsx` |
| Hook file | camelCase.ts | `useUsers.ts` |
| Utility file | camelCase.ts | `formatDate.ts` |
| Type file | camelCase.ts | `user.ts` |
| CSS Module | PascalCase.module.css | `UserCard.module.css` |
| Store file | camelCase.ts | `authStore.ts` |
| Constant | UPPER_SNAKE | `MAX_PAGE_SIZE` |
| Feature folder | kebab-case | `my-page/`, `auth/` |

### 7. Path Aliases (vite.config.ts)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Design System

### Color Palette (CSS Variables)

```css
:root {
  /* Primary - Deep Blue */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-700: #1d4ed8;

  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Layout */
  --sidebar-width: 260px;
  --header-height: 64px;
  --border-radius: 8px;
}
```

---

## Checklist Trước Khi Code

- [ ] Init Vite + React + TypeScript project
- [ ] Cấu hình path aliases
- [ ] Cài dependencies (React Query, Zustand, React Router, Axios, etc.)
- [ ] Setup ESLint + Prettier
- [ ] Tạo cấu trúc folder theo kiến trúc trên
- [ ] Tạo Axios instance + interceptors
- [ ] Tạo React Query client
- [ ] Tạo auth store (Zustand)
- [ ] Tạo base layout (Sidebar + Header + Content)
- [ ] Tạo routing structure
