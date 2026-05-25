# Phase 01 — Frontend Setup (Khởi Tạo Dự Án)

> **Mục tiêu**: Init React + Vite + TypeScript project, cài dependencies, setup cấu trúc folder.

---

## Tasks

### 1. Khởi tạo dự án Vite
```bash
cd source/frontend
npm create vite@latest ./ -- --template react-ts
npm install
```

### 2. Cài Dependencies
```bash
# Routing
npm install react-router-dom

# Server state
npm install @tanstack/react-query

# Client state
npm install zustand

# HTTP Client
npm install axios

# Forms
npm install react-hook-form @hookform/resolvers zod

# Charts
npm install recharts

# Icons
npm install lucide-react

# Date utils
npm install date-fns

# Dev dependencies
npm install -D @types/node eslint prettier eslint-config-prettier
```

### 3. Cấu hình Path Aliases
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
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

```json
// tsconfig.json - thêm paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 4. Tạo Cấu Trúc Folder
```
src/
├── app/
│   ├── App.tsx
│   ├── Router.tsx
│   └── Providers.tsx
├── assets/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── charts/
│   └── feedback/
├── features/
├── hooks/
├── lib/
│   ├── axios.ts
│   ├── queryClient.ts
│   └── constants.ts
├── stores/
├── types/
├── utils/
├── styles/
│   ├── globals.css
│   └── variables.css
└── main.tsx
```

### 5. Setup Axios Instance
### 6. Setup React Query Client
### 7. Setup ESLint + Prettier
### 8. Tạo file .env.example

---

## Acceptance Criteria

- [ ] `npm run dev` chạy thành công tại `localhost:5173`
- [ ] Path alias `@/` hoạt động
- [ ] ESLint + Prettier đã cấu hình
- [ ] Folder structure đầy đủ theo kiến trúc
- [ ] Axios instance tạo xong với interceptors
- [ ] React Query provider wrap App

## Dependencies
- Không (đây là phase đầu tiên frontend)
