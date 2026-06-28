# 📋 DANH SÁCH CÔNG VIỆC HOÀN THIỆN HỆ THỐNG (PROJECT TODO LIST)
## HỆ THỐNG NEOBOARD EDU-AMS

Tài liệu này tổng hợp toàn bộ các task công việc chi tiết cần thực hiện để hoàn thiện cả Frontend và Backend theo đúng luồng nghiệp vụ đã thống nhất. 

---

## 🛠️ PHASE 01: CHUẨN HÓA DỮ LIỆU & CƠ SỞ DỮ LIỆU (AMS CORE & DATABASE)
*Mục tiêu: Đảm bảo toàn bộ thông tin tài sản nhập từ Frontend được lưu trữ đầy đủ trong cơ sở dữ liệu.*

### 1. Backend: Nâng cấp Cơ sở dữ liệu & API
- [ ] **Database Migration:** 
  - Cập nhật Class `Asset.cs` ở tầng Domain để bổ sung các trường: `AssetCode`, `Model`, `Location`, `Custodian`, `Manufacturer`, `Supplier`, `InvoiceNumber`, `TechnicalSpecs`, `Notes`, `PurchaseDate`, `WarrantyMonths`, `WarrantyExpiration`, **`MaintenanceIntervalMonths`** (Chu kỳ bảo trì tính theo tháng), và **`AssignedTechnicianId`** (Kỹ thuật viên phụ trách).
  - Tạo và chạy lệnh Migration để cập nhật bảng `assets` trong MySQL database.
- [ ] **Assets Controller:** 
  - Cập nhật hàm `CreateAsset` và `UpdateAsset` trong `AssetsController.cs` để tiếp nhận, lưu và cập nhật đầy đủ các trường mới này.
- [ ] **Database Seeding:**
  - Viết code hạt giống dữ liệu (Seeding) để nạp sẵn một số phòng ban mẫu (`departments`) và tài khoản nhân viên kỹ thuật mẫu trong hệ thống.

### 2. Frontend: Chuẩn hóa nhập liệu Asset (Tài sản) & Toolset (Bộ công cụ)
- [x] **AssetModal:** Cải tiến tự tạo mã, tự tính bảo hành, định dạng tiền tệ và các dropdown (Đã hoàn thành).
- [ ] **AssetModal (Cấu hình bảo trì linh hoạt):**
  - Thêm ô chọn **Chu kỳ bảo trì định kỳ** (Dropdown chọn: 3 tháng, 6 tháng, 12 tháng, 24 tháng).
  - Thêm ô chọn **Nhân viên bảo trì phụ trách** (Dropdown lấy dữ liệu từ API người dùng có vai trò Kỹ thuật viên/Staff).
- [ ] **ToolsetModal:** 
  - Thêm tính năng **Tự động tạo mã bộ công cụ** (`toolsetCode` dạng `TLS-2026-XXXX`).
  - Chuyển ô nhập Phòng ban, Vị trí thành dropdown select tương tự bên Asset.

---

## ⚙️ PHASE 02: TỰ ĐỘNG HÓA BẢO TRÌ & PORTAL KỸ THUẬT VIÊN
*Mục tiêu: Hiện thực hóa luồng quản lý vòng đời tự động sinh việc bảo trì cho nhân viên.*

### 1. Backend: Dịch vụ chạy ngầm & API Bảo trì
- [ ] **Maintenance Background Service:** 
  - Viết một `.NET HostedService` (Background Worker) chạy ngầm quét định kỳ (mỗi 24 giờ).
  - Tự động quét các thiết bị và tính toán ngày đến hạn tiếp theo: `LastMaintenance (hoặc CreatedAt) + MaintenanceIntervalMonths`.
  - Nếu đã đến hạn bảo trì, tự động sinh `MaintenanceTicket` với trạng thái `Assigned` và gán trực tiếp cho nhân viên kỹ thuật phụ trách thiết bị đó (`AssignedTechnicianId`).
- [ ] **API cho Kỹ thuật viên:**
  - Viết API lấy danh sách ticket bảo trì được gán cho nhân viên hiện tại (`/api/v1/Maintenance/my-tickets`).
  - Viết API cập nhật tiến độ bảo trì: tiếp nhận ảnh chụp hiện trường (Upload ảnh), lưu ghi nhận hành động sửa chữa, và chọn linh kiện phụ tùng thay thế từ kho.

### 2. Frontend: Giao diện làm việc của Kỹ thuật viên (Nhân viên bảo trì)
- [ ] **Trang chủ Kỹ thuật viên:**
  - Thiết kế Dashboard dạng Lịch (Calendar View) hiển thị trực quan các ngày có nhiệm vụ bảo trì.
