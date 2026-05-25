# 🎨 UI/UX Design Guide — NeoBoard

> **Triết lý thiết kế**: Chuyên nghiệp, trưởng thành, data-driven.
> Lấy cảm hứng từ: **Linear**, **Vercel**, **Stripe Dashboard**, **Notion**, **GitHub**.
> **KHÔNG** lấy cảm hứng từ: Template admin miễn phí, landing page đầy hiệu ứng.

---

## ⛔ TUYỆT ĐỐI TRÁNH — Những Thứ Làm Giao Diện Trông "Trẻ Con"

> **AI agent: ĐỌC PHẦN NÀY TRƯỚC KHI CODE BẤT KỲ UI NÀO**

### 1. Màu sắc trẻ con
```css
/* ❌ KHÔNG LÀM — quá sáng, quá bão hòa, quá "vui" */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* gradient tím xanh generic */
background: #FF6B6B;   /* đỏ san hô quá nổi */
background: #4ECDC4;   /* xanh mint quá sáng */
color: #FF69B4;        /* hồng hot pink */
background: linear-gradient(to right, #f093fb, #f5576c);  /* gradient hồng tím */

/* ✅ NÊN LÀM — trầm, tinh tế, chuyên nghiệp */
background: #0a0a0a;   /* đen gần tinh khiết */
background: #18181b;   /* zinc-900 */
background: #fafafa;   /* gray-50 nhẹ */
color: #3b82f6;        /* blue-500 accent vừa phải */
border: 1px solid #e4e4e7;  /* border nhẹ nhàng */
```

### 2. Bo góc quá tròn
```css
/* ❌ KHÔNG — trông như app cho trẻ em */
border-radius: 20px;
border-radius: 24px;
border-radius: 9999px;  /* cho card, container */

/* ✅ NÊN — sắc nét, chuyên nghiệp */
border-radius: 6px;     /* nhỏ, tinh tế */
border-radius: 8px;     /* card thông thường */
border-radius: 12px;    /* modal, container lớn — MAX cho hầu hết trường hợp */
```

### 3. Shadow quá đậm
```css
/* ❌ KHÔNG — trông như bong bóng bay */
box-shadow: 0 20px 60px rgba(0,0,0,0.3);
box-shadow: 0 10px 40px rgba(99,102,241,0.4);  /* shadow có màu */

/* ✅ NÊN — shadow tinh tế hoặc dùng border thay thế */
box-shadow: 0 1px 2px rgba(0,0,0,0.05);          /* subtle */
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);  /* thường */
border: 1px solid #e4e4e7;                        /* hoặc dùng border thay shadow */
```

### 4. Font chữ và kích cỡ sai
```css
/* ❌ KHÔNG */
font-family: 'Comic Sans', 'Poppins', cursive;
font-size: 48px;    /* heading quá to trong dashboard */
font-weight: 900;   /* quá dày, nặng nề */
letter-spacing: 3px; /* quá giãn */

/* ✅ NÊN */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-size: 14px;    /* body text chính trong dashboard */
font-size: 13px;    /* text phụ, label */
font-weight: 500;   /* medium — cho heading nhỏ */
font-weight: 600;   /* semibold — cho heading chính */
letter-spacing: -0.01em; /* tracking nhẹ, chuyên nghiệp */
```

### 5. Các pattern "AI yêu thích" nhưng trông amateur
```
❌ Hero section gradient tím-xanh với text trắng
❌ Card với emoji to làm icon ❤️ 😀 🎉
❌ Glassmorphism (backdrop-filter: blur) cho dashboard admin
❌ Neon glow effects
❌ Animated gradient borders
❌ Card grid đều nhau 3 cột với icon colorful ở mỗi card
❌ Wave/blob SVG decorations
❌ Quá nhiều màu khác nhau trên cùng 1 trang
❌ Illustration cartoon style
❌ Progress bar / stat card có gradient cầu vồng
```

---

## ✅ Nguyên Tắc Thiết Kế Chính

### Nguyên tắc 1: Ít Hơn Là Nhiều Hơn (Less is More)
- Ưu tiên **khoảng trắng có chủ đích**, không nhồi nhét
- Mỗi trang chỉ cần **1-2 màu accent** qua
- **Loại bỏ mọi trang trí không phục vụ chức năng**
- Text > Icon > Image (ưu tiên text rõ ràng)

