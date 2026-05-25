# 🗄️ Thiết Kế Database — NeoBoard

## Database: PostgreSQL 16+
## ORM: Entity Framework Core 9 (Code-First)

---

## ERD — Sơ Đồ Quan Hệ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users        │     │  RefreshTokens   │     │   UserActivities │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Id (PK, Guid)   │──┐  │ Id (PK, Guid)   │     │ Id (PK, Guid)   │
│ Email (UQ)      │  ├──│ UserId (FK)     │     │ UserId (FK)     │──┐
│ PasswordHash    │  │  │ Token           │     │ Action          │  │
│ FullName        │  │  │ ExpiresAt       │     │ Description     │  │
│ AvatarUrl       │  │  │ CreatedAt       │     │ IpAddress       │  │
│ Role            │  │  └─────────────────┘     │ CreatedAt       │  │
│ Department      │  │                          └─────────────────┘  │
│ IsActive        │  │                                                │
│ LastLoginAt     │  │  ┌─────────────────┐                          │
│ CreatedAt       │  │  │   TimelinePosts  │                          │
│ UpdatedAt       │  │  ├─────────────────┤                          │
└─────────────────┘  ├──│ AuthorId (FK)   │                          │
                     │  │ Id (PK, Guid)   │                          │
                     │  │ Content         │                          │
                     │  │ ImageUrl        │                          │
                     │  │ LikeCount       │     ┌─────────────────┐  │
                     │  │ CommentCount    │     │   PostComments   │  │
                     │  │ IsPublished     │     ├─────────────────┤  │
                     │  │ CreatedAt       │     │ Id (PK, Guid)   │  │
                     │  │ UpdatedAt       │  ┌──│ PostId (FK)     │  │
                     │  └────────┬────────┘  │  │ AuthorId (FK)   │──┘
                     │           │           │  │ Content         │
                     │           └───────────┘  │ CreatedAt       │
                     │                          └─────────────────┘
                     │
                     │  ┌─────────────────┐     ┌─────────────────┐
                     │  │  Announcements   │     │  AnnouncementReads│
                     │  ├─────────────────┤     ├─────────────────┤
                     ├──│ AuthorId (FK)   │     │ Id (PK, Guid)   │
                     │  │ Id (PK, Guid)   │──┐  │ AnnouncementId  │──┐
                     │  │ Title           │  └──│ UserId (FK)     │  │
                     │  │ Content         │     │ ReadAt          │  │
                     │  │ Priority        │     └─────────────────┘  │
                     │  │ IsPublished     │                          │
                     │  │ PublishedAt     │                          │
                     │  │ ExpiresAt       │                          │
                     │  │ CreatedAt       │                          │
                     │  └─────────────────┘                          │
                     │                                                │
                     │  ┌─────────────────┐     ┌─────────────────┐  │
                     │  │    Surveys       │     │ SurveyQuestions  │  │
                     │  ├─────────────────┤     ├─────────────────┤  │
                     ├──│ CreatorId (FK)  │     │ Id (PK, Guid)   │  │
                     │  │ Id (PK, Guid)   │──┐  │ SurveyId (FK)   │──┘
                     │  │ Title           │  └──│ QuestionText    │
                     │  │ Description     │     │ QuestionType    │
                     │  │ Status          │     │ Options (JSON)  │
                     │  │ StartsAt        │     │ IsRequired      │
                     │  │ EndsAt          │     │ SortOrder       │
                     │  │ CreatedAt       │     └────────┬────────┘
                     │  └─────────────────┘              │
                     │                          ┌────────┴────────┐
                     │                          │ SurveyResponses  │
                     │                          ├─────────────────┤
                     │                          │ Id (PK, Guid)   │
                     │                          │ QuestionId (FK) │
                     │                          │ UserId (FK)     │
                     │                          │ Answer          │
                     │                          │ CreatedAt       │
                     │                          └─────────────────┘
                     │
                     │  ┌─────────────────┐
                     │  │  Notifications   │
                     │  ├─────────────────┤
                     ├──│ UserId (FK)     │
                     │  │ Id (PK, Guid)   │
                     │  │ Title           │
                     │  │ Message         │
                     │  │ Type            │
                     │  │ ReferenceId     │
                     │  │ IsRead          │
                     │  │ CreatedAt       │
                     │  └─────────────────┘
                     │
                     │  ┌─────────────────┐
                     │  │  FileAttachments │
                     │  ├─────────────────┤
                     └──│ UploadedById    │
                        │ Id (PK, Guid)   │
                        │ FileName        │
                        │ OriginalName    │
                        │ ContentType     │
                        │ FileSizeBytes   │
                        │ StoragePath     │
                        │ EntityType      │
                        │ EntityId        │
                        │ CreatedAt       │
                        └─────────────────┘