- ### 4. Tối ưu biểu mẫu Giao việc & Phân công công việc (Task/Maintenance Form Optimization)
- [ ] **Loại bỏ các trường dữ liệu thừa (không lưu trữ trong DB / Backend bỏ qua):**
  - [ ] Loại bỏ trường **Mã công việc** (`taskCode`) trong Form (backend tự sinh và bỏ qua input client).
  - [ ] Loại bỏ trường **Người giám sát** (`supervisor`) (không tồn tại trong bảng `maintenance_tickets` và backend bỏ qua).
  - [ ] Loại bỏ trường **Ngày bắt đầu** (`startDate`) (không tồn tại trong bảng `maintenance_tickets` và backend bỏ qua).
- [ ] **Chuẩn hóa trường chọn thiết bị (Asset Selection):**
  - [ ] Tích hợp tìm kiếm nhanh trong dropdown chọn Thiết bị liên quan (`relatedAssetId`) để tránh quá tải khi kho có nhiều thiết bị.
- [ ] **Chuẩn hóa trường phân công (Assigned To Dropdown):**
  - [ ] Thay thế ô nhập text tự do bằng dropdown select. Dữ liệu được gọi từ API người dùng `/api/v1/Users` và lọc những người có vai trò Staff (1) hoặc Admin (0).
- [ ] **Đồng bộ hóa logic Độ ưu tiên (Priority):**
  - [ ] Vô hiệu hóa ô chọn độ ưu tiên và hiển thị nhãn Read-only: *"Tự động xác định theo giá trị thiết bị"* để phản ánh chính xác nghiệp vụ thực tế của hệ thống.

### 5. Khắc phục lỗ hổng phân quyền tuyến đường (Router Security)
- [x] **Phân quyền chặt chẽ nhóm trang Admin (`/admin/*`):** Cập nhật `Router.tsx` lồng nhóm tuyến đường `/admin` dưới một bộ lọc `AuthGuard` riêng biệt chỉ cho phép role `0` (Super Admin), tránh việc Staff có thể truy cập bằng cách gõ trực tiếp URL. (Đã hoàn thành)
- [x] **Tách phân quyền quản lý công việc (Task Permissions):**
  - [x] Cập nhật `Router.tsx` chuyển các tuyến đường `/tasks/create` và `/tasks/progress` vào nhóm bảo vệ chỉ dành cho **Admin (Role 0)**.
  - [x] Cập nhật `AdminLayout.tsx` lọc hiển thị sidebar, ẩn hai mục "Tạo công việc mới" và "Theo dõi tiến độ" đối với tài khoản **Staff (Role 1)**, chỉ để lại mục "Nhiệm vụ của tôi" (`/my-tasks`).

### 6. Rà soát & Khắc phục bất ổn nghiệp vụ/phân quyền (Admin/Staff Audit Mismatches)
- [x] **Phân quyền thao tác trong các trang danh sách chung (Assets, Toolsets, Spare Parts):**
  - [x] Hạn chế các nút hành động Admin (Thêm/Sửa/Xóa thiết bị, toolset, phụ tùng) trong `AssetListPage.tsx`, `ToolsetListPage.tsx`, `SparePartListPage.tsx` chỉ hiển thị khi tài khoản đăng nhập là **Admin (Role 0)**. Staff (IT/Warehouse) chỉ có quyền Xem và Đổi trạng thái thiết bị.
- [x] **Khắc phục lỗi trang Phiếu báo hỏng (Failures) & Phiếu sửa chữa (Repairs):**
  - [x] **Backend:** Hoàn thiện `/api/v1/Maintenance/Failures` (GET để lấy các phiếu hỏng hóc dạng `Assigned` có mô tả `[Báo hỏng]` hoặc `[Tự động tạo]`; POST để tiếp nhận phiếu báo hỏng thiết bị mới từ nhân viên/kỹ thuật viên).
  - [x] **Backend:** Hoàn thiện `/api/v1/Maintenance/Repairs` (GET để lấy các phiếu sửa chữa có trạng thái `InProgress` hoặc `Completed` liên quan đến sự cố).
  - [x] **Backend:** Bổ sung API `/api/v1/Maintenance/ApproveFailure` để phê duyệt phiếu báo hỏng, chuyển trạng thái và gán kỹ thuật viên sửa chữa.
