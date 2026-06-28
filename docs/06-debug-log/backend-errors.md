# 🐞 Nhật Ký Lỗi Backend — NeoBoard EDU-AMS

Tài liệu này ghi lại các lỗi phổ biến trong quá trình phát triển Backend NestJS & MySQL.

## 1. Lỗi Kết Nối Database (MySQL Connection)
- **🏷️ Tags:** #backend #mysql #db-connection #prisma
- **Triệu chứng:** Backend khởi động lỗi, báo `P1001: Can't reach database server`.
- **Nguyên nhân:** 
  1. MySQL service chưa chạy.
  2. Sai `DATABASE_URL` trong file `.env`.
- **Cách xử lý:** 
  1. Kiểm tra MySQL service (Port 3306).
  2. Đảm bảo username/password trong `.env` chính xác.

## 2. Lỗi Tranh Chấp Mượn Trả (Race Condition)
- **🏷️ Tags:** #backend #transaction #concurrency
- **Triệu chứng:** Hai sinh viên cùng mượn 1 máy, hệ thống tạo ra 2 đơn mượn cho cùng 1 thiết bị.
- **Giải pháp:** Sử dụng **Interactive Transactions** của Prisma:
  ```typescript
  await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id }, lock: true });
    if (asset.status !== 'Available') throw new Error('Already borrowed');
    // ... thực hiện mượn
  });
  ```

## 3. Lỗi BullMQ / Redis
- **🏷️ Tags:** #backend #redis #bullmq #queue
- **Triệu chứng:** Tác vụ xuất báo cáo không chạy, đứng ở trạng thái `Pending`.
- **Cách xử lý:** 
  1. Kiểm tra Redis server (Port 6379).
  2. Đảm bảo worker của BullMQ đã được khởi tạo trong module tương ứng.

## 4. Lỗi JWT Expired
- **🏷️ Tags:** #backend #auth #jwt
- **Triệu chứng:** User bị logout liên tục hoặc không thể call API sau 1 tiếng.
- **Giải pháp:** Triển khai cơ chế **Refresh Token** để lấy Access Token mới mà không cần đăng nhập lại.
