# 🐛 Debug Log — Hướng Dẫn Sử Dụng

## Mục Đích

Thư mục này lưu trữ **nhật ký các lỗi đã gặp và cách fix**. Mục tiêu:
1. **Tránh lặp lại lỗi cũ** — Trước khi fix, tìm ở đây trước
2. **AI agent học từ lỗi cũ** — AI đọc log này để fix nhanh hơn
3. **Chia sẻ kinh nghiệm** — Member mới biết tránh bẫy

---

## Cách Ghi Log

### Format Chuẩn

```markdown
---
## [YYYY-MM-DD] — Mô Tả Lỗi Ngắn Gọn

**🏷️ Tags:** #backend #auth #database #frontend #css #api
**📌 File liên quan:** `path/to/file.ts`

**🔴 Triệu chứng:**
> Mô tả lỗi nhìn thấy (error message, UI bị hỏng, data sai...)

**🔍 Nguyên nhân gốc (Root Cause):**
> Giải thích TẠI SAO lỗi xảy ra

**✅ Cách fix:**
```diff
- code cũ (bị lỗi)
+ code mới (đã fix)
```

**⚡ AI Fix Speed:**
- ⚡ **Nhanh** (1-2 prompt) — AI fix đúng ngay
- 🔄 **Trung bình** (3-5 prompt) — cần mô tả thêm
- 🐌 **Chậm** (>5 prompt) — AI sửa lung tung, phải guide cụ thể
- ❌ **Không fix được** — phải fix manual

**💡 Bài học rút ra:**
> Điều cần nhớ để tránh lỗi này trong tương lai

**⚠️ Cảnh báo cho AI:**
> Hướng dẫn cụ thể cho AI khi gặp lỗi tương tự
> VD: "KHÔNG sửa file X khi fix lỗi này, chỉ sửa file Y"
---
```

---

## Quy Tắc

1. **Ghi ngay khi fix xong** — đừng để quên
2. **Mỗi lỗi 1 entry** — ngắn gọn, rõ ràng
3. **Tags bắt buộc** — để tìm kiếm nhanh
4. **Ghi AI Fix Speed** — để biết lỗi nào AI xử lý tốt/kém
5. **Ghi cảnh báo cho AI** — hướng dẫn AI tránh sửa sai chỗ

---

## File Structure

| File | Nội dung |
|---|---|
| `README.md` | Hướng dẫn này |
| `backend-errors.md` | Lỗi backend (.NET, API, DB) |
| `frontend-errors.md` | Lỗi frontend (React, CSS, UI) |

> Khi file quá dài (>200 entries), tách thành file theo tháng:
> `backend-errors-2026-04.md`