- [ ] **Khắc phục trang Báo cáo & Thống kê (Reports Mock Data):**
  - [ ] Bổ sung `ReportsController.cs` ở Backend để tổng hợp dữ liệu thực từ database: `/api/v1/Reports/Assets` (thống kê số lượng thiết bị theo loại, theo trạng thái vận hành), `/api/v1/Reports/Maintenance` (thống kê tổng chi phí bảo trì theo tháng, tỷ lệ hoạt động tốt), `/api/v1/Reports/Tasks` (thống kê hiệu suất xử lý công việc của từng nhân viên).
  - [ ] Cập nhật Frontend (`AssetReportPage.tsx`, `MaintenanceReportPage.tsx`, `TaskReportPage.tsx`) để nhận và hiển thị dữ liệu thực tế từ API thay vì dùng dữ liệu hardcoded tĩnh.
- [x] **Phân quyền hiển thị Menu con (Sub-item Level Authorization):**
  - [x] Cải tiến hàm lọc menu trong `AdminLayout.tsx` để hỗ trợ lọc phân quyền cho từng mục con (`subItems`), tránh trường hợp Staff nhìn thấy các menu Admin (Duyệt yêu cầu mượn, Lịch bảo trì định kỳ, Tạo công việc mới, v.v.).

---

## 🛒 PHASE 03: QUY TRÌNH MƯỢN/TRẢ TỰ PHỤC VỤ, BLOCKCHAIN & TIN TỨC (PORTAL SV/GV)
*Mục tiêu: Xây dựng trải nghiệm mượn thiết bị nhanh gọn qua điện thoại, bảo mật Blockchain và tích hợp tin tức.*

### 1. Frontend: Giao diện mượn thiết bị di động (Sinh viên & Giáo viên)
- [ ] **Trang Đăng ký mượn thiết bị (Portal):**
  - Thiết kế giao diện lưới (Grid/Card) hiển thị các danh mục thiết bị (Laptop, Máy chiếu, Phụ kiện...).
  - Tích hợp thanh tìm kiếm nhanh và lọc theo trạng thái "Sẵn sàng cho mượn".
- [ ] **Giỏ hàng mượn thiết bị (Multi-item Cart):**
  - Thêm nút **Dấu cộng (+)** bên cạnh mỗi thiết bị để người mượn gom nhiều món vào một đơn đăng ký mượn.
  - Thiết kế trang giỏ hàng tóm tắt danh sách thiết bị cần mượn, nhập thời gian trả dự kiến và nhấn "Gửi đơn đăng ký".

### 2. Backend: Xử lý Đơn mượn đa thiết bị & Băm chuỗi Blockchain
- [ ] **API Đăng ký mượn đa thiết bị:**
  - Cập nhật controller `/api/v1/Borrow/Request` để tiếp nhận danh sách nhiều thiết bị trong một đơn mượn.
  - Sử dụng **Database Transaction** để xử lý đồng thời: ghi nhận đơn mượn, chuyển đổi trạng thái của toàn bộ thiết bị đã chọn sang `Borrowed` (hoặc `Reserved`), đảm bảo không bị lỗi tranh chấp tài nguyên (Concurrency).
- [ ] **Tích hợp Blockchain-lite (Lưu vết không thể sửa đổi):**
  - Cập nhật logic đóng gói khối giao dịch mượn đồ: Băm SHA-256 nội dung của đơn mượn hiện tại kết hợp mã hash của giao dịch liền trước (`PreviousHash`) để tạo ra `TransactionHash` duy nhất và lưu vào Database.

### 3. Frontend & Backend: Bàn giao & Công cụ đối soát chuỗi Blockchain
- [ ] **Trang Quản lý đơn mượn tại Kho (Dành cho thủ kho):**
  - Giao diện dành cho nhân viên kho xem danh sách đơn mượn đang chờ nhận đồ (`Pending_Preparation`).
  - Đối chiếu mã đơn mượn trên điện thoại của sinh viên và nhấn "Bàn giao thực tế". Hệ thống tự động ghi nhận băm giao dịch và thay đổi trạng thái thiết bị.
- [ ] **Admin Dashboard - Công cụ kiểm tra chuỗi Blockchain (Audit Ledger Tool):**
  - Viết module duyệt tuần tự toàn bộ các giao dịch mượn trong cơ sở dữ liệu, tự động băm lại và so sánh với `TransactionHash` đã lưu để xác minh tính toàn vẹn. Hiển thị thông báo nếu phát hiện dữ liệu bị can thiệp trái phép.

