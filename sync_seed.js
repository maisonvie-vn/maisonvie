const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbnkzicuplsuxxgbtgku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmt6aWN1cGxzdXh4Z2J0Z2t1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk0NDM4NCwiZXhwIjoyMDk0NTIwMzg0fQ.fpfJLS6sG19-8zDRbqkyAv4ZksYIu3tUJX1CyVgnNcY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncData() {
    console.log('Starting data sync...');
    
    // 1. Create Users
    const mockUsers = [
        { id: '00000003-0000-0000-0000-000000000001', email: 'thang.admin@yensaovinhhung.vn', password: 'password123', full_name: 'Nguyễn Văn Thắng', role: 'admin', phone: '0901234567' },
        { id: '00000003-0000-0000-0000-000000000002', email: 'mai.truongnhom@yensaovinhhung.vn', password: 'password123', full_name: 'Trần Thị Mai', role: 'team_lead', phone: '0907654321' },
        { id: '00000003-0000-0000-0000-000000000003', email: 'dat.sales@yensaovinhhung.vn', password: 'password123', full_name: 'Lê Quang Đạt', role: 'sales', phone: '0909876543' },
        { id: '00000003-0000-0000-0000-000000000004', email: 'hoa.sales@yensaovinhhung.vn', password: 'password123', full_name: 'Phạm Thị Hoa', role: 'sales', phone: '0912345678' },
        { id: '00000003-0000-0000-0000-000000000005', email: 'khoa.ketoan@yensaovinhhung.vn', password: 'password123', full_name: 'Vũ Minh Khoa', role: 'accounting', phone: '0918765432' }
    ];

    let idMap = {};
    for (let u of mockUsers) {
        // Create auth user
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.full_name, role: u.role }
        });
        
        if (error) {
            console.error(`Error creating user ${u.email}:`, error);
            // If already exists, we can try to fetch it or skip
            continue;
        } else {
            console.log(`Created user ${u.email} with real ID: ${data.user.id}`);
            idMap[u.id] = data.user.id;
            
            // Allow time for the handle_new_user trigger to create the profile
            await new Promise(r => setTimeout(r, 1000));
            
            // Update profile with correct role and phone
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: u.role, phone: u.phone })
                .eq('id', data.user.id);
            
            if (profileError) console.error(`Error updating profile for ${u.email}:`, profileError);
        }
    }

    if (Object.keys(idMap).length === 0) {
        console.log("Could not create users. Please delete existing test users from Supabase Auth Dashboard first to re-sync.");
        return;
    }

    // Replace helper
    const rId = (mockId) => idMap[mockId] || mockId;

    // 2. Teams
    const teams = [
        { id: '00000004-0000-0000-0000-000000000001', name: 'Nhóm Bán Hàng Miền Nam', description: 'Phụ trách khách hàng tại TP.HCM, Bình Dương, Đồng Nai', created_by: rId('00000003-0000-0000-0000-000000000001') }
    ];
    for (let t of teams) await supabase.from('teams').upsert(t);
    console.log("Teams seeded");

    // 3. Team Members
    const teamMembers = [
        { team_id: '00000004-0000-0000-0000-000000000001', user_id: rId('00000003-0000-0000-0000-000000000002') },
        { team_id: '00000004-0000-0000-0000-000000000001', user_id: rId('00000003-0000-0000-0000-000000000003') },
        { team_id: '00000004-0000-0000-0000-000000000001', user_id: rId('00000003-0000-0000-0000-000000000004') }
    ];
    for (let tm of teamMembers) await supabase.from('team_members').upsert(tm, { onConflict: 'team_id,user_id' });
    console.log("Team members seeded");

    // 4. Leads
    const leads = [
        { id: '00000005-0000-0000-0000-000000000001', full_name: 'Nguyễn Thùy Linh', company_name: 'Công ty TNHH Thực Phẩm Hương Việt', phone_primary: '0903111222', email: 'linh.huongviet@gmail.com', address: '45 Nguyễn Trãi, Quận 1, TP.HCM', region: 'TP.HCM', segment: 'agent', product_interests: ['refined_nest','stewed_nest'], notes: 'Đại lý phân phối khu vực Q1–Q3.', assigned_to: rId('00000003-0000-0000-0000-000000000003'), team_id: '00000004-0000-0000-0000-000000000001', created_by: rId('00000003-0000-0000-0000-000000000003') },
        { id: '00000005-0000-0000-0000-000000000002', full_name: 'Trần Minh Quân', company_name: 'Công ty Cổ phần TM & DV An Phát', phone_primary: '0907222333', email: 'quan.anphat@gmail.com', address: '128 Lê Văn Lương, Quận 7, TP.HCM', region: 'TP.HCM', segment: 'agent', product_interests: ['raw_nest','refined_nest'], notes: 'Đại lý lớn, nhập số lượng cao.', assigned_to: rId('00000003-0000-0000-0000-000000000003'), team_id: '00000004-0000-0000-0000-000000000001', created_by: rId('00000003-0000-0000-0000-000000000003') },
        { id: '00000005-0000-0000-0000-000000000003', full_name: 'Lê Bảo Anh', company_name: null, phone_primary: '0918333444', email: 'baoanh.vip@gmail.com', address: '25 Nguyễn Đình Chiểu, Quận 3, TP.HCM', region: 'TP.HCM', segment: 'vip', product_interests: ['stewed_nest','refined_nest'], notes: 'Khách cá nhân VIP.', assigned_to: rId('00000003-0000-0000-0000-000000000004'), team_id: '00000004-0000-0000-0000-000000000001', created_by: rId('00000003-0000-0000-0000-000000000004') }
    ];
    for (let l of leads) await supabase.from('leads').upsert(l);
    console.log("Leads seeded");

    // 5. Opportunities
    const opps = [
        { id: '00000006-0000-0000-0000-000000000001', title: 'Hợp đồng đại lý phân phối Q1–Q3 – Hương Việt', lead_id: '00000005-0000-0000-0000-000000000001', stage_id: '00000001-0000-0000-0000-000000000002', expected_value: 280000000, expected_close_date: '2026-06-30', assigned_to: rId('00000003-0000-0000-0000-000000000003'), team_id: '00000004-0000-0000-0000-000000000001', created_by: rId('00000003-0000-0000-0000-000000000003') },
        { id: '00000006-0000-0000-0000-000000000002', title: 'Đơn nhập sỉ Yến thô + Yến tinh chế – An Phát', lead_id: '00000005-0000-0000-0000-000000000002', stage_id: '00000001-0000-0000-0000-000000000003', expected_value: 450000000, expected_close_date: '2026-05-31', assigned_to: rId('00000003-0000-0000-0000-000000000003'), team_id: '00000004-0000-0000-0000-000000000001', created_by: rId('00000003-0000-0000-0000-000000000003') }
    ];
    for (let o of opps) await supabase.from('opportunities').upsert(o);
    console.log("Opportunities seeded");

    // 6. Pipeline Stages
    const stages = [
        { id: '00000001-0000-0000-0000-000000000001', name: 'new', display_name: 'Mới', sort_order: 1, color: '#8B8375', is_terminal: false, is_won: false },
        { id: '00000001-0000-0000-0000-000000000002', name: 'consulting', display_name: 'Đang tư vấn', sort_order: 2, color: '#C89A3D', is_terminal: false, is_won: false },
        { id: '00000001-0000-0000-0000-000000000003', name: 'quoted', display_name: 'Gửi báo giá', sort_order: 3, color: '#D96C3F', is_terminal: false, is_won: false },
        { id: '00000001-0000-0000-0000-000000000004', name: 'negotiating', display_name: 'Đàm phán', sort_order: 4, color: '#9B59B6', is_terminal: false, is_won: false },
        { id: '00000001-0000-0000-0000-000000000005', name: 'closed_won', display_name: 'Chốt đơn', sort_order: 5, color: '#27AE60', is_terminal: true, is_won: true },
        { id: '00000001-0000-0000-0000-000000000006', name: 'closed_lost', display_name: 'Thất bại', sort_order: 6, color: '#E74C3C', is_terminal: true, is_won: false }
    ];
    for (let s of stages) await supabase.from('pipeline_stages').upsert(s);
    console.log("Stages seeded");

    console.log("Seed sync complete!");
}

syncData();
