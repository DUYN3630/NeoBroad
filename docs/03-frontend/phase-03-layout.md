# Phase 03 — Layout (Bố Cục Chính)

> **Mục tiêu**: Xây dựng layout chính cho app: Sidebar, Header, Content area, responsive.

---

## Tasks

### 1. Layout Components

#### MainLayout
```
┌─────────────────────────────────────────────┐
│                  Header (64px)              │
│  [☰ Toggle] [Search...] [🔔 3] [👤 Avatar] │
├──────────────┬──────────────────────────────┤
│              │                              │
│   Sidebar    │       Main Content           │
│   (260px)    │       (flex-grow)             │
│              │                              │
│  📊 Dashboard│                              │
│  📰 Timeline │                              │
│  📢 Thông báo│                              │
│  📋 Khảo sát │                              │
│  👤 Trang tôi│                              │
│  ⚙️ Quản trị │                              │
│              │                              │
├──────────────┴──────────────────────────────┤
│                  Footer (optional)          │
└─────────────────────────────────────────────┘
```

#### Header
- Logo / App name
- Sidebar toggle button (hamburger menu)
- Global search bar
- Notification bell + badge count
- User avatar + dropdown menu (profile, settings, logout)

#### Sidebar
- Navigation links với icons
- Collapsible (desktop: toggle expand/collapse, mobile: overlay)
- Active state indicator
- Role-based menu items (Admin menu chỉ hiện cho Admin+)
- App version ở bottom

#### Content Area
- Breadcrumbs (optional)
- Page title
- Main content (scroll inside)
- Padding consistent

### 2. Responsive Design

| Breakpoint | Layout |
|---|---|
| Desktop (≥1024px) | Sidebar fixed + Content bên phải |
| Tablet (768-1023px) | Sidebar collapsed (icon only) + Content |
| Mobile (<768px) | Sidebar overlay + Hamburger toggle |

### 3. Theme System
```css
/* Light theme */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-sidebar: #1e293b;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent: #3b82f6;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-sidebar: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent: #60a5fa;
}
```

### 4. UI Store
```typescript
// src/stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### 5. Sidebar Navigation Config
```typescript
const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['all'] },
  { label: 'Timeline', icon: Newspaper, path: '/timeline', roles: ['all'] },
  { label: 'Thông báo', icon: Megaphone, path: '/announcements', roles: ['all'] },
  { label: 'Khảo sát', icon: ClipboardList, path: '/surveys', roles: ['all'] },
  { label: 'Trang tôi', icon: UserCircle, path: '/my-page', roles: ['all'] },
  { label: 'Thông báo', icon: Bell, path: '/notifications', roles: ['all'] },
  // Admin section
  { label: 'Quản lý users', icon: Users, path: '/admin/users', roles: ['SuperAdmin', 'Admin'] },
  { label: 'Cài đặt', icon: Settings, path: '/admin/settings', roles: ['SuperAdmin', 'Admin'] },
  { label: 'Báo cáo', icon: BarChart3, path: '/admin/reports', roles: ['SuperAdmin', 'Admin'] },
];
```

---

## Acceptance Criteria

- [ ] Layout chính hiển thị đúng: header + sidebar + content
- [ ] Sidebar toggle mở/đóng hoạt động
- [ ] Responsive: desktop, tablet, mobile layouts
- [ ] Dark/light theme toggle
- [ ] Navigation highlight trang hiện tại
- [ ] Menu items ẩn/hiện theo role
- [ ] Smooth animation khi toggle sidebar
- [ ] Skeleton loading cho trang content

## Dependencies
- Phase 01 (Setup), Phase 02 (Auth — để biết role user)
