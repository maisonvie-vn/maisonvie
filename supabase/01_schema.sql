-- ============================================================
-- CRM Yến Sào Vĩnh Hưng
-- FILE 01: Schema – Extensions, Enums, Tables
-- ============================================================

-- ============================================================
-- CLEANUP: Drop objects if they exist to prevent "already exists" errors
-- ============================================================
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS lead_list_members CASCADE;
DROP TABLE IF EXISTS lead_lists CASCADE;
DROP TABLE IF EXISTS lead_tag_assignments CASCADE;
DROP TABLE IF EXISTS lead_tags CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS product_interest CASCADE;
DROP TYPE IF EXISTS lead_segment CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'admin',        -- Ban giám đốc / Quản trị hệ thống
    'team_lead',    -- Trưởng nhóm bán hàng
    'sales',        -- Nhân viên Sales
    'support',      -- CSKH / Hỗ trợ
    'accounting'    -- Kế toán / Thu ngân
);

CREATE TYPE lead_segment AS ENUM (
    'retail',   -- Khách lẻ
    'agent',    -- Đại lý
    'vip'       -- VIP
);

CREATE TYPE product_interest AS ENUM (
    'raw_nest',      -- Yến thô
    'stewed_nest',   -- Yến chưng
    'refined_nest'   -- Yến tinh chế
);

CREATE TYPE task_status AS ENUM (
    'todo',         -- Mới
    'in_progress',  -- Đang làm
    'done',         -- Hoàn thành
    'overdue'       -- Quá hạn
);

CREATE TYPE task_priority AS ENUM (
    'low',     -- Thấp
    'medium',  -- Trung bình
    'high'     -- Cao
);

CREATE TYPE payment_status AS ENUM (
    'pending',   -- Chưa thanh toán
    'paid',      -- Đã thanh toán
    'refunded'   -- Hoàn tiền
);

CREATE TYPE payment_method AS ENUM (
    'cash',           -- Tiền mặt
    'bank_transfer',  -- Chuyển khoản
    'cod',            -- COD
    'other'           -- Khác
);

-- ============================================================
-- TABLE: profiles
-- Hồ sơ người dùng, liên kết 1:1 với auth.users.
-- Được tạo tự động qua trigger on_auth_user_created.
-- Không phụ thuộc vào phương thức đăng nhập (email hay Google OAuth).
-- ============================================================

CREATE TABLE profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT        NOT NULL UNIQUE,
    full_name   TEXT        NOT NULL DEFAULT '',
    avatar_url  TEXT,
    role        user_role   NOT NULL DEFAULT 'sales',
    phone       TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  profiles            IS 'Hồ sơ người dùng hệ thống, 1:1 với auth.users. Tạo tự động qua trigger.';
COMMENT ON COLUMN profiles.role       IS 'Vai trò: admin | team_lead | sales | support | accounting. Admin gán thủ công.';
COMMENT ON COLUMN profiles.id         IS 'Khóa chính = auth.users.id. Bất kể đăng nhập bằng email hay Google, luôn dùng cùng UUID này.';

-- ============================================================
-- TABLE: teams
-- Nhóm bán hàng
-- ============================================================