### Nguyên tắc 2: Mật Độ Thông Tin Hợp Lý
- Dashboard phải **data-dense** — hiển thị nhiều data trên diện tích nhỏ
- **KHÔNG** tạo card to với chỉ 1 con số ở giữa
- Table là king — phần lớn admin panel là table
- Compact UI: spacing `8px`, `12px`, `16px` — không phải `24px`, `32px`, `48px`

### Nguyên tắc 3: Nhất Quán Tuyệt Đối
- Cùng loại element = cùng style ở mọi nơi
- Cùng action = cùng vị trí (nút Save luôn ở phải, Cancel ở trái)
- **Không** mix style giữa các trang

---

## 🎨 Bảng Màu Chính Thức

### Light Theme
```css
:root {
  /* Background */
  --bg-page: #fafafa;                /* Nền trang chính */
  --bg-card: #ffffff;                /* Nền card/panel */
  --bg-sidebar: #111111;            /* Sidebar — TỐI */
  --bg-header: #ffffff;             /* Header */
  --bg-hover: #f4f4f5;              /* Hover state */
  --bg-active: #eff6ff;             /* Active/selected state */

  /* Text */
  --text-primary: #09090b;          /* Text chính — gần đen */
  --text-secondary: #71717a;        /* Text phụ — zinc-500 */
  --text-tertiary: #a1a1aa;         /* Text mờ — zinc-400 */
  --text-inverse: #fafafa;          /* Text trên nền tối */

  /* Border */
  --border-default: #e4e4e7;        /* Border thường — zinc-200 */
  --border-subtle: #f4f4f5;         /* Border nhẹ — zinc-100 */
  --border-strong: #d4d4d8;         /* Border đậm — zinc-300 */

  /* Accent — CHỈ 1 MÀU CHÍNH */
  --accent: #2563eb;                /* Blue-600 — chuyên nghiệp, không quá sáng */
  --accent-hover: #1d4ed8;          /* Blue-700 */
  --accent-light: #eff6ff;          /* Blue-50 — background cho badge/tag */
  --accent-text: #1e40af;           /* Blue-800 — text trên nền accent light */

  /* Status — trầm, không chói */
  --success: #16a34a;               /* Green-600 */
  --success-bg: #f0fdf4;            /* Green-50 */
  --warning: #ca8a04;               /* Yellow-600 */
  --warning-bg: #fefce8;            /* Yellow-50 */
  --error: #dc2626;                 /* Red-600 */
  --error-bg: #fef2f2;             /* Red-50 */
  --info: #2563eb;                  /* Blue-600 */
  --info-bg: #eff6ff;              /* Blue-50 */
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --bg-page: #09090b;               /* zinc-950 */
  --bg-card: #18181b;               /* zinc-900 */
  --bg-sidebar: #09090b;            /* Cùng màu nền */
  --bg-header: #18181b;
  --bg-hover: #27272a;              /* zinc-800 */
  --bg-active: #172554;             /* blue-950 */

  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;

  --border-default: #27272a;        /* zinc-800 */
  --border-subtle: #1c1c1f;
  --border-strong: #3f3f46;         /* zinc-700 */

  --accent: #3b82f6;                /* Blue-500 — sáng hơn 1 chút trong dark */
  --accent-hover: #2563eb;
  --accent-light: #172554;          /* Blue-950 */
  --accent-text: #93c5fd;           /* Blue-300 */
}
```

> **Quy tắc màu**: Toàn bộ app chỉ dùng palette **zinc** (neutral) + **blue** (accent). Thêm green/yellow/red cho status. **KHÔNG** thêm màu khác.

---

## 🔤 Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
> Import từ Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

### Type Scale — Compact cho Dashboard

| Token | Size | Weight | Line Height | Dùng cho |
|---|---|---|---|---|
| `--text-xs` | 11px | 400 | 16px | Caption, badge, timestamp |
| `--text-sm` | 13px | 400 | 20px | Label, secondary text, table header |
| `--text-base` | 14px | 400 | 22px | Body text chính, table cell |
| `--text-lg` | 16px | 600 | 24px | Card title, section title |
| `--text-xl` | 18px | 600 | 28px | Page subtitle |
| `--text-2xl` | 20px | 600 | 30px | Page title |
| `--text-3xl` | 24px | 700 | 32px | Dashboard stat number |
| `--text-4xl` | 30px | 700 | 36px | Hero number (CHỈ dashboard overview) |

> **Lưu ý**: Heading LỚN NHẤT trong dashboard là `30px`. Không bao giờ dùng `36px`, `48px`, `64px` trong admin panel.

