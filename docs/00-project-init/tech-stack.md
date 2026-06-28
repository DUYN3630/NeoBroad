# 🔧 Tech Stack — NeoBoard EDU-AMS

## Tổng Quan Kiến Trúc (.NET & React Stack)

```
┌──────────────────────────────────────────────────┐
│                   CLIENT (Browser)                │
│              React + Vite + Tailwind CSS          │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS / REST API / SignalR
                       ▼
┌──────────────────────────────────────────────────┐
│                   BACKEND API                     │
│            ASP.NET Core 8.0/9.0 (C#)              │
│               Clean Architecture                  │
├──────────────────────────────────────────────────┤
│ Web (API) → Application → Infrastructure → Domain │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                    MySQL 8.0                      │
│                Entity Framework Core              │
└──────────────────────────────────────────────────┘
```

---

## Chi Tiết Công Nghệ

### Backend (ASP.NET Core Enterprise)
| Công nghệ | Vai trò | Lý do |
|---|---|---|
| **ASP.NET Core** | Web Framework | Hiệu năng cao, bảo mật tốt, chuẩn Enterprise. |
| **EF Core** | ORM | Truy vấn LINQ mạnh mẽ, quản lý Migration chuyên nghiệp. |
| **MySQL 8.0** | Database | Hệ quản trị CSDL phổ biến và ổn định. |
| **Clean Architecture**| Pattern | Tách biệt hoàn toàn Business Logic và Infrastructure. |
| **JWT / Identity** | Auth | Bảo mật Token-based, phân quyền Role-based. |
| **SignalR** | Realtime | Thông báo đẩy và cập nhật trạng thái thời gian thực. |
| **Kendo UI** | Components | Bộ thư viện UI cao cấp cho ASP.NET Core. |

### Frontend (React + Vite)
| Công nghệ | Vai trò | Lý do |
|---|---|---|
| **React 19** | UI Library | Thư viện phổ biến nhất, hệ sinh thái rộng lớn. |
| **Vite** | Build Tool | Tốc độ phát triển cực nhanh (HMR). |
| **Zustand** | State Management| Nhẹ, dễ tích hợp với React. |
| **Axios** | HTTP Client | Xử lý request API chuyên nghiệp. |
| **TailwindCSS** | Styling | Xây dựng giao diện nhanh chóng, linh hoạt. |
| **Lucide React** | Icons | Bộ icon vector hiện đại. |

### DevOps & Tools
- **Hangfire / Quartz.NET**: Quản lý các task chạy ngầm (Auto-generate maintenance tickets).
- **System.Security.Cryptography**: Thư viện băm (SHA-256) cho cơ chế Blockchain-like Audit.
- **Visual Studio / VS Code**: Công cụ phát triển chính.
- **Entity Framework Migrations**: Quản lý phiên bản cơ sở dữ liệu.
- **MySQL Workbench**: Quản lý CSDL MySQL.