CREATE TABLE teams (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    description TEXT,
    created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Nhóm bán hàng – Admin tạo và quản lý.';

-- ============================================================
-- TABLE: team_members
-- Thành viên nhóm (nhiều-nhiều: profiles <-> teams)
-- ============================================================

CREATE TABLE team_members (
    id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id   UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

COMMENT ON TABLE team_members IS 'Thành viên thuộc nhóm bán hàng. UNIQUE(team_id, user_id) ngăn trùng lặp.';

-- ============================================================
-- TABLE: pipeline_stages
-- Cấu hình giai đoạn Kanban – dữ liệu hệ thống, Admin quản lý
-- ============================================================

CREATE TABLE pipeline_stages (
    id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT    NOT NULL UNIQUE,
    display_name TEXT    NOT NULL,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    color        TEXT    DEFAULT '#8B8375',
    is_terminal  BOOLEAN NOT NULL DEFAULT FALSE,
    is_won       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  pipeline_stages             IS 'Cấu hình các cột Kanban trong pipeline bán hàng.';
COMMENT ON COLUMN pipeline_stages.is_terminal IS 'TRUE nếu là bước kết thúc cơ hội (Chốt đơn hoặc Thất bại).';
COMMENT ON COLUMN pipeline_stages.is_won      IS 'TRUE chỉ với giai đoạn "Chốt đơn". Dùng để tính doanh thu.';

-- ============================================================
-- TABLE: leads
-- Khách hàng / Khách hàng tiềm năng
-- ============================================================

CREATE TABLE leads (
    id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name         TEXT            NOT NULL,
    company_name      TEXT,
    phone_primary     TEXT,
    phone_secondary   TEXT,
    email             TEXT,
    address           TEXT,
    region            TEXT,
    segment           lead_segment    NOT NULL DEFAULT 'retail',
    product_interests product_interest[] NOT NULL DEFAULT '{}',
    notes             TEXT,
    assigned_to       UUID            REFERENCES profiles(id) ON DELETE SET NULL,
    team_id           UUID            REFERENCES teams(id) ON DELETE SET NULL,
    created_by        UUID            REFERENCES profiles(id) ON DELETE SET NULL,
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  leads                   IS 'Danh sách khách hàng tiềm năng và khách hàng.';
COMMENT ON COLUMN leads.segment           IS 'Phân khúc: retail (Khách lẻ) | agent (Đại lý) | vip (VIP).';
COMMENT ON COLUMN leads.product_interests IS 'Mảng sản phẩm quan tâm: raw_nest | stewed_nest | refined_nest.';
COMMENT ON COLUMN leads.assigned_to       IS 'Nhân viên phụ trách. RLS dựa vào cột này cho role=sales.';
COMMENT ON COLUMN leads.team_id           IS 'Nhóm phụ trách. RLS dựa vào cột này cho role=team_lead.';

-- ============================================================
-- TABLE: lead_tags
-- Nhãn phân loại
-- ============================================================

CREATE TABLE lead_tags (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT        NOT NULL UNIQUE,
    color      TEXT        DEFAULT '#E3D7C8',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE lead_tags IS 'Nhãn / tag phân loại cho khách hàng.';

-- ============================================================
-- TABLE: lead_tag_assignments
-- Gán nhãn cho khách hàng (bảng nối)
-- ============================================================

CREATE TABLE lead_tag_assignments (
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES lead_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- ============================================================
-- TABLE: lead_lists
-- Danh sách / Phân nhóm khách hàng
-- ============================================================

CREATE TABLE lead_lists (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    description TEXT,
    criteria    JSONB,
    created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    team_id     UUID        REFERENCES teams(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  lead_lists          IS 'Danh sách phân nhóm khách hàng (segment list).';
COMMENT ON COLUMN lead_lists.criteria IS 'Tiêu chí lọc dạng JSON cho danh sách động, ví dụ: {"segment":"agent","region":["TP.HCM"]}.';

-- ============================================================
-- TABLE: lead_list_members
-- Thành viên trong danh sách khách hàng (bảng nối)
-- ============================================================

CREATE TABLE lead_list_members (
    list_id  UUID        NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
    lead_id  UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    PRIMARY KEY (list_id, lead_id)
);

-- ============================================================
-- TABLE: opportunities
-- Cơ hội bán hàng – thẻ trên bảng Kanban
-- ============================================================

CREATE TABLE opportunities (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT        NOT NULL,
    lead_id             UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    stage_id            UUID        NOT NULL REFERENCES pipeline_stages(id),
    expected_value      NUMERIC(15,0) NOT NULL DEFAULT 0,
    expected_close_date DATE,
    assigned_to         UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    team_id             UUID        REFERENCES teams(id) ON DELETE SET NULL,
    created_by          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    notes               TEXT,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  opportunities                IS 'Cơ hội bán hàng – các thẻ trên bảng Kanban.';
COMMENT ON COLUMN opportunities.expected_value IS 'Giá trị đơn hàng dự kiến, đơn vị VND.';
COMMENT ON COLUMN opportunities.closed_at      IS 'Thời điểm chốt/thất bại. Gán tự động qua trigger khi stage là terminal.';

-- ============================================================
-- TABLE: tasks
-- Công việc hàng ngày gắn với khách hàng hoặc cơ hội
-- ============================================================

CREATE TABLE tasks (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    title          TEXT          NOT NULL,
    description    TEXT,
    lead_id        UUID          REFERENCES leads(id) ON DELETE SET NULL,
    opportunity_id UUID          REFERENCES opportunities(id) ON DELETE SET NULL,
    assigned_to    UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_by     UUID          REFERENCES profiles(id) ON DELETE SET NULL,
    team_id        UUID          REFERENCES teams(id) ON DELETE SET NULL,
    status         task_status   NOT NULL DEFAULT 'todo',
    priority       task_priority NOT NULL DEFAULT 'medium',
    due_date       TIMESTAMPTZ,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tasks IS 'Công việc hàng ngày của Sales: gọi điện, gửi báo giá, chăm sóc lại...';

-- ============================================================
-- TABLE: subscriptions (thanh toán)
-- ============================================================

CREATE TABLE subscriptions (
    id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id        UUID           NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    opportunity_id UUID           REFERENCES opportunities(id) ON DELETE SET NULL,
    amount         NUMERIC(15,0)  NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
    payment_date   DATE,
    notes          TEXT,
    recorded_by    UUID           REFERENCES profiles(id) ON DELETE SET NULL,
    team_id        UUID           REFERENCES teams(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  subscriptions        IS 'Bản ghi thanh toán gắn với khách hàng và cơ hội.';
COMMENT ON COLUMN subscriptions.amount IS 'Số tiền thanh toán, đơn vị VND.';

-- ============================================================
-- TABLE: activity_logs
-- Nhật ký hoạt động – append-only, không được UPDATE/DELETE
-- ============================================================

CREATE TABLE activity_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    action      TEXT        NOT NULL,
    entity_type TEXT        NOT NULL,
    entity_id   UUID        NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  activity_logs             IS 'Nhật ký toàn bộ hoạt động. Append-only – không được sửa/xóa.';
COMMENT ON COLUMN activity_logs.action      IS 'Ví dụ: lead.created | opportunity.stage_changed | task.completed | payment.recorded';
COMMENT ON COLUMN activity_logs.entity_type IS 'Loại đối tượng: lead | opportunity | task | subscription | profile';
