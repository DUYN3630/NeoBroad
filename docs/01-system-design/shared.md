# 🔗 Thiết Kế Chung (Shared) — NeoBoard

> File này chứa các quy ước, format, và contract chung giữa Backend và Frontend.
> Cả 2 đội phải tuân thủ để đảm bảo tích hợp suôn sẻ.

---

## 1. API Base Configuration

| Thuộc tính | Giá trị |
|---|---|
| Base URL (dev) | `https://localhost:5001/api/v1` |
| Base URL (prod) | `https://api.neoboard.com/api/v1` |
| Protocol | HTTPS |
| Format | JSON (application/json) |
| Encoding | UTF-8 |
| Date format | ISO 8601 (`2026-04-07T12:00:00Z`) |
| Timezone | UTC (server) → Local (client convert) |

---

## 2. Authentication Header

```http
Authorization: Bearer <access_token>
```

### Token Flow
```
1. Client POST /api/v1/auth/login { email, password }
2. Server trả về { accessToken, refreshToken, expiresIn }
3. Client lưu tokens vào Zustand store (persist localStorage)
4. Mỗi request: Client gắn accessToken vào header Authorization
5. Khi accessToken hết hạn (401):
   - Client POST /api/v1/auth/refresh { refreshToken }
   - Server trả về accessToken mới
   - Nếu refreshToken cũng hết hạn → redirect về /login
```

---

## 3. API Response Format Chuẩn

### Thành công (200, 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công",
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Thành công + Phân trang
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "message": null,
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Lỗi validation (400)
```json
{
  "success": false,
  "data": null,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "email", "message": "Email không đúng định dạng" },
    { "field": "password", "message": "Mật khẩu phải có ít nhất 8 ký tự" }
  ],
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Lỗi không tìm thấy (404)
```json
{
  "success": false,
  "data": null,
  "message": "Không tìm thấy người dùng với ID: abc-123",
  "errors": null,
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Lỗi unauthorized (401)
```json
{
  "success": false,
  "data": null,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "errors": null,
  "timestamp": "2026-04-07T12:00:00Z"
}
```

### Lỗi server (500)
```json
{
  "success": false,
  "data": null,
  "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
  "errors": null,
  "timestamp": "2026-04-07T12:00:00Z"
}
```

---

## 4. Shared Models / DTOs

### User Model
```typescript
// Frontend type
interface User {
  id: string;                  // Guid
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  department: string | null;
  isActive: boolean;
  lastLoginAt: string | null;  // ISO date
  createdAt: string;           // ISO date
}

enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
}
```

```csharp
// Backend entity
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public enum UserRole
{
    SuperAdmin = 0,
    Admin = 1,
    Manager = 2,
    Employee = 3
}
```

### Common Request/Response Types

```typescript
// Pagination Request
interface PaginationParams {
  page?: number;       // default: 1
  pageSize?: number;   // default: 20, max: 100
  sortBy?: string;     // field name
  sortOrder?: 'asc' | 'desc';
  search?: string;     // global search
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: FieldError[] | null;
  timestamp: string;
}

interface FieldError {
  field: string;
  message: string;
}

interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## 5. Naming Convention Map

| Ngữ cảnh | Backend (C#) | Frontend (TS) | JSON (API) |
|---|---|---|---|
| Property | `FirstName` | `firstName` | `firstName` |
| Class/Type | `UserDto` | `UserDto` | — |
| Enum | `UserRole.Admin` | `UserRole.Admin` | `"Admin"` |
| Boolean | `IsActive` | `isActive` | `isActive` |
| Date | `DateTime` → UTC | `string` → ISO | `"2026-04-07T..."` |
| ID | `Guid` | `string` | `"uuid-string"` |

> **Lưu ý**: Backend serialize JSON dùng **camelCase** (cấu hình trong `Program.cs`):
> ```csharp
> builder.Services.AddControllers()
>     .AddJsonOptions(options =>
>     {
>         options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
>     });
> ```

---

## 6. File Upload Convention

| Thuộc tính | Quy định |
|---|---|
| Max file size | 10MB |
| Allowed image types | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| Allowed document types | `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.pptx` |
| Upload endpoint | `POST /api/v1/files/upload` |
| Upload method | `multipart/form-data` |
| Storage path | `/uploads/{year}/{month}/{filename}` |
| File name | UUID + original extension |
| Access URL | `/api/v1/files/{fileId}` |

---

## 7. HTTP Status Code Usage

| Code | Khi nào dùng |
|---|---|
| `200 OK` | GET thành công, PUT/PATCH thành công |
| `201 Created` | POST tạo resource thành công |
| `204 No Content` | DELETE thành công |
| `400 Bad Request` | Validation fail, request sai format |
| `401 Unauthorized` | Chưa đăng nhập, token hết hạn |
| `403 Forbidden` | Đã đăng nhập nhưng không có quyền |
| `404 Not Found` | Resource không tồn tại |
| `409 Conflict` | Trùng dữ liệu (email đã tồn tại) |
| `422 Unprocessable Entity` | Business logic error |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Lỗi server không xác định |

---

## 8. Environment Variables

### Backend (.NET)
```
# appsettings.json / appsettings.Development.json
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=NeoBoard;...
Jwt__SecretKey=...
Jwt__Issuer=NeoBoard
Jwt__Audience=NeoBoard-Client
```

### Frontend (Vite)
```env
VITE_API_BASE_URL=https://localhost:5001/api/v1
VITE_APP_NAME=NeoBoard
VITE_APP_VERSION=1.0.0
```

> **Quy tắc**: Frontend chỉ dùng biến có prefix `VITE_`. Không bao giờ đặt secret ở frontend.

---

## 9. Error Handling Strategy

### Backend
1. Dùng `ExceptionHandlingMiddleware` để bắt tất cả exception
2. Mọi lỗi đều trả về dạng `ApiResponse` chuẩn
3. Log lỗi chi tiết vào Serilog, KHÔNG expose stack trace cho client
4. Business exceptions dùng custom exception class

### Frontend
1. Axios interceptor bắt lỗi HTTP
2. React Error Boundary bắt lỗi render
3. Toast notification hiển thị lỗi cho user
4. Logging lỗi quan trọng (sẽ tích hợp error tracking service)
