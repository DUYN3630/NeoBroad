# 🔧 Tech Stack — NeoBoard

## Tổng Quan Kiến Trúc

```
┌──────────────────────────────────────────────────┐
│                   CLIENT (Browser)                │
│              React 19 + Vite 6 + TypeScript       │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS / REST API
                       ▼
┌──────────────────────────────────────────────────┐
│                   API GATEWAY                     │
│            ASP.NET Core 9 MVC                     │
│         JWT Authentication Middleware             │
├──────────────────────────────────────────────────┤
│  Controllers → Services → Repositories → EF Core │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                  PostgreSQL 16+                   │
│              Entity Framework Core 9              │
└──────────────────────────────────────────────────┘
```

---

## Chi Tiết Công Nghệ

### Backend

| Công nghệ | Version | Vai trò | Lý do chọn |
|---|---|---|---|
| **ASP.NET Core MVC** | .NET 9 | Web Framework | Hiệu năng cao, cross-platform, ecosystem mạnh |
| **Entity Framework Core** | 9.x | ORM | Code-first, migration mạnh, LINQ support |
| **PostgreSQL** | 16+ | Database | Open-source, JSON support tốt, hiệu năng cao |
| **Npgsql** | 9.x | DB Driver | Provider chính thức cho EF Core + PostgreSQL |
| **JWT Bearer** | — | Authentication | Stateless, scalable, phù hợp SPA |
| **Serilog** | 4.x | Logging | Structured logging, nhiều sink (File, Console, Seq) |
| **FluentValidation** | 11.x | Validation | Tách validation ra khỏi model, dễ test |
| **AutoMapper** | 13.x | Object Mapping | Map Entity ↔ DTO tự động |
| **Swagger / Swashbuckle** | — | API Docs | Tự động tạo tài liệu API |
| **MediatR** | 12.x | CQRS Pattern | Tách command/query, giảm coupling |

### Frontend

| Công nghệ | Version | Vai trò | Lý do chọn |
|---|---|---|---|
| **React** | 19 | UI Framework | Component-based, ecosystem lớn nhất |
| **Vite** | 6.x | Build Tool | HMR cực nhanh, config đơn giản |
| **TypeScript** | 5.x | Language | Type safety, IntelliSense tốt hơn |
| **React Router** | 7.x | Routing | Client-side routing tiêu chuẩn |
| **React Query (TanStack)** | 5.x | Server State | Caching, refetch tự động, offline support |
| **Zustand** | 5.x | Client State | Nhẹ, đơn giản, không boilerplate |
| **Axios** | 1.x | HTTP Client | Interceptors, request/response transform |
| **Recharts** | 2.x | Charts | Dựa trên D3, dễ dùng với React |
| **React Hook Form** | 7.x | Form | Performance tốt, validation dễ tích hợp |
| **Zod** | 3.x | Schema Validation | Type-safe, tích hợp React Hook Form |
| **Lucide React** | — | Icons | Nhẹ, tree-shakable, đẹp |

### DevOps & Tools

| Công nghệ | Vai trò |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Local dev environment |
| **Git** | Version control |
| **ESLint + Prettier** | Code linting & formatting |
| **xUnit** | Unit testing (.NET) |
| **Vitest** | Unit testing (React) |
| **React Testing Library** | Component testing |

---

## Yêu Cầu Hệ Thống (Local Dev)

| Yêu cầu | Version tối thiểu |
|---|---|
| .NET SDK | 9.0+ |
| Node.js | 20 LTS+ |
| npm | 10+ |
| PostgreSQL | 16+ |
| Git | 2.40+ |
| IDE (recommend) | Visual Studio 2022 / VS Code / Rider |
