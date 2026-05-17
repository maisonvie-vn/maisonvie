// scripts/test-db.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
  console.log('🔍 Kiểm tra bảng profiles...');
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (pError) {
    console.error('❌ Lỗi profiles:', pError);
  } else {
    console.log('✅ Bảng profiles tồn tại! Kết quả:', profiles);
  }

  console.log('🔍 Kiểm tra bảng organizations...');
  const { data: orgs, error: oError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);

  if (oError) {
    console.error('❌ Lỗi organizations:', oError);
  } else {
    console.log('✅ Bảng organizations tồn tại! Kết quả:', orgs);
  }
}

test();
