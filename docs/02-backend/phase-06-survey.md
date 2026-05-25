# Phase 06 — Survey (Khảo Sát)

> **Mục tiêu**: Hệ thống tạo và thu thập khảo sát nội bộ với nhiều loại câu hỏi.

---

## Tasks

### 1. Survey Endpoints

| Endpoint | Method | Quyền | Mô tả |
|---|---|---|---|
| `GET /api/v1/surveys` | GET | All | Danh sách khảo sát |
| `GET /api/v1/surveys/{id}` | GET | All | Chi tiết khảo sát + câu hỏi |
| `POST /api/v1/surveys` | POST | Admin/Manager | Tạo khảo sát |
| `PUT /api/v1/surveys/{id}` | PUT | Creator/Admin | Sửa khảo sát (chỉ khi Draft) |
| `DELETE /api/v1/surveys/{id}` | DELETE | Creator/Admin | Xóa khảo sát |
| `POST /api/v1/surveys/{id}/publish` | POST | Creator/Admin | Publish khảo sát |
| `POST /api/v1/surveys/{id}/close` | POST | Creator/Admin | Đóng khảo sát |
| `POST /api/v1/surveys/{id}/responses` | POST | All | Gửi câu trả lời |
| `GET /api/v1/surveys/{id}/results` | GET | Creator/Admin | Xem kết quả tổng hợp |

### 2. Question Types
```csharp
public enum QuestionType
{
    SingleChoice = 0,    // Chọn 1 đáp án
    MultipleChoice = 1,  // Chọn nhiều đáp án
    Text = 2,            // Trả lời tự do
    Rating = 3,          // Đánh giá 1-5 sao
    YesNo = 4            // Có/Không
}
```

### 3. Survey Lifecycle
```
Draft → Active → Closed
  ↑              ↓
  └──── Reopen ──┘ (chỉ Admin)
```

### 4. Response Collection
- Mỗi user chỉ submit 1 lần (unique constraint UserId + SurveyId)
- Validate required questions
- Lưu answer dạng JSON cho flexible storage

### 5. Results & Analytics
- Tổng hợp: tổng số response, tỷ lệ completion
- Từng câu hỏi: distribution, average (rating), word cloud (text)

---

## Acceptance Criteria

- [ ] Admin/Manager tạo survey với nhiều loại câu hỏi
- [ ] Draft → Publish → Close lifecycle
- [ ] Employee submit response, mỗi người chỉ 1 lần
- [ ] Validation required questions
- [ ] Admin xem kết quả tổng hợp
- [ ] Survey tự động đóng khi hết thời hạn

## Dependencies
- Phase 02 (Auth), Phase 03 (User Management)