### Đặc Biệt — Số Liệu
```css
/* Dùng font tabular-nums cho số thống kê — số thẳng hàng đẹp */
.stat-number {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  font-weight: 700;
}
```

---

## 📐 Spacing System

### Base: 4px Grid
```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Quy tắc Spacing cho Dashboard
| Vùng | Spacing |
|---|---|
| Padding bên trong card | `16px` — `20px` |
| Khoảng cách giữa các card | `16px` |
| Padding content area | `24px` |
| Khoảng cách giữa form fields | `16px` |
| Khoảng cách giữa sections | `32px` |
| Table cell padding | `8px 12px` |
| Button padding | `8px 16px` (medium), `6px 12px` (small) |

> **KHÔNG** dùng padding `32px`+ cho card nội dung. Dashboard phải compact.

---

## 🧩 Component Design Standards

### Buttons
```css
/* Primary Button — dùng ít, chỉ cho CTA chính */
.btn-primary {
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  transition: background 150ms ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
}

/* Secondary Button — dùng nhiều */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
}

/* Ghost Button — cho action phụ */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ❌ KHÔNG làm button gradient, glow, outline nhiều màu */
```

### Input Fields
```css
.input {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  transition: border-color 150ms ease;
}
.input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  /* ❌ KHÔNG: box-shadow: 0 0 0 4px rgba(99,102,241,0.5) — quá đậm */
}
.input::placeholder {
  color: var(--text-tertiary);
}
```

### Cards
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 16px;  /* compact */
  /* ❌ KHÔNG dùng box-shadow cho card thường. Chỉ dùng border */
}
.card-elevated {
  /* Chỉ dùng cho dropdown, popover, modal — nổi lên trên */
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
}
```

### Tables (Component quan trọng nhất trong Admin)
```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table th {
  text-align: left;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-page);
}
.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}
.table tr:hover {
  background: var(--bg-hover);
}
/* ❌ KHÔNG: alternate row colors (zebra stripe) — quá lỗi thời */
/* ❌ KHÔNG: border mọi phía cho cell — chỉ cần bottom border */
```

### Stat Cards (Dashboard)
```
┌──────────────────────────┐
│ Total Users        ↗ +12%│   ← Tiêu đề nhỏ, text-secondary, 12-13px
│                          │
│ 1,247                    │   ← Số lớn, font-weight 700, 24-30px
│ ████████████░░░░ 82%     │   ← Progress bar mỏng, subtle (optional)
└──────────────────────────┘

/* ❌ KHÔNG LÀM: */
/* - Icon emoji to ở giữa ❌ */
/* - Gradient background cho mỗi card ❌ */
/* - Card quá to chỉ chứa 1 số ❌ */
/* - Mỗi card 1 màu khác nhau (đỏ, xanh, vàng, tím) ❌ */
```

```css
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 16px 20px;
}
.stat-card__label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}
.stat-card__trend {
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
}
/* Tất cả stat card CÙNG MÀU NỀN. Phân biệt bằng nội dung, không bằng màu */
```

### Badges / Tags
```css
/* Chỉ dùng 1 style: nền nhạt + text đậm */
.badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;  /* nhỏ, sắc nét — không phải 9999px */
  display: inline-flex;
  align-items: center;
}
.badge-success { background: var(--success-bg); color: var(--success); }
.badge-warning { background: var(--warning-bg); color: var(--warning); }
.badge-error   { background: var(--error-bg);   color: var(--error);   }
.badge-info    { background: var(--info-bg);     color: var(--info);    }
.badge-neutral { background: #f4f4f5;            color: #71717a;       }

/* ❌ KHÔNG: badge solid color (background: red; color: white) */
/* ❌ KHÔNG: badge quá tròn border-radius: 9999px cho tag */
```

### Sidebar
```css
.sidebar {
  background: #111111;           /* Tối hoàn toàn */
  color: #a1a1aa;                /* Text zinc-400 */
  width: 240px;                  /* Không quá rộng */
  border-right: 1px solid #27272a;
}
.sidebar__nav-item {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #a1a1aa;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 100ms ease;
}
.sidebar__nav-item:hover {
  background: #27272a;
  color: #fafafa;
}
.sidebar__nav-item--active {
  background: #27272a;
  color: #fafafa;
  font-weight: 500;
}
/* Icon size trong sidebar: 16px — nhỏ, tinh tế */
/* ❌ KHÔNG: icon 24px+ trong nav */
/* ❌ KHÔNG: sidebar gradient  */
/* ❌ KHÔNG: active state dùng accent color chói */
```

