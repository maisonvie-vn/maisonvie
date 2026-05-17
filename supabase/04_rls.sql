-- ============================================================
-- CRM Yến Sào Vĩnh Hưng
-- FILE 04: Row Level Security (RLS) Policies
--
-- Cơ chế phân quyền 3 lớp:
--   admin     → Đọc và quản lý toàn bộ dữ liệu
--   team_lead → Đọc và quản lý dữ liệu thuộc nhóm mình
--   sales     → Chỉ đọc và quản lý dữ liệu do mình phụ trách
--
-- Tất cả policy dùng helper function SECURITY DEFINER
-- (định nghĩa trong 03_functions.sql) để tránh circular
-- dependency khi policies trên bảng 'profiles' tự query 'profiles'.
-- ============================================================

-- ============================================================
-- Bật RLS trên tất cả bảng nghiệp vụ
-- ============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_lists          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_list_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: profiles
--
-- SELECT:
--   - User luôn thấy profile của chính mình
--   - Team lead thấy profile của các thành viên trong nhóm mình
--   - Admin thấy tất cả
-- UPDATE:
--   - User cập nhật profile của mình, nhưng KHÔNG tự nâng role
--   - Admin cập nhật tất cả (kể cả role)
-- INSERT: chỉ qua trigger handle_new_user (SECURITY DEFINER)
-- DELETE: chỉ Admin
-- ============================================================

-- SELECT
CREATE POLICY "profiles_select"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR is_admin()
        OR (
            is_team_lead()
            AND id IN (
                SELECT tm.user_id
                FROM   team_members tm
                WHERE  tm.team_id = ANY(get_my_team_ids())
            )
        )
    );

-- UPDATE: user cập nhật profile mình – không được đổi role
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() AND NOT is_admin())
    WITH CHECK (
        id   = auth.uid()
        -- Giữ nguyên role hiện tại, không tự nâng quyền
        AND role = get_my_role()
    );

-- UPDATE: admin cập nhật tất cả (kể cả role)
CREATE POLICY "profiles_update_admin"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- DELETE: chỉ admin
CREATE POLICY "profiles_delete_admin"
    ON profiles FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================
-- TABLE: teams
--
-- SELECT: thành viên thấy nhóm mình; admin thấy tất cả
-- INSERT/UPDATE/DELETE: chỉ admin
-- ============================================================

CREATE POLICY "teams_select"
    ON teams FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR id = ANY(get_my_team_ids())
    );

CREATE POLICY "teams_insert_admin"
    ON teams FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "teams_update_admin"
    ON teams FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "teams_delete_admin"
    ON teams FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================
-- TABLE: team_members
--
-- SELECT: user thấy membership của mình; team_lead thấy nhóm mình; admin tất cả
-- INSERT/DELETE: admin hoặc team_lead (chỉ trong nhóm mình)
-- ============================================================

CREATE POLICY "team_members_select"
    ON team_members FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR user_id = auth.uid()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    );

CREATE POLICY "team_members_insert"
    ON team_members FOR INSERT
    TO authenticated
    WITH CHECK (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    );

CREATE POLICY "team_members_delete"
    ON team_members FOR DELETE
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    );

-- ============================================================
-- TABLE: pipeline_stages
--
-- SELECT: tất cả authenticated (cần để render Kanban)
-- INSERT/UPDATE/DELETE: chỉ admin
-- ============================================================

CREATE POLICY "pipeline_stages_select_all"
    ON pipeline_stages FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "pipeline_stages_insert_admin"
    ON pipeline_stages FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "pipeline_stages_update_admin"
    ON pipeline_stages FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "pipeline_stages_delete_admin"
    ON pipeline_stages FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================
-- TABLE: leads
--
-- SELECT:
--   admin     → tất cả
--   team_lead → leads có team_id trong nhóm mình
--   sales     → leads mà assigned_to = mình
-- INSERT:
--   admin, team_lead → tự do (trong scope nhóm)
--   sales → chỉ leads mà mình là người phụ trách
-- UPDATE: tương tự INSERT
-- DELETE: admin và team_lead (sales không xóa được)
-- ============================================================

-- SELECT
CREATE POLICY "leads_select"
    ON leads FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR assigned_to = auth.uid()
    );

-- INSERT
CREATE POLICY "leads_insert_admin"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "leads_insert_team_lead"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (
        is_team_lead()
        AND team_id = ANY(get_my_team_ids())
    );

CREATE POLICY "leads_insert_sales"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (
        get_my_role() = 'sales'
        AND assigned_to = auth.uid()
    );