### 4. Tích hợp API Tin tức nổi bật (News API)
- [ ] **Backend News Worker:**
  - Viết Worker hàng ngày lấy tin nóng công nghệ/học thuật từ API miễn phí (GNews.io hoặc Dev.to RSS) và lưu trữ cục bộ vào bảng tin tức của hệ thống để tránh bị giới hạn lượt gọi (Rate Limit).
- [ ] **Frontend Student Home:**
  - Thiết kế Slider đầu trang hiển thị thông báo khẩn cấp của trường.
  - Danh sách tin tức xã hội/tin học thuật hot tự động hiển thị phía dưới để sinh viên đọc lúc vào web mượn đồ.

### 5. Nâng cấp Trải nghiệm Giao nhận & Thống kê thông minh (Chuyên nghiệp hóa)
- [x] **Frontend: Student/Teacher Portal (Thẻ thống kê & Banner & Tab Lịch sử):** (Hoàn thành)
- [x] **Frontend: Admin Portal - Quầy Giao Nhận Thông Minh (Warehouse Quick Dispatch & Return):** (Hoàn thành)
- [x] **Frontend & Backend: Sức khỏe thiết bị (Asset Health Analytics):** (Hoàn thành)

### 6. Quy trình Nghiệp vụ Giao nhận & Trả đồ Minh bạch (Trả đủ, Trả thiếu, Hư hỏng)
- [/] **Backend: Nâng cấp luồng xử lý hoàn trả**
  - [ ] Nâng cấp API `POST api/v1/Borrow/Return/{itemId}` xử lý các mã tình trạng: `"Tốt"`, `"Hỏng nhẹ"`, `"Lỗi kỹ thuật"`, `"Hỏng nặng"`, `"Báo mất (Cần đền bù)"`.
  - [ ] Tự động tạo `MaintenanceTicket` khi thiết bị lỗi/hỏng nặng.
  - [ ] Ghi vết đền bù/mất mát vào `BorrowRequest.Note` để kiểm toán.
- [/] **Frontend: Giao diện và thông tin phản hồi trực quan**
  - [ ] Thêm tùy chọn `"Báo mất"` vào dropdown tình trạng trả của Warehouse Console.
  - [ ] Hiển thị Warning Alert trực quan báo phí đền bù hoặc thông báo tạo ticket sửa chữa tự động.
  - [ ] Bổ sung bảng "Lịch sử giao nhận trong phiên" lưu vết thao tác tại quầy của thủ kho.
  - [ ] Cập nhật Cổng Sinh Viên hiển thị chính xác trạng thái đền bù/đang sửa chữa của thiết bị.

### 7. Tối ưu hóa phân quyền & Giao diện làm việc cho 4 Role chính
- [ ] **Role 0 (SuperAdmin):**
  - [ ] Thiết kế trang Quản lý Tài khoản (Users Management) cho phép thay đổi phân vai trò (Admin, Staff, Teacher, Student).
  - [ ] Thêm cấu hình tham số hệ thống toàn cục (Global Settings) như: Hạn mức mượn tối đa, Phí phạt cơ bản, Ngày hết hạn mượn mặc định.
- [ ] **Role 1 (Staff/Thủ kho/Kỹ thuật viên):**
  - [x] Giao diện Quầy Giao Nhận thông minh (Warehouse Console) để check-in/check-out. (Đã hoàn thành)
  - [x] API tự động sinh ticket bảo trì và gán cho kỹ thuật viên phụ trách. (Đã hoàn thành)
  - [x] Giao diện Công việc của tôi (My Tasks) nhận ticket bảo trì nghiệm thu. (Đã hoàn thành)
  - [/] **Tích hợp Lịch làm việc tuần này (Weekly Work Calendar)** hiển thị trực quan số lượng ticket/nhiệm vụ cần thực hiện trong 7 ngày (Thứ 2 - Chủ Nhật), cho phép nhấp chọn ngày để lọc nhanh công việc của ngày đó.
- [ ] **Role 2 (Teacher/Giảng viên):**
  - [ ] Hỗ trợ luồng mượn riêng biệt với độ ưu tiên cao (auto-approve đối với thiết bị phục vụ lớp học).
  - [ ] Thiết kế trang Báo cáo sự cố phòng học khẩn cấp gửi thẳng đến nhóm Staff.
- [ ] **Role 3 (Student/Sinh viên):**
  - [x] Portal Sinh viên tích hợp 3 thẻ thống kê thông minh (Dashboard Mini Cards) và Banner nhắc nhở cận hạn. (Đã hoàn thành)
  - [x] Tab lịch sử mượn trả và tra cứu mã hóa Blockchain. (Đã hoàn thành)
