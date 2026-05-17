# Supabase Design – CRM Yến Sào Vĩnh Hưng

## Mục lục

1. [Danh sách bảng và quan hệ](#1-danh-sách-bảng-và-quan-hệ)
2. [Sơ đồ quan hệ](#2-sơ-đồ-quan-hệ)
3. [Indexes tổng hợp](#3-indexes-tổng-hợp)
4. [Trigger và Function](#4-trigger-và-function)
5. [Lưu role](#5-lưu-role)
6. [Flow xác thực đầy đủ](#6-flow-xác-thực-đầy-đủ)
7. [Cơ chế phân quyền RLS](#7-cơ-chế-phân-quyền-rls)
8. [Xử lý Identity Linking](#8-xử-lý-identity-linking)
9. [Thứ tự chạy SQL files](#9-thứ-tự-chạy-sql-files)

---

## 1. Danh sách bảng và quan hệ

| Bảng | Mô tả | Quan hệ chính |
|------|-------|---------------|
| `profiles` | Hồ sơ người dùng, 1:1 với `auth.users` | PK = `auth.users.id` |
| `teams` | Nhóm bán hàng | `created_by → profiles.id` |
| `team_members` | Thành viên nhóm (N:N) | `team_id → teams`, `user_id → profiles` |
| `pipeline_stages` | Cấu hình cột Kanban | Độc lập, dữ liệu hệ thống |
| `leads` | Khách hàng / khách hàng tiềm năng | `assigned_to → profiles`, `team_id → teams` |
| `lead_tags` | Nhãn phân loại | Độc lập |
| `lead_tag_assignments` | Gán nhãn cho khách (N:N) | `lead_id → leads`, `tag_id → lead_tags` |
| `lead_lists` | Danh sách phân nhóm khách | `created_by → profiles`, `team_id → teams` |
| `lead_list_members` | Thành viên trong danh sách (N:N) | `list_id → lead_lists`, `lead_id → leads` |
| `opportunities` | Cơ hội bán hàng – thẻ Kanban | `lead_id → leads`, `stage_id → pipeline_stages` |
| `tasks` | Công việc hàng ngày | `assigned_to → profiles`, `lead_id → leads`, `opportunity_id → opportunities` |
| `subscriptions` | Bản ghi thanh toán | `lead_id → leads`, `opportunity_id → opportunities`, `recorded_by → profiles` |
| `activity_logs` | Nhật ký hoạt động (append-only) | `user_id → profiles` |

---

## 2. Sơ đồ quan hệ

```
auth.users (Supabase managed)
    │ 1:1 (trigger)
    ▼
profiles ──────────────────────────────────────────┐
    │                                               │
    │ N:N (team_members)                            │
    ▼                                               │
teams ◄─── team_members ──► profiles               │
    │                                               │
    │ FK                                            │
    ▼                                               │
leads ◄──────────────── lead_tag_assignments ──► lead_tags
    │                           │
    │ FK                        │ N:N (lead_list_members)
    ▼                           ▼
opportunities ──► pipeline_stages     lead_lists
    │
    │ FK
    ▼
tasks

leads ──► subscriptions ◄── opportunities
profiles ──► activity_logs
```

**Ghi chú:**
- `assigned_to` (leads, opportunities, tasks) → `profiles.id`: người phụ trách
- `team_id` (leads, opportunities, tasks, subscriptions, lead_lists) → `teams.id`: nhóm phụ trách, dùng để filter RLS cho team_lead
- `created_by` → `profiles.id`: người tạo bản ghi (audit trail nhẹ)

---

## 3. Indexes tổng hợp

| Bảng | Index | Mục đích |
|------|-------|----------|
| `profiles` | `email`, `role`, `is_active` | Lookup + filter |
| `team_members` | `team_id`, `user_id` | Cả 2 hướng lookup |
| `leads` | `assigned_to`, `team_id`, `segment` | RLS + filter chính |
| `leads` | `email`, `phone_primary` | Kiểm tra trùng |
| `leads` | `product_interests` (GIN) | Query `WHERE 'raw_nest' = ANY(product_interests)` |
| `leads` | `created_at DESC` | Sort danh sách |
| `opportunities` | `lead_id`, `stage_id`, `assigned_to`, `team_id` | RLS + Kanban |
| `opportunities` | `expected_close_date` | Filter theo ngày |
| `tasks` | `assigned_to, status, due_date` (composite) | Query "việc hôm nay của tôi" |
| `subscriptions` | `payment_date DESC`, `payment_status` | Báo cáo doanh thu |
| `activity_logs` | `entity_type, entity_id` (composite) | Xem lịch sử theo đối tượng |

---

## 4. Trigger và Function

### 4.1 `handle_new_user` (quan trọng nhất)

**Kích hoạt:** `AFTER INSERT ON auth.users`

**Mục đích:** Tự động tạo `profiles` row khi user đăng ký lần đầu, dù dùng email/password hay Google OAuth.

**Logic:**
```
auth.users INSERT
    → lấy full_name từ raw_user_meta_data.full_name (email/pw)
                              hoặc raw_user_meta_data.name (Google)
                              hoặc phần trước @ của email (fallback)
    → INSERT INTO profiles ON CONFLICT (id) DO UPDATE
        (chỉ cập nhật nếu trường hiện tại trống, không ghi đè)
    → role mặc định = 'sales', Admin phải gán thủ công
```

**Chống trùng:** `ON CONFLICT (id) DO UPDATE` – nếu trigger bị gọi 2 lần cho cùng user_id, không tạo bản ghi thứ hai.

### 4.2 `handle_user_email_update`

**Kích hoạt:** `AFTER UPDATE OF email ON auth.users`

Đồng bộ email mới từ `auth.users` sang `profiles` khi user đổi email.

### 4.3 `sync_role_to_auth_metadata`

**Kích hoạt:** `AFTER UPDATE OF role ON profiles`

Khi Admin thay đổi role của user, ghi role vào `auth.users.raw_app_meta_data.role`. Điều này giúp role xuất hiện trong JWT claims, cho phép hàm `get_my_role()` đọc từ JWT mà không cần query DB, tối ưu hiệu năng RLS.

### 4.4 `handle_opportunity_stage_change`

**Kích hoạt:** `BEFORE UPDATE OF stage_id ON opportunities`

Tự động gán/xóa `closed_at` khi cơ hội chuyển sang stage terminal (Chốt đơn / Thất bại).

### 4.5 `mark_overdue_tasks`

**Gọi thủ công hoặc qua Supabase Cron:**
```sql
SELECT mark_overdue_tasks();
```
Nên lên lịch chạy hàng ngày lúc 00:05 để cập nhật task quá hạn.

### 4.6 Helper Functions cho RLS (SECURITY DEFINER)

| Function | Trả về | Mục đích |
|----------|--------|----------|
| `get_my_role()` | `user_role` | Role của auth.uid(). Đọc JWT trước, fallback DB |
| `get_my_team_ids()` | `UUID[]` | Mảng team_id mà auth.uid() là thành viên |
| `is_admin()` | `BOOLEAN` | Shortcut: `get_my_role() = 'admin'` |
| `is_team_lead()` | `BOOLEAN` | Shortcut: `get_my_role() = 'team_lead'` |

**Tại sao SECURITY DEFINER?** Tất cả helper functions đều bypass RLS khi query `profiles` và `team_members`. Điều này tránh:
- Circular dependency (policy trên `profiles` gọi function query `profiles`)
- Stack overflow trong policy evaluation

---

## 5. Lưu Role

### Nơi lưu

Role được lưu ở **2 nơi đồng bộ**:

| Nơi | Cách lưu | Mục đích |
|-----|----------|----------|
| `profiles.role` | Cột `user_role` enum | Source of truth, Admin quản lý |
| `auth.users.raw_app_meta_data.role` | JSON string | JWT claims, đọc nhanh trong RLS |

### Cách đồng bộ

1. Khi tạo profile lần đầu: `handle_new_user` gán `role = 'sales'`
2. Khi Admin thay đổi role: `sync_role_to_auth_metadata` cập nhật `raw_app_meta_data`
3. Client cần gọi `supabase.auth.refreshSession()` sau khi role thay đổi để nhận JWT mới chứa role mới

### Quy tắc gán role

- **Mặc định khi đăng ký:** `sales`
- **Admin gán thủ công** qua trang Cài đặt > Người dùng (UPDATE profiles SET role = 'team_lead' WHERE id = ...)
- User **không thể tự nâng role** (policy `profiles_update_own` kiểm tra `role = get_my_role()`)

---

## 6. Flow Xác Thực Đầy Đủ

### 6.1 Đăng ký bằng email + mật khẩu

```
Client: supabase.auth.signUp({ email, password, options: { data: { full_name } } })
    ↓
Supabase Auth:
    1. Kiểm tra email chưa tồn tại trong auth.users
    2. Tạo auth.users record (email_confirmed = false)
    3. Gửi email xác nhận
    ↓
Trigger on_auth_user_created kích hoạt:
    → Tạo profiles row (role = 'sales')
    ↓
Client: Hiển thị màn hình "Vui lòng kiểm tra email"
```

### 6.2 Xác nhận email

```
User click link trong email xác nhận
    ↓
Supabase Auth: cập nhật email_confirmed_at trong auth.users
    ↓
Client: redirect về trang đăng nhập hoặc dashboard
```

### 6.3 Đăng nhập bằng email + mật khẩu

```
Client: supabase.auth.signInWithPassword({ email, password })
    ↓
Supabase Auth:
    1. Xác thực email + password
    2. Kiểm tra email_confirmed
    3. Trả về JWT có chứa sub=user_id, app_metadata.role
    ↓
Client:
    1. Lưu session
    2. Đọc role từ JWT: session.user.app_metadata.role
    3. Redirect theo role (admin → /admin, team_lead → /team, sales → /dashboard)
```

### 6.4 Đăng nhập bằng Google OAuth

```
Client: supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Redirect đến Google → User đồng ý → Google trả về access_token + email
    ↓
Supabase Auth:
    CASE 1 – Email chưa có trong auth.users:
        → Tạo auth.users record mới
        → Trigger on_auth_user_created: tạo profiles (full_name từ Google name, avatar từ Google picture)
    
    CASE 2 – Email đã có trong auth.users (user đã đăng ký email/password):
        → Supabase kiểm tra setting "Link identities by email" (phải bật)
        → Liên kết Google identity vào auth.users.id đã tồn tại
        → Thêm row vào auth.identities (provider='google', user_id=existing_user_id)
        → auth.users.id KHÔNG thay đổi → profiles KHÔNG thay đổi
        → Trigger KHÔNG kích hoạt (chỉ INSERT mới trigger)
    ↓
Client nhận JWT với cùng user_id, cùng role
```

**Cấu hình bắt buộc trong Supabase Dashboard:**
```
Authentication → Settings → "Link identities by email" → ENABLED
Authentication → Settings → Google OAuth → Client ID + Secret
```

### 6.5 Quên mật khẩu

```
Client: supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://app.yensaovinhhung.vn/reset-password'
})
    ↓
Supabase Auth: gửi email chứa magic link (có expires_in)
    ↓
User click link → redirect về app với token trong URL hash
    ↓
Client: Hệ thống tự detect token, hiển thị form nhập mật khẩu mới
    ↓
Client: supabase.auth.updateUser({ password: newPassword })
    ↓
Supabase: cập nhật hash password trong auth.users
    ↓
Client: redirect về trang đăng nhập
```

### 6.6 Logic chống tạo trùng tài khoản

**Tầng 1 – Supabase Auth:**
- `signUp` với email đã tồn tại → Supabase trả lỗi `"User already registered"`
- Google OAuth với email đã tồn tại + "Link identities" bật → tự động merge, không tạo user mới

**Tầng 2 – Database trigger:**
- `handle_new_user` dùng `ON CONFLICT (id) DO UPDATE` → nếu profiles.id đã tồn tại, chỉ cập nhật các trường trống, không tạo bản ghi mới

**Tầng 3 – Application level:**
- Trước khi tạo leads: kiểm tra trùng theo `phone_primary` và `email`
- Hiển thị cảnh báo nếu đã có khách hàng với thông tin tương tự

---

## 7. Cơ Chế Phân Quyền RLS

### Ma trận quyền

| Hành động | `admin` | `team_lead` | `sales` | `accounting` |
|-----------|---------|-------------|---------|--------------|
| Xem tất cả leads | ✅ | ❌ | ❌ | ❌ |
| Xem leads nhóm mình | ✅ | ✅ | ❌ | ❌ |
| Xem leads do mình phụ trách | ✅ | ✅ | ✅ | ❌ |
| Tạo/Sửa lead | ✅ | ✅ (nhóm) | ✅ (của mình) | ❌ |
| Xóa lead | ✅ | ✅ (nhóm) | ❌ | ❌ |
| Reassign lead sang người khác | ✅ | ✅ (nhóm) | ❌ | ❌ |
| Xem tất cả opportunities | ✅ | ❌ | ❌ | ❌ |
| Xem opportunities nhóm (Kanban) | ✅ | ✅ | ❌ | ❌ |
| Kéo thẻ Kanban (stage change) | ✅ | ✅ (nhóm) | ✅ (của mình) | ❌ |
| Tạo task cho người khác | ✅ | ✅ (nhóm) | ❌ | ❌ |
| Xem tất cả thanh toán | ✅ | ❌ | ❌ | ✅ |
| Xem thanh toán nhóm | ✅ | ✅ | ❌ | ✅ |
| Ghi nhận thanh toán | ✅ | ✅ (nhóm) | ✅ (của mình) | ❌ |
| Gán role cho user | ✅ | ❌ | ❌ | ❌ |
| Cấu hình pipeline stages | ✅ | ❌ | ❌ | ❌ |

### Cơ chế hoạt động

**Bước 1 – Request đến Supabase:**
```
Client (có JWT) → Supabase API → PostgreSQL
```

**Bước 2 – PostgreSQL gọi `auth.uid()`:**
Trả về UUID của user từ JWT claim `sub`.

**Bước 3 – RLS evaluation:**
```sql
-- Ví dụ SELECT trên bảng leads:
USING (
    is_admin()                                              -- admin: TRUE cho tất cả rows
    OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))  -- team_lead: rows của nhóm mình
    OR assigned_to = auth.uid()                             -- sales: rows do mình phụ trách
)
```
PostgreSQL lọc rows **trước khi trả về**, user không thể thấy row nào không pass USING clause.

**Bước 4 – INSERT/UPDATE validation:**
`WITH CHECK` clause kiểm tra row sau khi thay đổi, ngăn user gán `assigned_to` sang người khác.

### Ví dụ thực tế

**Sales Lê Quang Đạt (`uid = 00000003-...003`) query leads:**
```sql
-- Effective query sau khi RLS áp dụng:
SELECT * FROM leads
WHERE assigned_to = '00000003-0000-0000-0000-000000000003';
-- → Chỉ thấy 4 leads của mình: Linh, Quân, Trang, Khánh
```

**Trưởng nhóm Trần Thị Mai (`uid = 00000003-...002`) query leads:**
```sql
-- Effective query:
SELECT * FROM leads
WHERE team_id = '00000004-0000-0000-0000-000000000001';
-- → Thấy tất cả 6 leads của Nhóm Bán Hàng Miền Nam
```

**Admin Nguyễn Văn Thắng (`uid = 00000003-...001`) query leads:**
```sql
-- Effective query:
SELECT * FROM leads WHERE TRUE;
-- → Thấy tất cả leads
```

---

## 8. Xử Lý Identity Linking

### Tình huống 1: Đã có email/password → đăng nhập bằng Google

```
Trạng thái ban đầu:
  auth.users: { id: UUID-A, email: 'user@gmail.com', ... }
  auth.identities: [{ provider: 'email', user_id: UUID-A }]
  profiles: { id: UUID-A, email: 'user@gmail.com', role: 'sales', ... }

User click "Đăng nhập bằng Google" với cùng email user@gmail.com:

  → Supabase kiểm tra: email đã tồn tại? → YES
  → Setting "Link identities by email" = ENABLED?
      YES → Liên kết Google vào UUID-A
            INSERT auth.identities: { provider: 'google', user_id: UUID-A }
            auth.users.id VẪN LÀ UUID-A
            profiles KHÔNG THAY ĐỔI
            → User đăng nhập thành công với role và dữ liệu cũ
      
      NO → Supabase trả lỗi "User already registered"
           → App hiển thị: "Email này đã được đăng ký bằng email/mật khẩu.
             Vui lòng đăng nhập bằng email/mật khẩu và liên kết Google trong phần Cài đặt."
```

**Xử lý thủ công (nếu cần):**
```javascript
// Khi user đã đăng nhập, cho phép link thêm Google:
const { data, error } = await supabase.auth.linkIdentity({ provider: 'google' });
```

### Tình huống 2: Đã có Google account → muốn đăng nhập email/password

```
Trạng thái ban đầu:
  auth.users: { id: UUID-B, email: 'user@gmail.com', ... }
  auth.identities: [{ provider: 'google', user_id: UUID-B }]
  profiles: { id: UUID-B, ... }

User muốn set password:
  → Trong app, vào phần Hồ sơ → Đặt mật khẩu
  → Client: supabase.auth.updateUser({ password: 'newPassword' })
  → Supabase thêm password vào auth.users
  → INSERT auth.identities: { provider: 'email', user_id: UUID-B }
  → Từ đây user có thể đăng nhập bằng cả 2 cách
  → profiles.id vẫn là UUID-B, không thay đổi
```

### Tình huống 3: Hai tài khoản riêng biệt (edge case – cần xử lý thủ công)

```
Xảy ra khi "Link identities by email" bị TẮT và user đã tạo 2 account:
  Account A: email/password với email user@gmail.com (profiles: id=UUID-A)
  Account B: Google OAuth với cùng email (profiles: id=UUID-B)

Hậu quả:
  - Hai profiles khác nhau, role/dữ liệu không đồng bộ
  
Xử lý:
  1. Admin dùng Supabase Admin API để merge 2 auth.users thành 1
  2. Chạy migration SQL để chuyển tất cả foreign key từ UUID-B về UUID-A:
     UPDATE leads SET assigned_to = UUID-A WHERE assigned_to = UUID-B;
     UPDATE tasks   SET assigned_to = UUID-A WHERE assigned_to = UUID-B;
     -- ... lặp cho tất cả bảng
  3. DELETE FROM profiles WHERE id = UUID-B;
  4. DELETE user UUID-B trong Supabase Auth (giữ lại UUID-A)

Phòng ngừa: Luôn bật "Link identities by email" trong Supabase Auth settings.
```

---

## 9. Thứ Tự Chạy SQL Files

Chạy theo thứ tự sau trong Supabase SQL Editor hoặc migration tool:

```bash
# 1. Schema (tables, enums, extensions)
supabase/01_schema.sql

# 2. Indexes (sau khi tables đã tạo)
supabase/02_indexes.sql

# 3. Functions & Triggers (sau khi tables tạo xong)
supabase/03_functions.sql

# 4. RLS Policies (sau khi functions tạo xong)
supabase/04_rls.sql

# 5. Seed Data (sau khi RLS xong, chỉ dùng cho dev/staging)
supabase/05_seed.sql
```

**Lưu ý seed data:**
- File `05_seed.sql` dùng các UUID cố định cho dữ liệu mẫu
- Với bảng `profiles`, UUID phải khớp với `auth.users.id` thực tế
- Trong môi trường dev với `supabase start`: insert vào `auth.users` trước bằng service_role, lấy UUID, thay vào seed
- Trong production: tạo user qua Supabase Dashboard/API, trigger tự tạo profile

**Cấu hình Supabase Auth bắt buộc (Dashboard):**
```
Authentication → Settings:
  ✅ Enable email confirmations
  ✅ Link identities by email (QUAN TRỌNG – ngăn tạo trùng khi dùng Google OAuth)
  ✅ Google OAuth: điền Client ID và Client Secret từ Google Cloud Console
  
Authentication → Email Templates:
  Chỉnh "Confirm signup" và "Reset password" email sang tiếng Việt
```
