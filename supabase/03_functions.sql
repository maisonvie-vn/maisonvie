-- ============================================================
-- CRM Yến Sào Vĩnh Hưng
-- FILE 03: Functions & Triggers
-- ============================================================

-- ============================================================
-- SECTION A: Trigger updated_at chung
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_teams
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_pipeline_stages
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_leads
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_lead_lists
    BEFORE UPDATE ON lead_lists
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_opportunities
    BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- SECTION B: handle_new_user
--
-- Mục đích: Tự động tạo profile khi user đăng ký lần đầu
-- (cả email/password lẫn Google OAuth).
--
-- Cơ chế chống trùng:
--   - Trigger kích hoạt khi INSERT vào auth.users.
--   - Với Supabase identity linking, cùng 1 email → cùng 1 auth.users.id
--     → INSERT chỉ chạy 1 lần → profile không bị tạo trùng.
--   - ON CONFLICT (id) DO UPDATE bảo vệ thêm nếu trigger chạy lại.
--   - Không tự nâng role: mặc định 'sales', Admin gán thủ công.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name  TEXT;
    v_avatar_url TEXT;
BEGIN
    -- Google OAuth: raw_user_meta_data chứa key "name" và "avatar_url"
    -- Email/Password: raw_user_meta_data chứa key "full_name" nếu user điền
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1)
    );

    v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_avatar_url,
        'sales'
    )
    ON CONFLICT (id) DO UPDATE SET
        -- Cập nhật email nếu thay đổi (sau khi merge identity)
        email      = EXCLUDED.email,
        -- Chỉ cập nhật full_name nếu profile hiện tại chưa có
        full_name  = CASE
                        WHEN profiles.full_name = '' OR profiles.full_name IS NULL
                        THEN EXCLUDED.full_name
                        ELSE profiles.full_name
                     END,
        -- Chỉ cập nhật avatar nếu profile hiện tại chưa có
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Trigger: kích hoạt sau khi INSERT vào auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SECTION C: handle_user_email_update
--
-- Đồng bộ email từ auth.users → profiles khi user đổi email
-- ============================================================

CREATE OR REPLACE FUNCTION handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.profiles
        SET email      = NEW.email,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_email_update();

-- ============================================================
-- SECTION D: sync_role_to_auth_metadata
--
-- Khi Admin thay đổi role trong profiles,
-- ghi role vào raw_app_meta_data của auth.users.
-- Điều này giúp role có trong JWT claims → RLS helper function
-- đọc được mà không cần query DB.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        UPDATE auth.users
        SET raw_app_meta_data =
            COALESCE(raw_app_meta_data, '{}'::jsonb)
            || jsonb_build_object('role', NEW.role::text)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_role_changed
    AFTER UPDATE OF role ON profiles
    FOR EACH ROW EXECUTE FUNCTION sync_role_to_auth_metadata();

-- ============================================================
-- SECTION E: handle_opportunity_stage_change
--
-- Khi cơ hội chuyển sang stage terminal → gán closed_at.
-- Khi chuyển lại stage không terminal → xóa closed_at (reopen).
-- ============================================================

CREATE OR REPLACE FUNCTION handle_opportunity_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_is_terminal BOOLEAN;
BEGIN
    IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
        SELECT is_terminal INTO v_is_terminal
        FROM pipeline_stages
        WHERE id = NEW.stage_id;

        IF v_is_terminal AND OLD.closed_at IS NULL THEN
            NEW.closed_at := NOW();
        ELSIF NOT v_is_terminal THEN
            NEW.closed_at := NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_opportunity_stage_change
    BEFORE UPDATE OF stage_id ON opportunities
    FOR EACH ROW EXECUTE FUNCTION handle_opportunity_stage_change();

-- ============================================================
-- SECTION F: mark_overdue_tasks
--
-- Hàm chạy định kỳ (qua pg_cron hoặc Supabase Edge Function Cron)
-- để cập nhật tasks quá hạn. Gọi hàng ngày lúc 00:05.
-- ============================================================

CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE tasks
    SET    status     = 'overdue',
           updated_at = NOW()
    WHERE  status  IN ('todo', 'in_progress')
      AND  due_date < NOW()
      AND  due_date IS NOT NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- ============================================================
-- SECTION G: RLS Helper Functions
--
-- Tất cả đều SECURITY DEFINER để:
--   1. Bypass RLS khi query profiles (tránh circular dependency).
--   2. Dùng được trong tất cả policies mà không gây stack overflow.
-- ============================================================

-- Lấy role của user hiện tại
-- Ưu tiên JWT (nhanh, không hit DB) → fallback query DB
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        -- Đọc từ JWT app_metadata (sau khi sync_role_to_auth_metadata chạy)
        (auth.jwt() -> 'app_metadata' ->> 'role')::user_role,
        -- Fallback: query profiles trực tiếp (khi JWT chưa được refresh)
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        -- Default an toàn
        'sales'::user_role
    );
$$;

-- Lấy danh sách team_id mà user hiện tại là thành viên
CREATE OR REPLACE FUNCTION get_my_team_ids()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT ARRAY(
        SELECT team_id
        FROM   public.team_members
        WHERE  user_id = auth.uid()
    );
$$;

-- Kiểm tra nhanh: có phải admin không?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT get_my_role() = 'admin'::user_role;
$$;

-- Kiểm tra nhanh: có phải team_lead không?
CREATE OR REPLACE FUNCTION is_team_lead()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT get_my_role() = 'team_lead'::user_role;
$$;
