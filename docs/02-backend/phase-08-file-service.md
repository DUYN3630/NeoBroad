# Phase 08 — File Service (Quản Lý File)

> **Mục tiêu**: Upload, download, quản lý file đính kèm trong hệ thống.

---

## Tasks

### 1. File Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `POST /api/v1/files/upload` | POST | All | Upload file (multipart/form-data) |
| `POST /api/v1/files/upload-multiple` | POST | All | Upload nhiều file |
| `GET /api/v1/files/{id}` | GET | All | Download/view file |
| `GET /api/v1/files/{id}/info` | GET | All | Metadata file |
| `DELETE /api/v1/files/{id}` | DELETE | Uploader/Admin | Xóa file |
| `GET /api/v1/files` | GET | Admin | Danh sách tất cả files |

### 2. File Storage Strategy
```
uploads/
├── 2026/
│   ├── 04/
│   │   ├── {uuid}.jpg
│   │   ├── {uuid}.pdf
│   │   └── {uuid}_thumb.jpg    ← Thumbnail cho ảnh
```

### 3. File Entity
```csharp
public class FileAttachment
{
    public Guid Id { get; set; }
    public string FileName { get; set; }           // UUID name
    public string OriginalName { get; set; }       // Tên gốc user upload
    public string ContentType { get; set; }        // MIME type
    public long FileSizeBytes { get; set; }
    public string StoragePath { get; set; }        // Relative path
    public string? EntityType { get; set; }        // "TimelinePost", "Announcement"
    public Guid? EntityId { get; set; }            // ID entity đính kèm
    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
```

### 4. Validation
- Max file size: 10MB (configurable)
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
- Virus scan: (future — placeholder interface)
- Rename file to UUID to prevent path traversal

### 5. Image Processing (Optional v1)
- Tạo thumbnail cho ảnh (resize 200x200)
- Optimize ảnh JPEG quality

---

## Acceptance Criteria

- [ ] Upload single/multiple files thành công
- [ ] Validation file size & extension
- [ ] Download file bằng ID
- [ ] File lưu đúng cấu trúc thư mục year/month
- [ ] Rename file UUID, giữ original name metadata
- [ ] Xóa file xóa cả physical file + database record
- [ ] Admin xem danh sách tất cả files, filter theo type

## Dependencies
- Phase 01 (Foundation), Phase 02 (Auth)
