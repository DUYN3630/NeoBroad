# 🐛 Frontend Errors Log

> Lỗi frontend đã gặp và cách fix. Đọc file này TRƯỚC khi debug.
> Format: xem `README.md`

---

<!-- GHI LỖI MỚI Ở ĐÂY (mới nhất trên cùng) -->

## [2026-05-25] — AxiosError: Request failed with status code 500 (API Fail)

**🏷️ Tags:** #frontend #axios #api-error #dashboard #assets
**📌 File liên quan:** `AssetListPage.tsx`, `DashboardPage.tsx`, `ToolsetListPage.tsx`

**🔴 Triệu chứng:**
> Console log báo lỗi: `Error fetching dashboard stats: AxiosError: Request failed with status code 500`. Các bảng dữ liệu không hiển thị và báo lỗi đỏ.

**🔍 Nguyên nhân gốc:**
> Do Backend trả về lỗi 500. Backend gặp vấn đề khi truy vấn Database (thường là do mất kết nối PostgreSQL).

**✅ Cách fix:**
> 1. Đây là lỗi từ phía Server, cần kiểm tra và sửa Backend trước (Xem log Backend cùng ngày).
> 2. Sau khi Backend fix xong kết nối DB, reload lại trang Frontend.

**⚡ AI Fix Speed:** ⚡ Nhanh (Chờ backend fix)

**💡 Bài học:** Cần thêm xử lý UI (Error Boundary hoặc Thông báo lỗi thân thiện) khi API trả về lỗi 500 để người dùng biết máy chủ đang bảo trì.

---

## [2026-04-09] — Lỗi kết nối Google Login (COOP và Connection Refused)

**🏷️ Tags:** #frontend #google-auth #coop #network
**📌 File liên quan:** `vite.config.ts`, `LoginPage.tsx`

**🔴 Triệu chứng:**
> 1. `net::ERR_CONNECTION_REFUSED` khi tải Captcha hoặc gọi API Google Login.
> 2. `Cross-Origin-Opener-Policy policy would block the window.closed call` khi mở popup Google.

**🔍 Nguyên nhân gốc:**
> 1. Backend server chưa chạy hoặc bị tắt.
> 2. Chính sách bảo mật COOP của trình duyệt chặn liên lạc giữa trang web và popup Google OAuth.

**✅ Cách fix:**
> 1. Khởi động Backend server cổng 5054.
> 2. Cấu hình `headers` trong `vite.config.ts`:
> ```js
> 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
> ```

**⚡ AI Fix Speed:** ⚡ Nhanh

---

## [2026-04-09] — Lỗi sập trang báo cáo (TypeError: Cannot read properties of null)

**🏷️ Tags:** #frontend #react #null-check #reports
**📌 File liên quan:** `TaskReportPage.tsx`, `AssetReportPage.tsx`

**🔴 Triệu chứng:**
> Ứng dụng hiển thị "Unexpected Application Error!" kèm lỗi `TypeError: Cannot read properties of null (reading 'ByPriority')` hoặc `totalValue`. Xảy ra khi Backend chưa khởi động hoặc trả về lỗi.

**🔍 Nguyên nhân gốc:**
> Component cố gắng truy cập vào các thuộc tính của đối tượng `data` trong khi `data` đang là `null` (do gọi API thất bại).

**✅ Cách fix:**
> 1. Sử dụng toán tử `?.` (Optional Chaining) khi truy cập thuộc tính.
> 2. Khởi tạo giá trị mặc định cho State (safeData) để Component luôn có dữ liệu tối thiểu để render khung giao diện.
> 3. Thêm khối `.catch()` trong useEffect để gán dữ liệu rỗng khi lỗi mạng.

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn giả định API có thể thất bại. Không bao giờ render trực tiếp dữ liệu từ API mà không có kiểm tra Null hoặc giá trị mặc định.

---

## [2026-04-09] — Lỗi Network Error (ERR_CONNECTION_REFUSED) và BaseURL

**🏷️ Tags:** #frontend #axios #network #api
**📌 File liên quan:** `lib/axios.ts`, `AssetListPage.tsx`, `ToolsetListPage.tsx`

**🔴 Triệu chứng:**
> 1. `AxiosError: Network Error` kèm `net::ERR_CONNECTION_REFUSED`.
> 2. `the server responded with a status of 500 (Internal Server Error)` khi gọi API bảo trì.

**🔍 Nguyên nhân gốc:**
> 1. Backend server (cổng 5054) không chạy hoặc bị tắt.
> 2. `baseURL` trong axios cấu hình sai (mặc định trỏ về cổng 5173 của frontend thay vì 5054 của backend).

**✅ Cách fix:**
> 1. Chạy lại lệnh `dotnet run --project NeoBoard.Web`.
> 2. Cập nhật `baseURL` trong `src/lib/axios.ts` thành `http://localhost:5054/api/v1`.
> 3. Thay thế các lệnh gọi `axios.get` trực tiếp bằng `apiClient.get` để dùng chung cấu hình.

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn kiểm tra xem Backend đã khởi động chưa trước khi debug Frontend. Tập trung cấu hình API URL vào một file duy nhất (`lib/axios.ts`).

---

## [2026-04-09] — Lỗi Import path và Icon 'Tool' (Lucide)

**🏷️ Tags:** #frontend #vite #lucide #import
**📌 File liên quan:** `AssetListPage.tsx`, `ToolsetListPage.tsx`

**🔴 Triệu chứng:**
> 1. `[plugin:vite:import-analysis] Failed to resolve import "./components/AssetModal"`
> 2. `Uncaught SyntaxError: The requested module ... 'lucide-react.js' does not provide an export named 'Tool'`

**🔍 Nguyên nhân gốc:**
> 1. Đường dẫn import sai cấp thư mục (dùng `./` thay vì `../`).
> 2. Sử dụng tên icon không tồn tại trong thư viện `lucide-react`.

**✅ Cách fix:**
> 1. Đổi `./components/AssetModal` thành `../components/AssetModal`.
> 2. Đổi icon `Tool` thành `Hammer`.

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Kiểm tra kỹ cấu trúc thư mục khi import component. Tra cứu danh sách icon của Lucide trước khi sử dụng.

**⚠️ Cảnh báo cho AI:** Luôn xác nhận tên icon và cấp thư mục trước khi viết code giao diện.

---

## [2026-04-07] — Template Entry (Xóa entry này khi có lỗi thật)

**🏷️ Tags:** #frontend #template
**📌 File liên quan:** `N/A`

**🔴 Triệu chứng:**
> Đây là entry mẫu, xóa khi có lỗi thật đầu tiên

**🔍 Nguyên nhân gốc:**
> Template

**✅ Cách fix:**
```
Không có
```

**⚡ AI Fix Speed:** ⚡ Nhanh

**💡 Bài học:** Luôn ghi log lỗi ngay sau khi fix

**⚠️ Cảnh báo cho AI:** N/A

---
