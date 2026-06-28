# ĐẶC TẢ NGHIỆP VỤ CHUẨN: QUẢN LÝ THIẾT BỊ TRƯỜNG HỌC (EDU-AMS)
*Tập trung vào: Mượn/Trả Sinh Viên & Bảo trì dự báo vòng đời thiết bị.*

---

## 1. VÒNG ĐỜI THIẾT BỊ (ASSET LIFECYCLE) - TỰ ĐỘNG HÓA BẢO TRÌ

Đây là phần cốt lõi để quản lý thiết bị bền bỉ trong trường học. Hệ thống không chỉ lưu thông tin, mà còn **dự báo (Predictive Maintenance)**.

### A. Quản lý linh kiện hao mòn (Component Lifespan)
Khi thêm một thiết bị (ví dụ: Laptop), hệ thống cho phép cấu hình các linh kiện cần theo dõi:
*   **Pin (Battery):** Tuổi thọ trung bình 2 năm (730 ngày).
*   **Bóng đèn máy chiếu:** Tuổi thọ 3000 giờ sử dụng.
*   **Vệ sinh định kỳ:** Mỗi 6 tháng (180 ngày).

### B. Thuật toán tự động nhắc lịch bảo trì
*   **Dựa trên thời gian:** Backend chạy Cron Job hàng ngày. `Ngày hiện tại - Ngày bảo trì gần nhất > Chu kỳ bảo trì` -> Tự động chuyển trạng thái thiết bị sang "Cần bảo trì" và tạo Ticket cho đội IT.
*   **Dựa trên tần suất mượn:** `Số lần mượn > 50 lần` -> Nhắc nhở kiểm tra ngoại quan thiết bị.

---

## 2. LUỒNG MƯỢN THIẾT BỊ DÀNH CHO SINH VIÊN (STUDENT SELF-SERVICE)

Đây là trang Web/Mobile dành riêng cho sinh viên, tối ưu hóa để thực hiện nhanh trong 30 giây.

### Giao diện Form mượn (Student Borrow Form):
1.  **Mã Số Sinh Viên (MSSV):** 
    *   *Tiện ích:* Nhập MSSV -> Hệ thống tự động fetch Tên, Lớp, Khoa từ bảng `Students` (không cần nhập tay).
    *   *Kiểm tra:* Nếu sinh viên đang nợ thiết bị quá hạn hoặc đang bị cấm mượn -> Báo lỗi ngay lập tức.
2.  **Chọn Thiết Bị (Search & Scan):** 
    *   Sinh viên gõ tên thiết bị hoặc **Quét mã QR** dán trên thiết bị.
    *   Chỉ hiện những thiết bị đang ở trạng thái "Sẵn dùng".
3.  **Mục đích sử dụng:** Dropdown chọn (Học tại lớp, Làm đồ án, Câu lạc bộ...).
4.  **Thời gian trả dự kiến:** Mặc định là cuối buổi học, sinh viên có thể chọn lại.
5.  **Cam kết:** Checkbox xác nhận bảo quản tài sản.

---

## 3. CƠ SỞ DỮ LIỆU & MỐI QUAN HỆ (MYSQL SCHEMA)

Để hỗ trợ vòng đời và bảo trì, cấu trúc DB cần các bảng sau:

*   **Bảng `Assets`:** Lưu thông tin chung.
*   **Bảng `Asset_Health` (Mới):** 
    *   `last_maintenance_date`: Ngày bảo trì cuối.
    *   `maintenance_cycle_days`: Chu kỳ bảo trì (ví dụ 180 ngày).
    *   `estimated_replacement_date`: Ngày dự kiến phải thay mới (Thuật toán tự tính).
*   **Bảng `Borrow_Records`:** 
    *   `student_id`, `asset_id`, `borrow_time`, `due_time`, `return_time`.
    *   `status`: Đang mượn / Đã trả / Trả muộn / Hỏng hóc khi trả.
*   **Bảng `Maintenance_Logs`:** Lưu lịch sử mỗi lần bảo trì (Sửa gì? Thay gì? Ai sửa?).

---

## 4. FLOW TỔNG QUAN (END-TO-END)

1.  **Nhập kho:** IT nhập thiết bị -> Thiết lập chu kỳ bảo trì (VD: Máy tính này 6 tháng phải vệ sinh 1 lần).
2.  **Sinh viên mượn:** Sinh viên truy cập Form -> Nhập MSSV -> Quét QR máy tính -> Nhấn Mượn -> Trạng thái máy đổi sang "Đang mượn".
3.  **Theo dõi sức khỏe:** 
    *   Hàng ngày, Backend quét bảng `Asset_Health`. 
    *   Thấy Laptop mã `LT-001` đã đến hạn 6 tháng kể từ ngày vệ sinh cuối -> Bắn thông báo cho IT.
    *   IT thu hồi máy -> Cập nhật trạng thái "Đang bảo trì" -> Xử lý xong -> Reset ngày bảo trì về hôm nay.
4.  **Cảnh báo thay thế:** Nếu Pin của Laptop đã dùng được 22 tháng (gần ngưỡng 24 tháng), Dashboard hiện cảnh báo: "Sắp tới hạn thay pin cho 50 Laptop lô 2022".

**Đây mới chính là luồng chuẩn của một hệ thống Quản lý tài sản giáo dục.** Tôi đã xóa bỏ phần "mua hàng" không liên quan và tập trung hoàn toàn vào **Vận hành - Mượn trả - Bảo trì dự báo**. 

Bạn thấy luồng "Sức khỏe thiết bị" (Asset Health) này đã đúng ý bạn về việc theo dõi pin và định kỳ kiểm tra chưa?