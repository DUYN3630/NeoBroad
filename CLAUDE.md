# NeoBoard — Nền Tảng Dashboard Quản Trị Doanh Nghiệp

## Tổng Quan Dự Án
NeoBoard là một nền tảng dashboard quản trị hiện đại theo mô hình SaaS, cung cấp giao diện chuyên nghiệp và trực quan để quản lý dữ liệu, báo cáo, người dùng, và hệ thống doanh nghiệp (CRM, ERP, quản lý dự án, quản lý kho).

## Tech Stack
| Thành phần | Công nghệ | Version |
|---|---|---|
| **Backend** | ASP.NET Core MVC | .NET 9 |
| **Frontend** | React + Vite | React 19, Vite 6 |
| **Database** | PostgreSQL | 16+ |
| **Auth** | JWT (Access + Refresh Token) | — |
| **ORM** | Entity Framework Core | 9.x |
| **API Docs** | Swagger / OpenAPI | — |

## Cấu Trúc Thư Mục

```
Vide_code/
├── CLAUDE.md                    ← BẠN ĐANG ĐÂY
├── docs/                        ← Tài liệu dự án
│   ├── 00-project-init/         # Khởi tạo, giới thiệu, setup
│   ├── 01-system-design/        # Kiến trúc BE, FE, shared, UI design guide
│   ├── 02-backend/              # 8 phase phát triển BE + operations manual
│   ├── 03-frontend/             # 9 phase phát triển FE
│   ├── 04-testing/              # Chiến lược testing + features
│   ├── 05-deployment/           # Deploy, Docker, CI/CD
│   ├── 06-debug-log/            # Nhật ký debug & cách fix lỗi
│   ├── CHANGELOG.md             # Lịch sử thay đổi
│   ├── CONVENTIONS.md           # Quy ước coding
│   └── GLOSSARY.md              # Thuật ngữ dự án
├── source/
│   ├── backend/                 # ASP.NET Core MVC project
│   └── frontend/                # React + Vite project
└── .gitignore
```

## Lệnh Chạy Dev

```bash
# Backend
cd source/backend/NeoBoard.Web
dotnet restore
dotnet ef database update
dotnet run

# Frontend
cd source/frontend
npm install
npm run dev
```

## Quy Tắc Coding Quan Trọng

### Backend (.NET)
- Kiến trúc: **Clean Architecture** (Domain → Application → Infrastructure → Web)
- Naming: **PascalCase** cho class/method, **camelCase** cho biến local
- Mỗi API trả về format chuẩn: `{ success, data, message, errors }`
- Sử dụng **Repository Pattern** + **Unit of Work**
- Tất cả endpoint phải có **XML documentation comment**

### Frontend (React)
- Cấu trúc: **Feature-based** folders
- State management: **React Query** (server state) + **Zustand** (client state)
- Styling: **CSS Modules** hoặc **Tailwind CSS**
- Component naming: **PascalCase**, file naming: **PascalCase.tsx**
- Mỗi component phải có **PropTypes** hoặc **TypeScript interface**

### Chung
- JSON response: **camelCase**
- Date/Time: **ISO 8601** (UTC), convert sang local ở frontend
- Pagination: `{ items, totalCount, page, pageSize }`
- Commit message: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

## Tài Liệu Tham Khảo

> Đọc các file theo thứ tự để hiểu dự án:
> 1. `docs/00-project-init/README.md` — Dự án là gì
> 2. `docs/01-system-design/` — Thiết kế hệ thống
> 3. `docs/02-backend/` — Các phase backend (01→08)
> 4. `docs/03-frontend/` — Các phase frontend (01→09)
> 5. `docs/01-system-design/ui-design-guide.md` — **BẮT BUỘC ĐỌC** trước khi code UI
> 6. `docs/06-debug-log/` — Lỗi đã gặp & cách fix

## Lưu Ý Cho AI Agent

1. **ĐỌC `docs/01-system-design/ui-design-guide.md` TRƯỚC** khi code bất kỳ UI nào — tránh giao diện trẻ con
2. **ĐỌC `docs/06-debug-log/` TRƯỚC** khi fix lỗi — tránh lặp lỗi cũ
3. **KHÔNG xóa/thay đổi file khác** khi fix 1 file — tránh tạo lỗi mới
4. **LUÔN chạy test** sau khi sửa code
5. **GHI LẠI** lỗi mới vào `docs/06-debug-log/` sau khi fix
6. Đọc `docs/CONVENTIONS.md` để tuân thủ quy ước
7. Đọc `docs/GLOSSARY.md` để hiểu thuật ngữ domain
