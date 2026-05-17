-- ============================================================
-- CRM Yến Sào Vĩnh Hưng
-- FILE 05: Seed Data
--
-- Chạy sau khi đã chạy 01–04.
--
-- QUAN TRỌNG – Về profiles và auth.users:
--   Trong production: tạo user qua Supabase Auth (Dashboard hoặc API),
--   trigger handle_new_user sẽ tự tạo profile với đúng UUID.
--
--   Trong môi trường dev (supabase start):
--   Có thể INSERT trực tiếp vào auth.users bằng service_role key,
--   sau đó chạy phần INSERT profiles bên dưới.
--   Các UUID trong seed này chỉ là ví dụ minh họa.
-- ============================================================

-- ============================================================
-- 1. Pipeline Stages (dữ liệu chuẩn – không thay đổi)
-- ============================================================

INSERT INTO pipeline_stages (id, name, display_name, sort_order, color, is_terminal, is_won)
VALUES
    ('00000001-0000-0000-0000-000000000001', 'new',         'Mới',          1, '#8B8375', FALSE, FALSE),
    ('00000001-0000-0000-0000-000000000002', 'consulting',  'Đang tư vấn',  2, '#C89A3D', FALSE, FALSE),
    ('00000001-0000-0000-0000-000000000003', 'quoted',      'Gửi báo giá',  3, '#D96C3F', FALSE, FALSE),
    ('00000001-0000-0000-0000-000000000004', 'negotiating', 'Đàm phán',     4, '#9B59B6', FALSE, FALSE),
    ('00000001-0000-0000-0000-000000000005', 'closed_won',  'Chốt đơn',     5, '#27AE60', TRUE,  TRUE),
    ('00000001-0000-0000-0000-000000000006', 'closed_lost', 'Thất bại',     6, '#E74C3C', TRUE,  FALSE);

-- ============================================================
-- 2. Lead Tags
-- ============================================================

INSERT INTO lead_tags (id, name, color)
VALUES
    ('00000002-0000-0000-0000-000000000001', 'Mua định kỳ',               '#27AE60'),
    ('00000002-0000-0000-0000-000000000002', 'Quà tặng doanh nghiệp',     '#C89A3D'),
    ('00000002-0000-0000-0000-000000000003', 'Đại lý tiềm năng',          '#3498DB'),
    ('00000002-0000-0000-0000-000000000004', 'VIP chăm sóc đặc biệt',     '#9B59B6'),
    ('00000002-0000-0000-0000-000000000005', 'Đang đàm phán hợp đồng',    '#D96C3F'),
    ('00000002-0000-0000-0000-000000000006', 'Cần follow-up',             '#E74C3C');

