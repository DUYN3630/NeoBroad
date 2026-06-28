# ⚙️ Hướng Dẫn Vận Hành Backend — NeoBoard EDU-AMS

Tài liệu này dành cho nhân viên IT/DevOps để quản lý và vận hành hệ thống Backend.

## 1. Các Lệnh Vận Hành Chính

| Lệnh | Mô tả |
|---|---|
| `npm run start:dev` | Chạy backend ở chế độ Development (Auto-reload). |
| `npm run build` | Build dự án ra mã JavaScript để chạy Production. |
| `npm run start:prod` | Chạy backend từ bản build (Production mode). |
| `npx prisma migrate dev` | Áp dụng thay đổi Database và gen Prisma Client. |
| `npx prisma studio` | Giao diện Web để xem và sửa dữ liệu MySQL trực tiếp. |

---

## 2. Biến Môi Trường (.env)

Cần cấu hình đầy đủ các biến sau:
- `DATABASE_URL`: Đường dẫn kết nối MySQL.
- `REDIS_URL`: Kết nối Redis (ví dụ `redis://localhost:6379`).
- `JWT_SECRET`: Khóa bí mật để ký Token.
- `PORT`: Cổng chạy Backend (mặc định 3000).

---

## 3. Quy Trình Cập Nhật Database (Migration)

Khi bạn thay đổi `schema.prisma` (thêm bảng, thêm cột):
1. Chạy `npx prisma migrate dev --name <ten_migration>`.
2. Prisma sẽ tự động tạo file SQL trong folder `prisma/migrations` và cập nhật vào MySQL.
3. Chạy `npx prisma generate` để cập nhật TypeScript types.

---

## 4. Giám Sát & Logs

- **Logs:** Logs hệ thống được ghi ra console. Khuyên dùng **PM2** để quản lý tiến trình và lưu log vào file.
  - Cài đặt: `npm install -g pm2`
  - Chạy: `pm2 start dist/main.js --name neoboard-api`
  - Xem logs: `pm2 logs neoboard-api`

---

## 5. Backup & Restore (MySQL)

**Backup:**
```bash
mysqldump -u root -p NeoBoardDb > backup_$(date +%F).sql
```

**Restore:**
```bash
mysql -u root -p NeoBoardDb < backup.sql
```
