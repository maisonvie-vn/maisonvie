// File: scripts/bootstrap-admin.ts
// Chạy bằng: npx tsx scripts/bootstrap-admin.ts
// Yêu cầu env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import * as readline from 'readline/promises';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generatePassword(): string {
  // 16 ký tự, đảm bảo có đủ 4 nhóm
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digit = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digit + special;
  
  let pwd = '';
  pwd += upper[randomBytes(1)[0] % upper.length];
  pwd += lower[randomBytes(1)[0] % lower.length];
  pwd += digit[randomBytes(1)[0] % digit.length];
  pwd += special[randomBytes(1)[0] % special.length];
  for (let i = 0; i < 12; i++) {
    pwd += all[randomBytes(1)[0] % all.length];
  }
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

async function main() {
  console.log('\n🔐 BOOTSTRAP ADMIN — CRM YẾN SÀO VĨNH HƯNG\n');

  let email = process.env.ADMIN_EMAIL;
  let fullName = process.env.ADMIN_NAME;
  let bypassPrompt = false;

  if (email && fullName) {
    bypassPrompt = true;
    console.log(`🤖 Chạy chế độ không tương tác (Headless mode)...`);
  }

  if (!bypassPrompt) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    email = (await rl.question('Email admin (mặc định: admin@yensaovinhhung.vn): ')) 
      || 'admin@yensaovinhhung.vn';
    fullName = (await rl.question('Họ tên (mặc định: Quản Trị Hệ Thống): ')) 
      || 'Quản Trị Hệ Thống Vĩnh Hưng';
    const confirm = await rl.question(`\n⚠️  Xác nhận tạo admin "${email}"? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Hủy bỏ.');
      rl.close();
      process.exit(0);
    }
    rl.close();
  } else {
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Họ tên: ${fullName}`);
  }
  
  // 1. Kiểm tra email đã tồn tại
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();
  
  if (existing) {
    console.log(`\n⚠️  Email ${email} đã tồn tại (role: ${existing.role}).`);
    if (existing.role !== 'admin') {
      console.log(`🔄 Tiến hành nâng cấp tài khoản này thành admin...`);
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', is_active: true } as any)
        .eq('id', existing.id);
      if (error) throw error;
      console.log(`✅ Đã nâng cấp ${email} thành admin thành công!`);
    } else {
      console.log(`ℹ️  Tài khoản đã là Admin gốc của hệ thống.`);
    }
    return;
  }
  
  // 2. Tạo organization gốc nếu bảng organizations tồn tại trong database
  let orgId: string | null = null;
  const { error: orgCheckError } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  const hasOrganizationsTable = !orgCheckError || (orgCheckError.code !== 'PGRST205');

  if (hasOrganizationsTable) {
    console.log('🏢 Phát hiện bảng organizations. Tiến hành tạo tổ chức gốc...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({ 
        name: 'Công ty Yến Sào Vĩnh Hưng',
        slug: 'vinh-hung-root'
      } as any, { onConflict: 'slug' })
      .select()
      .single();
    if (orgError) throw orgError;
    orgId = org.id;
  } else {
    console.log('ℹ️  Bảng organizations không tồn tại trong DB hiện tại. Bỏ qua bước liên kết tổ chức.');
  }
  
  // 3. Sinh password an toàn
  const password = generatePassword();
  
  // 4. Tạo auth user qua Admin API (bỏ qua email confirmation)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email!,
    password,
    email_confirm: true,  // confirm sẵn
    user_metadata: { full_name: fullName },
    app_metadata: { 
      role: 'admin',
      ...(orgId ? { organization_id: orgId } : {})
    }
  });
  if (authError) {
    throw authError;
  }
  
  if (!authUser?.user) {
    throw new Error('Không nhận được thông tin User sau khi tạo tài khoản auth');
  }
  
  // 5. Cập nhật profiles row (Trigger handle_new_user sẽ tạo profiles row tự động, chúng ta update nó)
  const profileUpdatePayload: any = {
    role: 'admin',
    full_name: fullName,
    is_active: true,
    must_change_password: true  // ép đổi password lần đầu
  };

  if (orgId) {
    profileUpdatePayload.organization_id = orgId;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdatePayload)
    .eq('id', authUser.user.id);
  if (profileError) throw profileError;
  
  // 6. Ghi audit log
  await (supabase.from('activity_logs') as any).insert({
    user_id: authUser.user.id,
    action: 'admin_bootstrap',
    entity_name: 'profile',
    entity_id: authUser.user.id,
    new_data: { email, created_via: 'bootstrap_script' }
  });
  
  // 7. In thông tin (CHỈ HIỂN THỊ 1 LẦN)
  console.log('\n' + '='.repeat(60));
  console.log('✅ TẠO ADMIN THÀNH CÔNG');
  console.log('='.repeat(60));
  console.log(`📧 Email:       ${email}`);
  console.log(`🔑 Password:    ${password}`);
  console.log(`👤 Họ tên:      ${fullName}`);
  if (orgId) {
    console.log(`🏢 Org ID:      ${orgId}`);
  }
  console.log(`🆔 User ID:     ${authUser.user.id}`);
  console.log('='.repeat(60));
  console.log('⚠️  LƯU LẠI MẬT KHẨU NGAY — KHÔNG HIỂN THỊ LẠI');
  console.log('⚠️  Đăng nhập lần đầu sẽ buộc đổi mật khẩu và setup MFA');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