-- ============================================================
-- 3. Demo Profiles
-- Tự động tạo user trong auth.users trước để không vi phạm FK
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
    ('00000000-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'thang.admin@yensaovinhhung.vn', crypt('12345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nguyễn Văn Thắng"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'mai.truongnhom@yensaovinhhung.vn', crypt('12345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Trần Thị Mai"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'dat.sales@yensaovinhhung.vn', crypt('12345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lê Quang Đạt"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'hoa.sales@yensaovinhhung.vn', crypt('12345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Phạm Thị Hoa"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000003-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'khoa.ketoan@yensaovinhhung.vn', crypt('12345678', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vũ Minh Khoa"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role, phone, is_active)
VALUES
    -- Admin
    ('00000003-0000-0000-0000-000000000001',
     'thang.admin@yensaovinhhung.vn',
     'Nguyễn Văn Thắng',
     'admin', '0901234567', TRUE),

    -- Trưởng nhóm
    ('00000003-0000-0000-0000-000000000002',
     'mai.truongnhom@yensaovinhhung.vn',
     'Trần Thị Mai',
     'team_lead', '0907654321', TRUE),

    -- Sales 1
    ('00000003-0000-0000-0000-000000000003',
     'dat.sales@yensaovinhhung.vn',
     'Lê Quang Đạt',
     'sales', '0909876543', TRUE),

    -- Sales 2
    ('00000003-0000-0000-0000-000000000004',
     'hoa.sales@yensaovinhhung.vn',
     'Phạm Thị Hoa',
     'sales', '0912345678', TRUE),

    -- Kế toán
    ('00000003-0000-0000-0000-000000000005',
     'khoa.ketoan@yensaovinhhung.vn',
     'Vũ Minh Khoa',
     'accounting', '0918765432', TRUE)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name;

-- ============================================================
-- 4. Teams
-- ============================================================

INSERT INTO teams (id, name, description, created_by)
VALUES
    ('00000004-0000-0000-0000-000000000001',
     'Nhóm Bán Hàng Miền Nam',
     'Phụ trách khách hàng tại TP.HCM, Bình Dương, Đồng Nai',
     '00000003-0000-0000-0000-000000000001');

-- ============================================================
-- 5. Team Members
-- ============================================================

INSERT INTO team_members (team_id, user_id)
VALUES
    ('00000004-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000002'), -- Trưởng nhóm Mai
    ('00000004-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000003'), -- Sales Đạt
    ('00000004-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000004'); -- Sales Hoa

-- ============================================================
-- 6. Leads – 6 khách hàng tiềm năng (từ Design Brief)
-- ============================================================

INSERT INTO leads (
    id, full_name, company_name, phone_primary, email,
    address, region, segment, product_interests,
    notes, assigned_to, team_id, created_by
) VALUES

    -- 1. Nguyễn Thùy Linh – Đại lý Hương Việt
    ('00000005-0000-0000-0000-000000000001',
     'Nguyễn Thùy Linh',
     'Công ty TNHH Thực Phẩm Hương Việt',
     '0903111222', 'linh.huongviet@gmail.com',
     '45 Nguyễn Trãi, Quận 1, TP.HCM', 'TP.HCM',
     'agent',
     ARRAY['refined_nest','stewed_nest']::product_interest[],
     'Đại lý phân phối khu vực Q1–Q3. Hệ thống phân phối riêng. Ưu tiên sản phẩm đóng gói cao cấp.',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    -- 2. Trần Minh Quân – Đại lý An Phát
    ('00000005-0000-0000-0000-000000000002',
     'Trần Minh Quân',
     'Công ty Cổ phần TM & DV An Phát',
     '0907222333', 'quan.anphat@gmail.com',
     '128 Lê Văn Lương, Quận 7, TP.HCM', 'TP.HCM',
     'agent',
     ARRAY['raw_nest','refined_nest']::product_interest[],
     'Đại lý lớn, nhập số lượng cao. Cần ưu đãi giá sỉ. Đang so sánh với đối thủ cạnh tranh.',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    -- 3. Lê Bảo Anh – VIP cá nhân
    ('00000005-0000-0000-0000-000000000003',
     'Lê Bảo Anh',
     NULL,
     '0918333444', 'baoanh.vip@gmail.com',
     '25 Nguyễn Đình Chiểu, Quận 3, TP.HCM', 'TP.HCM',
     'vip',
     ARRAY['stewed_nest','refined_nest']::product_interest[],
     'Khách cá nhân VIP. Mua quà biếu đối tác. Rất chú trọng bao bì và dịch vụ cá nhân hóa.',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004'),

    -- 4. Phạm Ngọc Hưng – Đại lý Sài Gòn Event
    ('00000005-0000-0000-0000-000000000004',
     'Phạm Ngọc Hưng',
     'Công ty TNHH Du Lịch & Sự Kiện Sài Gòn Event',
     '0922444555', 'hung.sgoevent@gmail.com',
     '10 Tôn Đức Thắng, Quận 1, TP.HCM', 'TP.HCM',
     'agent',
     ARRAY['stewed_nest','refined_nest']::product_interest[],
     'Mua làm quà tặng doanh nghiệp theo mùa (Tết, 30/4, Giáng sinh). Cần combo quà tặng đẹp.',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004'),

    -- 5. Vũ Thu Trang – Đại lý An Nhiên Hà Nội
    ('00000005-0000-0000-0000-000000000005',
     'Vũ Thu Trang',
     'Chuỗi Cửa hàng Đặc sản Miền Trung An Nhiên',
     '0933555666', 'trang.annhien@gmail.com',
     '58 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', 'Hà Nội',
     'agent',
     ARRAY['raw_nest','stewed_nest']::product_interest[],
     'Đại lý tại Hà Nội, chuỗi 3 cửa hàng đặc sản. Quan tâm chứng nhận xuất xứ và chất lượng.',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    -- 6. Đặng Quốc Khánh – Khách lẻ định kỳ
    ('00000005-0000-0000-0000-000000000006',
     'Đặng Quốc Khánh',
     NULL,
     '0945666777', 'khanh.retail@gmail.com',
     '102 Bùi Thị Xuân, Quận Hai Bà Trưng, Hà Nội', 'Hà Nội',
     'retail',
     ARRAY['stewed_nest','refined_nest']::product_interest[],
     'Khách lẻ mua định kỳ hàng tháng cho gia đình và biếu tặng. Trung thành, ít nhạy cảm về giá.',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003');

-- ============================================================
-- 7. Opportunities – Cơ hội bán hàng trên Kanban
-- ============================================================

INSERT INTO opportunities (
    id, title, lead_id, stage_id,
    expected_value, expected_close_date,
    assigned_to, team_id, created_by
) VALUES

    ('00000006-0000-0000-0000-000000000001',
     'Hợp đồng đại lý phân phối Q1–Q3 – Hương Việt',
     '00000005-0000-0000-0000-000000000001',
     '00000001-0000-0000-0000-000000000002', -- Đang tư vấn
     280000000, '2026-06-30',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    ('00000006-0000-0000-0000-000000000002',
     'Đơn nhập sỉ Yến thô + Yến tinh chế – An Phát',
     '00000005-0000-0000-0000-000000000002',
     '00000001-0000-0000-0000-000000000003', -- Gửi báo giá
     450000000, '2026-05-31',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    ('00000006-0000-0000-0000-000000000003',
     'Bộ quà tặng Yến chưng cao cấp – Lê Bảo Anh',
     '00000005-0000-0000-0000-000000000003',
     '00000001-0000-0000-0000-000000000004', -- Đàm phán
     65000000, '2026-05-25',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004'),

    ('00000006-0000-0000-0000-000000000004',
     'Combo quà tặng doanh nghiệp Tết – Sài Gòn Event',
     '00000005-0000-0000-0000-000000000004',
     '00000001-0000-0000-0000-000000000003', -- Gửi báo giá
     320000000, '2026-06-15',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004'),

    ('00000006-0000-0000-0000-000000000005',
     'Hợp đồng cung cấp Yến thô chuỗi An Nhiên',
     '00000005-0000-0000-0000-000000000005',
     '00000001-0000-0000-0000-000000000001', -- Mới
     210000000, '2026-07-31',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003'),

    ('00000006-0000-0000-0000-000000000006',
     'Đơn hàng tháng 5 – Đặng Quốc Khánh',
     '00000005-0000-0000-0000-000000000006',
     '00000001-0000-0000-0000-000000000005', -- Chốt đơn
     35000000, '2026-05-15',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003');

-- Cập nhật closed_at cho cơ hội đã chốt
UPDATE opportunities
SET closed_at = '2026-05-12 10:00:00+07'
WHERE id = '00000006-0000-0000-0000-000000000006';

-- ============================================================
-- 8. Tasks – 5 công việc (từ Design Brief)
-- ============================================================

INSERT INTO tasks (
    id, title, description,
    lead_id, opportunity_id,
    assigned_to, team_id, created_by,
    status, priority, due_date
) VALUES

    ('00000007-0000-0000-0000-000000000001',
     'Gọi tư vấn gói đại lý Hương Việt',
     'Liên hệ chị Linh tư vấn gói đại lý Q1–Q3. Chuẩn bị tài liệu giới thiệu sản phẩm tinh chế và bảng giá sỉ.',
     '00000005-0000-0000-0000-000000000001',
     '00000006-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003',
     'todo', 'high', '2026-05-18 16:00:00+07'),

    ('00000007-0000-0000-0000-000000000002',
     'Gửi báo giá combo quà tặng cho Sài Gòn Event',
     'Báo giá 100 hộp quà tặng doanh nghiệp (Yến chưng + Yến tinh chế). Bao gồm bao bì in theo yêu cầu.',
     '00000005-0000-0000-0000-000000000004',
     '00000006-0000-0000-0000-000000000004',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004',
     'in_progress', 'high', '2026-05-19 11:00:00+07'),

    ('00000007-0000-0000-0000-000000000003',
     'Hẹn gặp thử sản phẩm tại cửa hàng An Nhiên',
     'Sắp xếp lịch gặp chị Trang. Mang mẫu thử Yến thô và Yến chưng, catalogue, chứng nhận chất lượng.',
     '00000005-0000-0000-0000-000000000005',
     '00000006-0000-0000-0000-000000000005',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003',
     'todo', 'medium', '2026-05-21 15:00:00+07'),

    ('00000007-0000-0000-0000-000000000004',
     'Gọi chăm sóc đơn lặp lại tháng 6 cho anh Khánh',
     'Nhắc xác nhận đơn tháng 6: Set tháng Yến chưng + bộ tinh chế. Hỏi thêm nhu cầu quà tặng.',
     '00000005-0000-0000-0000-000000000006',
     NULL,
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000003',
     'todo', 'medium', '2026-05-25 10:00:00+07'),

    ('00000007-0000-0000-0000-000000000005',
     'Gửi catalog mới và ưu đãi VIP cho chị Bảo Anh',
     'Gửi email + Zalo kèm PDF catalog mới và chương trình VIP Q2. Đề xuất bộ quà tặng giới hạn mùa hè.',
     '00000005-0000-0000-0000-000000000003',
     '00000006-0000-0000-0000-000000000003',
     '00000003-0000-0000-0000-000000000004',
     '00000004-0000-0000-0000-000000000001',
     '00000003-0000-0000-0000-000000000004',
     'todo', 'low', '2026-05-22 09:00:00+07');

-- ============================================================
-- 9. Lead Lists – 3 danh sách phân nhóm
-- ============================================================

INSERT INTO lead_lists (id, name, description, criteria, created_by, team_id)
VALUES
    ('00000008-0000-0000-0000-000000000001',
     'Đại lý chiến lược miền Nam',
     'Doanh nghiệp/chuỗi tại TP.HCM, Bình Dương, Đồng Nai. Giá trị dự kiến ≥ 200 triệu VND.',
     '{"segment":"agent","region":["TP.HCM","Bình Dương","Đồng Nai"],"min_expected_value":200000000}',
     '00000003-0000-0000-0000-000000000002',
     '00000004-0000-0000-0000-000000000001'),

    ('00000008-0000-0000-0000-000000000002',
     'Khách lẻ VIP quà biếu',
     'Khách lẻ VIP, đơn dự kiến ≥ 50 triệu/năm. Sản phẩm quan tâm chủ yếu là Yến chưng và bộ quà tặng.',
     '{"segment":"vip","product_interests":["stewed_nest"],"min_annual_value":50000000}',
     '00000003-0000-0000-0000-000000000002',
     '00000004-0000-0000-0000-000000000001'),

    ('00000008-0000-0000-0000-000000000003',
     'Đại lý mới 90 ngày gần đây',
     'Khách mới phân khúc Đại lý trong 90 ngày, chưa có thanh toán hoặc đang đàm phán.',
     '{"segment":"agent","days_since_created":90,"stages":["new","consulting","quoted","negotiating"]}',
     '00000003-0000-0000-0000-000000000002',
     '00000004-0000-0000-0000-000000000001');

-- Gán thành viên vào danh sách
INSERT INTO lead_list_members (list_id, lead_id, added_by)
VALUES
    -- Đại lý chiến lược miền Nam
    ('00000008-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000002'),
    ('00000008-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000002'),
    ('00000008-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000004', '00000003-0000-0000-0000-000000000002'),

    -- Khách lẻ VIP quà biếu
    ('00000008-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000003', '00000003-0000-0000-0000-000000000002'),

    -- Đại lý mới 90 ngày
    ('00000008-0000-0000-0000-000000000003', '00000005-0000-0000-0000-000000000005', '00000003-0000-0000-0000-000000000002');

-- ============================================================
-- 10. Tag Assignments
-- ============================================================

INSERT INTO lead_tag_assignments (lead_id, tag_id)
VALUES
    -- Hương Việt: Đại lý tiềm năng + Đang đàm phán
    ('00000005-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000003'),
    ('00000005-0000-0000-0000-000000000001', '00000002-0000-0000-0000-000000000005'),

    -- An Phát: Đại lý tiềm năng + Đang đàm phán
    ('00000005-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000003'),
    ('00000005-0000-0000-0000-000000000002', '00000002-0000-0000-0000-000000000005'),

    -- Lê Bảo Anh: VIP chăm sóc đặc biệt + Quà tặng doanh nghiệp
    ('00000005-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000004'),
    ('00000005-0000-0000-0000-000000000003', '00000002-0000-0000-0000-000000000002'),

    -- Sài Gòn Event: Quà tặng doanh nghiệp
    ('00000005-0000-0000-0000-000000000004', '00000002-0000-0000-0000-000000000002'),

    -- An Nhiên: Đại lý tiềm năng
    ('00000005-0000-0000-0000-000000000005', '00000002-0000-0000-0000-000000000003'),

    -- Đặng Quốc Khánh: Mua định kỳ
    ('00000005-0000-0000-0000-000000000006', '00000002-0000-0000-0000-000000000001');

-- ============================================================
-- 11. Subscriptions – Thanh toán mẫu (đơn đã chốt của anh Khánh)
-- ============================================================

INSERT INTO subscriptions (
    id, lead_id, opportunity_id,
    amount, payment_status, payment_method, payment_date,
    notes, recorded_by, team_id
) VALUES
    ('00000009-0000-0000-0000-000000000001',
     '00000005-0000-0000-0000-000000000006',
     '00000006-0000-0000-0000-000000000006',
     35000000, 'paid', 'bank_transfer', '2026-05-12',
     'Chuyển khoản VCB. Đơn tháng 5/2026. Xác nhận 12/05.',
     '00000003-0000-0000-0000-000000000003',
     '00000004-0000-0000-0000-000000000001');
