# 📜 QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE (CONVENTIONS)
*Dự án: NeoBoard EDU-AMS (High-Security Edition)*

Để đảm bảo dự án có chất lượng Enterprise, dễ bảo trì và gây ấn tượng với Technical Lead/HR, toàn bộ thành viên (hoặc AI trợ giúp) phải tuân thủ các quy tắc sau:

---

## 1. QUY TẮC ĐẶT TÊN (NAMING CONVENTIONS)

### 1.1 Tên File & Thư mục (Kebab-case)
*   **Quy tắc:** Sử dụng chữ thường, ngăn cách bởi dấu gạch ngang.
*   **Ví dụ:** `asset-management/`, `user-profile.controller.ts`, `auth-store.ts`.
*   **Tại sao?** Đảm bảo tính nhất quán trên mọi hệ điều hành (Windows/Linux) và dễ đọc.

### 1.2 Biến & Hàm (Camel-case)
*   **Quy tắc:** Chữ cái đầu viết thường, các từ sau viết hoa chữ cái đầu.
*   **Ví dụ:** `const studentName = '...';`, `function getAssetById() { ... }`.

### 1.3 Class & Interface (Pascal-case)
*   **Quy tắc:** Viết hoa chữ cái đầu của mọi từ.
*   **Ví dụ:** `class AssetService { ... }`, `interface UserProfile { ... }`.

### 1.4 Cơ sở dữ liệu (MySQL - Snake-case)
*   **Table:** Viết hoa chữ cái đầu, số nhiều. Ví dụ: `Users`, `Borrow_Records`.
*   **Column:** Viết hoa chữ cái đầu (PascalCase) để khớp với Entity trong .NET hoặc Prisma.
*   **Ví dụ:** `Id`, `Student_Code`, `Created_At`.

---

## 2. QUY TRÌNH LÀM VIỆC VỚI GIT (GIT WORKFLOW)

### 2.1 Thông điệp Commit (Conventional Commits)
Sử dụng cấu trúc: `<type>(<scope>): <description>`
*   `feat`: Tính năng mới (ví dụ: `feat(auth): add selfie verification`).
*   `fix`: Sửa lỗi (ví dụ: `fix(ams): fix auto-gen code logic`).
*   `docs`: Cập nhật tài liệu.
*   `refactor`: Cơ cấu lại mã nguồn (không thay đổi tính năng).
*   `test`: Thêm hoặc sửa test.

### 2.2 Quản lý Nhánh (Branching Strategy)
*   `main`: Nhánh ổn định để triển khai (Production).
*   `develop`: Nhánh tích hợp các tính năng mới.
*   `feature/<name>`: Nhánh làm tính năng mới (ví dụ: `feature/blockchain-ledger`).

---

## 3. CHUẨN API & PHẢN HỒI (API STANDARDS)

Toàn bộ API phải trả về cấu trúc thống nhất để Frontend dễ xử lý:
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "errors": null
}
```

---

## 4. CÁC QUY TẮC "VÀNG" CHO DỰ ÁN NEOBOARD

### 4.1 Quy tắc Zero-Warning
*   Không được để lại bất kỳ lỗi ESLint hoặc TypeScript error nào trong mã nguồn trước khi push.
*   Không sử dụng kiểu `any`. Mọi thứ phải được định nghĩa Type/Interface rõ ràng.

### 4.2 Quy tắc Bảo mật (Security First)
*   **Không bao giờ** commit file `.env` chứa mật khẩu, API key lên Git.
*   Sử dụng Bcrypt để hash mật khẩu với `saltRounds: 10`.
*   Mọi giao dịch liên quan đến mượn trả tài sản **BẮT BUỘC** phải có log và mã băm (hash) đẩy lên Blockchain.

### 4.3 Quy tắc Frontend (Next.js/React)
*   **Component hóa:** Mỗi component không nên dài quá 200 dòng. Nếu dài hơn, hãy tách nhỏ.
*   **Optimistic UI:** Ưu tiên cập nhật giao diện trước khi API trả về kết quả cho các hành động như Like, Bình luận, hoặc Thay đổi trạng thái nhỏ.

### 4.4 Quy tắc Vòng đời Tài sản (Business Logic)
*   Mọi thiết bị (Asset) khi được tạo ra phải có thuộc tính `Health_Status`.
*   Khi trạng thái `Health_Status < 20%`, hệ thống phải chặn không cho mượn và tự động chuyển sang luồng bảo trì.

---

## 5. CÔNG CỤ HỖ TRỢ ĐỒNG BỘ
*   **Prettier:** Tự động format code khi save.
*   **Prisma Studio:** Công cụ xem DB trực quan.
*   **Swagger:** Tự động tạo tài liệu API cho Frontend (truy cập tại `/api/docs`).

---

## 🧠 BRAINSTORM THÊM CÁC Ý TƯỞNG "PRO" (CỘNG ĐIỂM HR):

1.  **AI Code Reviewer:** Đề xuất tích hợp một tool AI nhỏ để check logic code mỗi khi có Pull Request.
2.  **Performance Budget:** Quy định dung lượng file ảnh upload (không quá 2MB) và thời gian phản hồi API (không quá 200ms cho các request cơ bản).
3.  **Documentation-Driven Development:** Viết tài liệu mô tả tính năng (như file này) trước khi bắt đầu code tính năng đó.
4.  **Error Code Dictionary:** Xây dựng một bảng danh sách mã lỗi (Ví dụ: `E001`: Sai MSSV, `E002`: Thiết bị đang bảo trì) để Frontend hiển thị thông báo đa ngôn ngữ dễ dàng.