-- UPDATE
CREATE POLICY "leads_update_admin"
    ON leads FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "leads_update_team_lead"
    ON leads FOR UPDATE
    TO authenticated
    USING    (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    WITH CHECK (is_team_lead() AND team_id = ANY(get_my_team_ids()));

CREATE POLICY "leads_update_sales"
    ON leads FOR UPDATE
    TO authenticated
    USING    (assigned_to = auth.uid())
    -- Sales không được reassign lead sang người khác
    WITH CHECK (assigned_to = auth.uid());

-- DELETE
CREATE POLICY "leads_delete_admin"
    ON leads FOR DELETE
    TO authenticated
    USING (is_admin());

CREATE POLICY "leads_delete_team_lead"
    ON leads FOR DELETE
    TO authenticated
    USING (is_team_lead() AND team_id = ANY(get_my_team_ids()));

-- ============================================================
-- TABLE: lead_tags
--
-- SELECT: tất cả authenticated
-- INSERT: admin và team_lead
-- UPDATE/DELETE: chỉ admin
-- ============================================================

CREATE POLICY "lead_tags_select_all"
    ON lead_tags FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "lead_tags_insert"
    ON lead_tags FOR INSERT
    TO authenticated
    WITH CHECK (is_admin() OR is_team_lead());

CREATE POLICY "lead_tags_update_admin"
    ON lead_tags FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "lead_tags_delete_admin"
    ON lead_tags FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================
-- TABLE: lead_tag_assignments
--
-- SELECT: theo quyền đọc lead tương ứng
-- INSERT/DELETE: ai đọc được lead thì gán/bỏ tag được
-- ============================================================

CREATE POLICY "lead_tag_assignments_select"
    ON lead_tag_assignments FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR lead_id IN (
            SELECT id FROM leads
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR assigned_to = auth.uid()
        )
    );

CREATE POLICY "lead_tag_assignments_insert"
    ON lead_tag_assignments FOR INSERT
    TO authenticated
    WITH CHECK (
        is_admin()
        OR lead_id IN (
            SELECT id FROM leads
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR assigned_to = auth.uid()
        )
    );

CREATE POLICY "lead_tag_assignments_delete"
    ON lead_tag_assignments FOR DELETE
    TO authenticated
    USING (
        is_admin()
        OR lead_id IN (
            SELECT id FROM leads
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR assigned_to = auth.uid()
        )
    );

-- ============================================================
-- TABLE: lead_lists
--
-- SELECT: admin tất cả; team_lead nhóm mình; sales danh sách tự tạo
-- INSERT: admin, team_lead (cho nhóm), sales (danh sách cá nhân)
-- UPDATE/DELETE: chủ sở hữu hoặc admin/team_lead theo scope
-- ============================================================

CREATE POLICY "lead_lists_select"
    ON lead_lists FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR created_by = auth.uid()
    );

CREATE POLICY "lead_lists_insert_admin"
    ON lead_lists FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "lead_lists_insert_team_lead"
    ON lead_lists FOR INSERT
    TO authenticated
    WITH CHECK (
        is_team_lead()
        AND team_id = ANY(get_my_team_ids())
    );

CREATE POLICY "lead_lists_insert_sales"
    ON lead_lists FOR INSERT
    TO authenticated
    WITH CHECK (
        get_my_role() = 'sales'
        AND created_by = auth.uid()
        AND team_id IS NULL  -- sales không được gán vào nhóm khi tạo
    );

CREATE POLICY "lead_lists_update"
    ON lead_lists FOR UPDATE
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR created_by = auth.uid()
    )
    WITH CHECK (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR created_by = auth.uid()
    );

CREATE POLICY "lead_lists_delete"
    ON lead_lists FOR DELETE
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR created_by = auth.uid()
    );

-- ============================================================
-- TABLE: lead_list_members
-- ============================================================

CREATE POLICY "lead_list_members_select"
    ON lead_list_members FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR list_id IN (
            SELECT id FROM lead_lists
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR created_by = auth.uid()
        )
    );

CREATE POLICY "lead_list_members_insert"
    ON lead_list_members FOR INSERT
    TO authenticated
    WITH CHECK (
        is_admin()
        OR list_id IN (
            SELECT id FROM lead_lists
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR created_by = auth.uid()
        )
    );

CREATE POLICY "lead_list_members_delete"
    ON lead_list_members FOR DELETE
    TO authenticated
    USING (
        is_admin()
        OR list_id IN (
            SELECT id FROM lead_lists
            WHERE  (is_team_lead() AND team_id = ANY(get_my_team_ids()))
                OR created_by = auth.uid()
        )
    );

-- ============================================================
-- TABLE: opportunities
--
-- Quy tắc tương tự leads:
--   admin     → tất cả
--   team_lead → cơ hội của nhóm mình
--   sales     → cơ hội do mình phụ trách
-- Sales không được tự reassign cơ hội sang người khác.
-- ============================================================

-- SELECT
CREATE POLICY "opportunities_select"
    ON opportunities FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR assigned_to = auth.uid()
    );

-- INSERT
CREATE POLICY "opportunities_insert_admin"
    ON opportunities FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "opportunities_insert_team_lead"
    ON opportunities FOR INSERT
    TO authenticated
    WITH CHECK (
        is_team_lead()
        AND team_id = ANY(get_my_team_ids())
    );

CREATE POLICY "opportunities_insert_sales"
    ON opportunities FOR INSERT
    TO authenticated
    WITH CHECK (
        get_my_role() = 'sales'
        AND assigned_to = auth.uid()
    );