---

## 📊 Data Visualization (Charts)

### Quy Tắc Chart
1. **Max 5 màu** trong 1 chart — quá nhiều thì dùng shade cùng palette
2. **Không dùng 3D charts** — luôn flat
3. **Grid lines nhẹ** — `#f4f4f5` (light) hoặc `#27272a` (dark)
4. **Label rõ ràng** — font 11-12px, color text-secondary
5. **Tooltip đơn giản** — nền trắng, border nhẹ, shadow subtle

### Chart Color Palette (thứ tự ưu tiên)
```css
--chart-1: #2563eb;  /* Blue — primary */
--chart-2: #0891b2;  /* Cyan */
--chart-3: #7c3aed;  /* Violet */
--chart-4: #db2777;  /* Pink */
--chart-5: #ea580c;  /* Orange */
/* Dùng opacity variants: 0.8, 0.6, 0.4 nếu cần thêm */
```

### Recharts Config Mẫu
```tsx
// Cấu hình chung cho tất cả charts
const chartConfig = {
  style: {
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  },
  grid: {
    stroke: 'var(--border-subtle)',
    strokeDasharray: '3 3',
  },
  axis: {
    tick: { fontSize: 11, fill: 'var(--text-tertiary)' },
    axisLine: { stroke: 'var(--border-default)' },
  },
  tooltip: {
    contentStyle: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '6px',
      fontSize: '13px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    },
  },
};
```

---

## 🖼️ Icons

### Thư viện: Lucide React
```bash
npm install lucide-react
```

### Quy tắc Icon
| Context | Size | Stroke Width |
|---|---|---|
| Sidebar nav | 16px | 1.5 |
| Button icon | 16px | 2 |
| Table action | 14px | 1.5 |
| Stat card | 18px | 1.5 |
| Page header | 20px | 1.5 |
| Empty state | 40px | 1 |

```tsx
// ✅ Đúng
import { Users, Settings, BarChart3 } from 'lucide-react';
<Users size={16} strokeWidth={1.5} />

// ❌ KHÔNG dùng emoji làm icon trong UI: ❤️ 📊 🔔
// ❌ KHÔNG dùng icon quá to (>24px) trong navigation
// ❌ KHÔNG render icon với màu accent nổi bật — giữ cùng màu text
```

---

## 🎭 Animation & Transitions

### Quy tắc: Tinh Tế, Gần Như Vô Hình
```css
/* Transition mặc định cho mọi interactive element */
transition-duration: 150ms;
transition-timing-function: ease;

/* ✅ Cho phép animate */
- Hover state (background, color) — 150ms
- Focus ring — 150ms
- Dropdown open/close — 150ms
- Sidebar collapse — 200ms
- Page transition — fade 200ms
- Toast notification — slide-in 200ms

/* ❌ KHÔNG animate */
- Stat numbers counting up (quá flashy)
- Card entrance bounce/slide effects
- Loading spinners phức tạp (dùng simple spinner hoặc skeleton)
- Hover scale transform trên card
- Gradient animation
- Parallax effects
```

### Loading States
```tsx
// ✅ Skeleton loading — chuyên nghiệp
<div className="skeleton" style={{ width: '200px', height: '20px' }} />

// ✅ Simple spinner — cho button
<Loader2 size={16} className="animate-spin" />

// ❌ KHÔNG: Lottie animations, bouncing dots phức tạp
// ❌ KHÔNG: Full-page loading với logo spinning
```

