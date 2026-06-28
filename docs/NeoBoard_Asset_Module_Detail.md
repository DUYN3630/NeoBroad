# ĐẶC TẢ CHI TIẾT NGHIỆP VỤ: QUẢN LÝ THIẾT BỊ (ASSET MANAGEMENT)
*Mục tiêu: Tối ưu hóa trải nghiệm người dùng, giảm thiểu nhập liệu thủ công, đảm bảo chuẩn dữ liệu Enterprise.*

---

## 1. TRANG DANH SÁCH THIẾT BỊ (ASSET LIST PAGE)

Giao diện dạng bảng (Data Table) với các cột dữ liệu "đắt giá" nhất để quản lý:

| STT | Tên Cột | Loại Dữ Liệu | Nghiệp Vụ & Tiện Ích |
| :--- | :--- | :--- | :--- |
| 1 | **Mã Tài Sản** | Badge (Text) | Click để xem nhanh lịch sử mượn/trả. |
| 2 | **Hình Ảnh** | Thumbnail | Ảnh thật của thiết bị để nhận diện nhanh. |
| 3 | **Tên Thiết Bị** | Text | Tên model (Ví dụ: Dell Latitude 5420). |
| 4 | **Loại** | Category Tag | Laptop, Máy chiếu, Micro... (Màu sắc khác nhau). |
| 5 | **Vị Trí** | Location Tag | Phòng học/Kho (Ví dụ: A.101, Kho Tổng). |
| 6 | **Tình Trạng** | Status Badge | Sẵn dùng (Xanh), Đang mượn (Vàng), Đang sửa (Đỏ), Thanh lý (Xám). |
| 7 | **Người Đang Giữ** | Avatar + Name | Hiện ảnh giáo viên đang mượn (nếu có). |
| 8 | **Bảo Hành** | Date Count | Tự động tính: "Còn 30 ngày" hoặc "Hết hạn" (Màu đỏ cảnh báo). |
| 9 | **Thao Tác** | Icon Buttons | Xem chi tiết, Sửa, In mã QR, Lịch sử bảo trì. |

---

## 2. FORM THÊM MỚI THIẾT BỊ (ADD ASSET FLOW)
*Layout đề xuất: **Side Drawer (Trượt từ phải sang)** - Giúp người dùng thêm nhanh mà không mất ngữ cảnh của danh sách bên dưới.*

### A. Thông tin cơ bản (Nhập liệu thông minh)
1.  **Loại thiết bị (Dropdown - Chọn):** 
    *   Dữ liệu từ bảng `Categories`.
    *   *Tiện ích:* Chọn xong sẽ kích hoạt thuật toán gen mã phía dưới.
2.  **Tên thiết bị (Text - Nhập tay):** Ví dụ: "Máy chiếu Epson EB-X06".
3.  **Mã Tài Sản (Auto-Generate - Thuật toán):**
    *   **Logic:** `[Mã Loại]-[Năm Nhập]-[Số Thứ Tự]`
    *   *Ví dụ:* Người dùng chọn loại "Máy chiếu" (MC), năm 2024. Hệ thống tự check DB thấy đã có 10 cái, nó sẽ tự điền: `MC-2024-011`.
    *   *Tiện ích:* Cho phép sửa tay nếu trường có quy tắc riêng, nhưng mặc định là tự sinh để không bị trùng.
4.  **Thương hiệu (Searchable Dropdown):** Apple, Dell, Sony... (Có nút thêm nhanh thương hiệu mới ngay tại đây).

### B. Thông tin Kỹ thuật & Quản lý (Tiết kiệm thời gian)
5.  **Số Serial / S/N (Nhập tay):** Quét bằng máy quét mã vạch hoặc nhập tay để định danh duy nhất (Unique).
6.  **Vị trí mặc định (Dropdown - Chọn):** Lấy dữ liệu từ bảng `Locations` (Danh sách phòng học). 
    *   *Tiện ích:* Tự động gán thiết bị vào phòng học ngay khi tạo.
7.  **Giá trị nhập kho (Number):** Nhập giá tiền để tính khấu hao.
8.  **Ngày mua & Thời hạn bảo hành (Date Picker):** 
    *   *Thuật toán:* Chọn ngày mua -> Tự cộng 12/24 tháng để ra ngày hết hạn bảo hành.

---

## 3. THUẬT TOÁN HỖ TRỢ NGƯỜI DÙNG (SMART LOGIC)

*   **Smart Naming Suggestions:** Khi người dùng bắt đầu gõ "Dell...", hệ thống gợi ý các model cũ đã nhập để tránh gõ sai (Ví dụ: "Dell Latitude 5420" vs "Dell Lattitude 5420").
*   **Bulk Add (Thêm hàng loạt):** Nếu trường mua 50 cái Laptop giống hệt nhau:
    *   Người dùng chỉ nhập 1 cái.
    *   Chọn "Sao chép cho 50 cái".
    *   Hệ thống tự động sinh 50 bản ghi với 50 Mã Tài Sản khác nhau, người dùng chỉ việc điền 50 số Serial là xong.
*   **QR Code Instant Preview:** Ngay khi mã tài sản được gen, một mã QR nhỏ hiện ra bên cạnh để xem trước.

---

## 4. CƠ SỞ DỮ LIỆU LIÊN KẾT (DATABASE SCHEMA - MYSQL)

Để hoàn thiện nghiệp vụ, các bảng phải "nói chuyện" với nhau như sau:

1.  **Bảng `Assets` (Thiết bị):** Lưu `Category_Id`, `Location_Id`, `Brand_Id`.
2.  **Bảng `Categories`:** Lưu Mã loại (MC, LT, MI) để phục vụ thuật toán gen mã.
3.  **Bảng `Locations` (Vị trí):** Lưu thông tin Phòng, Tòa nhà.
4.  **Bảng `Asset_Logs` (Quan trọng nhất):** 
    *   Mỗi khi thiết bị đổi vị trí, đổi người cầm, hay đổi tình trạng, một dòng mới tự động chèn vào đây.
    *   Giúp trả lời câu hỏi: "Cái máy này 1 năm qua đã ở những đâu, ai làm hỏng?".

---

## 5. FLOW HOÀN THIỆN (STEP-BY-STEP)

1.  **Bước 1:** Click nút "Thêm thiết bị" -> Drawer trượt ra.
2.  **Bước 2:** Chọn Loại (Category) -> Hệ thống lấy mã `MC` từ DB -> Gen mã `MC-2024-001`.
3.  **Bước 3:** Nhập tên và Serial. Chọn vị trí phòng A.101.
4.  **Bước 4:** Tải lên ảnh chụp thực tế (Drag & Drop).
5.  **Bước 5:** Nhấn "Lưu & In QR".
    *   **Backend:** Tạo transaction -> Lưu vào bảng `Assets` -> Ghi log vào `Asset_Logs` -> Trả về kết quả.
    *   **Frontend:** Hiện thông báo thành công -> Mở cửa sổ in mã QR ngay lập tức để dán lên máy.

**Kịch bản này đảm bảo:** Người dùng chỉ phải nhập tay những gì "duy nhất" (Tên, Serial, Giá), còn lại hệ thống sẽ **Gợi ý, Chọn, và Tự động sinh**.

Bạn thấy cấu trúc này đã đủ "tiện lợi" cho một nhân viên quản lý thiết bị chưa? Tôi có thể viết tiếp kịch bản cho **Module Mượn/Trả** với luồng phê duyệt phức tạp tương tự nhé?