# ⚙️ CHI TIẾT CÁC PHASE PHÁT TRIỂN BACKEND

## Phase 01: Quản trị Tài sản & Sức khỏe (AMS Core)
- [ ] Implement Asset & Toolset CRUD.
- [ ] Phát triển thuật toán `AssetCodeGenerator`.
- [ ] Xây dựng logic `AssetHealthMonitor`: Tính toán khấu hao và chu kỳ bảo trì.

## Phase 02: Xác thực & Phân quyền (Auth & RBAC)
- [ ] JWT Authentication với Access/Refresh Token.
- [ ] Phân quyền đa cấp: Admin, Teacher, Student, IT Staff.
- [ ] Middleware `AuditLog`: Ghi lại vết mọi hành động thay đổi tài sản.

## Phase 03: Nghiệp vụ Mượn/Trả (Borrowing Flow)
- [ ] API mượn thiết bị cho Sinh viên (MSSV + QR Code).
- [ ] **BorrowTransactionService**: Sử dụng MySQL Transaction để đảm bảo tính toàn vẹn (concurrency control).
- [ ] Logic tự động khóa mượn nếu sinh viên nợ thiết bị quá hạn.

## Phase 04: Ticket & Bảo trì Realtime
- [ ] API Báo hỏng (Failure Ticket) kèm upload ảnh tình trạng.
- [ ] Tích hợp Socket.io: Notify IT Staff khi có ticket mới.
- [ ] Cron Job: Tự động tạo Ticket bảo trì khi thiết bị/linh kiện (Pin, bóng đèn) đến hạn.

## Phase 05: Thông báo & Tương tác
- [ ] Timeline API: Đăng thông báo, tin tức nhà trường.
- [ ] Survey API: Tạo form khảo sát chất lượng thiết bị (Dùng JSON Column).

## Phase 06: Báo cáo & Thống kê
- [ ] Analytics API: Thống kê hiệu suất IT, tỉ lệ hỏng hóc, giá trị tài sản còn lại.
- [ ] Export Service: Xuất báo cáo Excel/PDF (Dùng BullMQ xử lý ngầm).