```css
/* Skeleton animation — subtle */
.skeleton {
  background: linear-gradient(90deg, var(--bg-hover) 25%, var(--border-subtle) 50%, var(--bg-hover) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first */
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

### Layout Quy Tắc
| Screen | Sidebar | Content Max-Width | Stat Grid |
|---|---|---|---|
| Desktop (≥1280px) | 240px expanded | 100% (tự co) | 4 columns |
| Laptop (1024-1279px) | 240px expanded | 100% | 3 columns |
| Tablet (768-1023px) | 60px collapsed (icon only) | 100% | 2 columns |
| Mobile (<768px) | Hidden (overlay when open) | 100% | 1 column |

---

## 📋 Layout Templates

### Trang Danh Sách (List Page) — kiểu hay dùng nhất
```
┌─ Page Header ──────────────────────────────────────┐
│ Users                           [+ Thêm user mới]  │
│ Quản lý tài khoản người dùng                       │
├─ Toolbar ──────────────────────────────────────────┤
│ [🔍 Tìm kiếm...] [Role ▾] [Status ▾] [Dept ▾]    │
├─ Table ────────────────────────────────────────────┤
│ □  Tên          Email            Role     Status   │
│ ─────────────────────────────────────────────────  │
│ □  Nguyễn Văn A  an@neo...      Admin   ● Active  │
│ □  Trần Thị B    bt@neo...      User    ● Active  │
│ □  Lê Văn C      cl@neo...      User    ○ Inactive│
├─ Pagination ───────────────────────────────────────┤
│ Hiển thị 1-20 / 150        [< 1 2 3 ... 8 >]     │
└────────────────────────────────────────────────────┘
```

### Trang Dashboard
```
┌─ Page Header ──────────────────────────────────────┐
│ Dashboard                           Hôm nay: 07/04 │
├─ Stats Row ────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│ │Total User│ │Active    │ │Posts     │ │Surveys ││
│ │  1,247   │ │  892     │ │  45      │ │  3     ││
│ │↗ +12%    │ │↗ +5%     │ │↗ +23%    │ │→ 0%   ││
│ └──────────┘ └──────────┘ └──────────┘ └────────┘│
├─ Charts Row ───────────────────────────────────────┤
│ ┌─────────── Activity ────────┐ ┌── Departments ─┐│
│ │   📈 Line chart 7 days      │ │  🍩 Donut chart ││
│ │                              │ │                ││
│ └──────────────────────────────┘ └────────────────┘│
├─ Bottom Row ───────────────────────────────────────┤
│ ┌─────── Recent Activity ─────────────────────────┐│
│ │ • Admin A tạo user mới — 5 phút trước          ││
│ │ • Manager B publish thông báo — 1 giờ trước    ││
│ │ • Survey "Q1 Feedback" kết thúc — 2 giờ trước  ││
│ └─────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

---

## 🏷️ Empty States & Error States

### Empty State — Tối giản
```tsx
// ✅ Chuyên nghiệp
<div className="empty-state">
  <FileText size={40} strokeWidth={1} className="text-tertiary" />
  <p className="text-secondary">Chưa có bài viết nào</p>
  <button className="btn-secondary">Đăng bài đầu tiên</button>
</div>

// ❌ KHÔNG: illustration SVG phức tạp, emoji to, animation
```

### Error State — Rõ ràng, không drama
```tsx
// ✅
<div className="error-banner">
  <AlertCircle size={16} />
  <span>Không thể tải dữ liệu. Vui lòng thử lại.</span>
  <button>Thử lại</button>
</div>

// ❌ KHÔNG: full-page error với illustration sad robot
```

---

## 📝 Checklist Review UI

Trước khi hoàn thành mỗi trang, kiểm tra:

- [ ] **Không có màu gradient** (trừ chart line)
- [ ] **Border-radius max 12px** (trừ avatar tròn)
- [ ] **Font size không vượt 30px** trong dashboard
- [ ] **Spacing nhất quán** (theo 4px grid)
- [ ] **Chỉ 1 accent color** (blue) + neutral (zinc)
- [ ] **Table có border-bottom**, không full border grid
- [ ] **Icon ≤ 20px** trong navigation, ≤ 16px trong button
- [ ] **Button ghost/secondary** nhiều hơn primary
- [ ] **Hover effect chỉ thay đổi background/color**, không scale/shadow
- [ ] **Loading dùng skeleton**, không spinner phức tạp
- [ ] **Text có đủ contrast** (trên 4.5:1 ratio)
- [ ] **Form labels ở trên input**, không ở bên trái
- [ ] **Responsive hoạt động** ở 3 breakpoints

---

## 🌟 Design References

Khi cần cảm hứng, xem giao diện THẬT của:

| App | Tại sao xem |
|---|---|
| **Linear.app** | Typography hoàn hảo, layout clean, dark mode chuẩn |
| **Vercel Dashboard** | Spacing tối giản, table đẹp, stat cards professional |
| **Stripe Dashboard** | Data-dense nhưng dễ đọc, chart đẹp |
| **GitHub** | Table excellence, nav patterns, badge/label system |
| **Notion** | Content layout, sidebar design |
| **Raycast** | Command palette, keyboard shortcuts, micro-interactions |

> **KHÔNG** tham khảo: Dribbble concept shots (đẹp nhưng không thực tế), 
> Template admin miễn phí, UI kit với quá nhiều màu.
