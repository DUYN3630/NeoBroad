# Phase 06 — Frontend Survey

> **Mục tiêu**: Giao diện tạo và trả lời khảo sát.

---

## Tasks

### 1. Pages
- `SurveysPage` — Danh sách khảo sát (Active, chưa trả lời, đã trả lời)
- `SurveyDetailPage` — Xem + trả lời khảo sát
- `SurveyCreatePage` — Tạo/sửa khảo sát (Admin/Manager)
- `SurveyResultsPage` — Xem kết quả tổng hợp (Admin/Manager)

### 2. Components
- `SurveyCard` — Card hiển thị survey (title, status, deadline, progress)
- `SurveyForm` — Form trả lời survey
- `QuestionRenderer` — Render câu hỏi theo type (radio, checkbox, text, rating, yes/no)
- `SurveyBuilder` — Drag & drop tạo câu hỏi (Admin)
- `SurveyResults` — Charts hiển thị kết quả (Recharts)
  - Pie chart cho single/multiple choice
  - Bar chart cho rating
  - Word list cho text answers

### 3. Question Type Components
| Type | Component | UI |
|---|---|---|
| SingleChoice | Radio group | ○ Option A ○ Option B |
| MultipleChoice | Checkbox group | ☐ Option A ☐ Option B |
| Text | Textarea | Free text input |
| Rating | Star rating | ★★★★☆ |
| YesNo | Toggle / Radio | ○ Có ○ Không |

---

## Acceptance Criteria

- [ ] Danh sách surveys, filter theo trạng thái
- [ ] Trả lời survey, validation required questions
- [ ] Mỗi user chỉ submit 1 lần, hiển thị "Đã trả lời"
- [ ] Admin tạo survey với survey builder
- [ ] Admin xem kết quả dạng biểu đồ
- [ ] Countdown deadline hiển thị

## Dependencies
- Phase 03 (Layout)
- Backend Phase 06 (Survey API)
