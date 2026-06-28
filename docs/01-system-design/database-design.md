# THIẾT KẾ CƠ SỞ DỮ LIỆU (MYSQL) - NEOBOARD EDU-AMS

---

## 1. SƠ ĐỒ QUAN HỆ CHÍNH

### A. Nhóm Tài Sản (Assets & Toolsets)
*   **Assets:** `id`, `asset_code` (MC-2024-001), `name`, `category_id`, `brand_id`, `location_id`, `serial_number`, `purchase_date`, `warranty_expiry`, `status` (Available, Borrowed, Repairing, Disposed), `image_url`.
*   **Toolsets:** `id`, `name`, `description`, `total_quantity`, `available_quantity`.
*   **Categories:** `id`, `name`, `prefix` (ví dụ: MC cho Máy chiếu).

### B. Nhóm Vận Hành (Borrowing & Students)
*   **Students:** `id`, `student_code` (MSSV), `full_name`, `class_name`, `email`, `is_blocked`.
*   **BorrowRequests:** `id`, `student_id`, `request_date`, `status`, `evidence_photo_url` (Ảnh selfie lúc mượn), `transaction_hash` (Mã hash giao dịch), `previous_hash` (Mã hash của giao dịch trước đó - Linked Log).
*   **BorrowItems:** `id`, `request_id`, `asset_id`, `toolset_id`, `quantity`, `due_date`, `return_date`, `actual_status_on_return`.

### C. Nhóm Bảo Trì & Sức Khỏe (Health & Maintenance)
*   **Asset_Health:** ...
*   **Tickets:** `id`, `asset_id`, `reporter_id`, `type` (Failure, Auto_Maintenance), `priority`, `description`, `status` (Open, In_Progress, Resolved, Closed).

---

## 2. CÁC TRANSACTION QUAN TRỌNG

1.  **Nghiệp vụ Mượn Thiết Bị:**
    *   Bắt đầu Transaction.
    *   Check `Students.is_blocked`.
    *   Check `Assets.status == 'Available'`.
    *   Tạo `BorrowRequest` & `BorrowItems`.
    *   Update `Assets.status = 'Borrowed'`.
    *   Commit (Nếu bất kỳ bước nào lỗi -> Rollback để tránh mất mát dữ liệu).

2.  **Nghiệp vụ Trả & Kiểm tra bảo trì:**
    *   Update `Assets.status = 'Available'`.
    *   Ghi log vào `Asset_Logs`.
    *   Nếu người trả báo "Hơi lag" -> Tự động sinh một `Failure Ticket` ở trạng thái `Pending`.
