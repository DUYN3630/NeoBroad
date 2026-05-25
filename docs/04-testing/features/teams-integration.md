# 🔗 Microsoft Teams Integration

> Tích hợp NeoBoard với Microsoft Teams để tăng khả năng tiếp cận.

---

## Kế Hoạch Tích Hợp

### 1. Teams Bot
- Bot NeoBoard trong Teams chat
- Nhận notification qua Teams
- Quick actions: xem announcements, trả lời survey

### 2. Teams Tab
- Nhúng NeoBoard dashboard vào Teams tab
- SSO từ Teams → NeoBoard (Azure AD)

### 3. Webhook Integration
- NeoBoard gửi webhook đến Teams channel
- Thông báo announcement mới → Teams channel
- Survey mới → Teams channel

### 4. Implementation Notes
- Dùng **Microsoft Bot Framework**
- Dùng **Teams Toolkit** cho tab app
- Azure AD SSO integration
- Incoming Webhook cho notifications

---

## Tech Stack
- **@microsoft/teams-js** — Teams SDK
- **Bot Framework SDK** — .NET
- **Azure AD** — Authentication
- **Microsoft Graph API** — User data