```

---

## Chi Tiết Từng Bảng

### Users
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK, default `gen_random_uuid()` | ID duy nhất |
| Email | `varchar(256)` | UNIQUE, NOT NULL | Email đăng nhập |
| PasswordHash | `varchar(512)` | NOT NULL | Bcrypt hash |
| FullName | `varchar(100)` | NOT NULL | Họ tên đầy đủ |
| AvatarUrl | `varchar(500)` | NULL | URL ảnh đại diện |
| Role | `smallint` | NOT NULL, default 3 | 0=SuperAdmin, 1=Admin, 2=Manager, 3=Employee |
| Department | `varchar(100)` | NULL | Phòng ban |
| IsActive | `boolean` | NOT NULL, default true | Tài khoản active? |
| LastLoginAt | `timestamptz` | NULL | Lần đăng nhập cuối |
| CreatedAt | `timestamptz` | NOT NULL, default now() | Ngày tạo |
| UpdatedAt | `timestamptz` | NULL | Ngày cập nhật cuối |

### RefreshTokens
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK | ID duy nhất |
| UserId | `uuid` | FK → Users, NOT NULL | User sở hữu token |
| Token | `varchar(512)` | NOT NULL, UNIQUE | Refresh token string |
| ExpiresAt | `timestamptz` | NOT NULL | Thời điểm hết hạn |
| IsRevoked | `boolean` | NOT NULL, default false | Đã thu hồi? |
| CreatedAt | `timestamptz` | NOT NULL | Ngày tạo |

### TimelinePosts
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK | ID duy nhất |
| AuthorId | `uuid` | FK → Users, NOT NULL | Người đăng |
| Content | `text` | NOT NULL | Nội dung bài viết |
| ImageUrl | `varchar(500)` | NULL | Ảnh đính kèm |
| LikeCount | `int` | NOT NULL, default 0 | Số lượt thích |
| CommentCount | `int` | NOT NULL, default 0 | Số bình luận |
| IsPublished | `boolean` | NOT NULL, default true | Đã publish? |
| CreatedAt | `timestamptz` | NOT NULL | Ngày tạo |
| UpdatedAt | `timestamptz` | NULL | Ngày cập nhật |

### Announcements
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK | ID duy nhất |
| AuthorId | `uuid` | FK → Users | Người tạo |
| Title | `varchar(200)` | NOT NULL | Tiêu đề |
| Content | `text` | NOT NULL | Nội dung |
| Priority | `smallint` | NOT NULL, default 0 | 0=Normal, 1=Important, 2=Urgent |
| IsPublished | `boolean` | NOT NULL, default false | Đã publish? |
| PublishedAt | `timestamptz` | NULL | Thời điểm publish |
| ExpiresAt | `timestamptz` | NULL | Thời điểm hết hạn |
| CreatedAt | `timestamptz` | NOT NULL | Ngày tạo |

### Surveys
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK | ID duy nhất |
| CreatorId | `uuid` | FK → Users | Người tạo |
| Title | `varchar(200)` | NOT NULL | Tiêu đề |
| Description | `text` | NULL | Mô tả |
| Status | `smallint` | NOT NULL, default 0 | 0=Draft, 1=Active, 2=Closed |
| StartsAt | `timestamptz` | NULL | Thời điểm bắt đầu |
| EndsAt | `timestamptz` | NULL | Thời điểm kết thúc |
| CreatedAt | `timestamptz` | NOT NULL | Ngày tạo |

### Notifications
| Cột | Kiểu | Constraints | Mô tả |
|---|---|---|---|
| Id | `uuid` | PK | ID duy nhất |
| UserId | `uuid` | FK → Users | Người nhận |
| Title | `varchar(200)` | NOT NULL | Tiêu đề |
| Message | `text` | NOT NULL | Nội dung |
| Type | `varchar(50)` | NOT NULL | Loại: `post_like`, `comment`, `announcement`, `survey` |
| ReferenceId | `uuid` | NULL | ID entity liên quan |
| IsRead | `boolean` | NOT NULL, default false | Đã đọc? |
| CreatedAt | `timestamptz` | NOT NULL | Ngày tạo |

---

## Index Strategy

```sql
-- Performance indexes
CREATE INDEX IX_Users_Email ON "Users" ("Email");
CREATE INDEX IX_Users_Role ON "Users" ("Role");
CREATE INDEX IX_Users_IsActive ON "Users" ("IsActive");

CREATE INDEX IX_TimelinePosts_AuthorId ON "TimelinePosts" ("AuthorId");
CREATE INDEX IX_TimelinePosts_CreatedAt ON "TimelinePosts" ("CreatedAt" DESC);
CREATE INDEX IX_TimelinePosts_IsPublished ON "TimelinePosts" ("IsPublished");

CREATE INDEX IX_Announcements_IsPublished ON "Announcements" ("IsPublished");
CREATE INDEX IX_Announcements_PublishedAt ON "Announcements" ("PublishedAt" DESC);

CREATE INDEX IX_Notifications_UserId_IsRead ON "Notifications" ("UserId", "IsRead");
CREATE INDEX IX_Notifications_CreatedAt ON "Notifications" ("CreatedAt" DESC);

CREATE INDEX IX_SurveyResponses_QuestionId ON "SurveyResponses" ("QuestionId");
CREATE INDEX IX_SurveyResponses_UserId ON "SurveyResponses" ("UserId");

CREATE INDEX IX_FileAttachments_EntityType_EntityId ON "FileAttachments" ("EntityType", "EntityId");
```

---

## Seed Data

Khi chạy migration lần đầu, seed các dữ liệu mặc định:

1. **Super Admin account**: `admin@neoboard.com` / password hash
2. **Demo users**: 5 user mẫu với các role khác nhau
3. **Sample departments**: "Kỹ thuật", "Kinh doanh", "Nhân sự", "Marketing"