-- UPDATE
CREATE POLICY "opportunities_update_admin"
    ON opportunities FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "opportunities_update_team_lead"
    ON opportunities FOR UPDATE
    TO authenticated
    USING    (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    WITH CHECK (is_team_lead() AND team_id = ANY(get_my_team_ids()));

CREATE POLICY "opportunities_update_sales"
    ON opportunities FOR UPDATE
    TO authenticated
    USING    (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

-- DELETE
CREATE POLICY "opportunities_delete_admin"
    ON opportunities FOR DELETE
    TO authenticated
    USING (is_admin());

CREATE POLICY "opportunities_delete_team_lead"
    ON opportunities FOR DELETE
    TO authenticated
    USING (is_team_lead() AND team_id = ANY(get_my_team_ids()));

-- ============================================================
-- TABLE: tasks
--
-- SELECT: admin tất cả; team_lead nhóm mình; sales task của mình
-- UPDATE: sales chỉ cập nhật status/completed_at của task mình,
--         không được reassign sang người khác
-- DELETE: admin, team_lead, và sales xóa task của chính mình
-- ============================================================

-- SELECT
CREATE POLICY "tasks_select"
    ON tasks FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR assigned_to = auth.uid()
    );

-- INSERT
CREATE POLICY "tasks_insert_admin"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "tasks_insert_team_lead"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        is_team_lead()
        AND team_id = ANY(get_my_team_ids())
    );

CREATE POLICY "tasks_insert_sales"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        get_my_role() = 'sales'
        AND assigned_to = auth.uid()
    );

-- UPDATE
CREATE POLICY "tasks_update_admin"
    ON tasks FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "tasks_update_team_lead"
    ON tasks FOR UPDATE
    TO authenticated
    USING    (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    WITH CHECK (is_team_lead() AND team_id = ANY(get_my_team_ids()));

-- Sales: chỉ cập nhật task của mình, không được chuyển sang người khác
CREATE POLICY "tasks_update_sales"
    ON tasks FOR UPDATE
    TO authenticated
    USING    (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

-- DELETE
CREATE POLICY "tasks_delete_admin"
    ON tasks FOR DELETE
    TO authenticated
    USING (is_admin());

CREATE POLICY "tasks_delete_team_lead"
    ON tasks FOR DELETE
    TO authenticated
    USING (is_team_lead() AND team_id = ANY(get_my_team_ids()));

CREATE POLICY "tasks_delete_own"
    ON tasks FOR DELETE
    TO authenticated
    USING (assigned_to = auth.uid());

-- ============================================================
-- TABLE: subscriptions (thanh toán)
--
-- SELECT: admin tất cả; accounting tất cả (chỉ xem);
--         team_lead nhóm mình; sales của mình (recorded_by)
-- INSERT: admin, team_lead, sales (gắn với lead mà mình phụ trách)
-- UPDATE: admin và team_lead (điều chỉnh trạng thái)
-- DELETE: chỉ admin
-- ============================================================

-- SELECT
CREATE POLICY "subscriptions_select"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR get_my_role() = 'accounting'
        OR (is_team_lead() AND team_id = ANY(get_my_team_ids()))
        OR recorded_by = auth.uid()
    );

-- INSERT
CREATE POLICY "subscriptions_insert_admin"
    ON subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "subscriptions_insert_team_lead"
    ON subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (
        is_team_lead()
        AND team_id = ANY(get_my_team_ids())
    );

CREATE POLICY "subscriptions_insert_sales"
    ON subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (
        get_my_role() = 'sales'
        AND recorded_by = auth.uid()
        -- Chỉ ghi thanh toán cho lead mà mình phụ trách
        AND lead_id IN (
            SELECT id FROM leads WHERE assigned_to = auth.uid()
        )
    );

-- UPDATE
CREATE POLICY "subscriptions_update_admin"
    ON subscriptions FOR UPDATE
    TO authenticated
    USING    (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "subscriptions_update_team_lead"
    ON subscriptions FOR UPDATE
    TO authenticated
    USING    (is_team_lead() AND team_id = ANY(get_my_team_ids()))
    WITH CHECK (is_team_lead() AND team_id = ANY(get_my_team_ids()));

-- DELETE: chỉ admin
CREATE POLICY "subscriptions_delete_admin"
    ON subscriptions FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================
-- TABLE: activity_logs
--
-- SELECT: admin tất cả; team_lead log của thành viên nhóm mình;
--         sales và các role khác chỉ xem log của chính mình
-- INSERT: tất cả authenticated (app code ghi log)
--         Mỗi user chỉ insert log với user_id = chính mình
-- UPDATE/DELETE: KHÔNG CHO PHÉP (append-only audit trail)
-- ============================================================

CREATE POLICY "activity_logs_select"
    ON activity_logs FOR SELECT
    TO authenticated
    USING (
        is_admin()
        OR (
            is_team_lead()
            AND user_id IN (
                SELECT tm.user_id
                FROM   team_members tm
                WHERE  tm.team_id = ANY(get_my_team_ids())
            )
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "activity_logs_insert"
    ON activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Không có policy UPDATE → không ai update được activity_logs
-- Không có policy DELETE → không ai xóa được activity_logs
