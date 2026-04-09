import "server-only";

import { createClient } from "@supabase/supabase-js";

// 这个文件给 Server Component、Route Handler 之类的服务端代码使用。
// 目前仍然先使用公开 key 读数据；后面如果接登录和权限，再往这里补 cookies / auth 逻辑。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables in .env.local");
}

// 经过上面的守卫后，这两个值在运行时一定存在。
// 这里单独收成常量，是为了让 TypeScript 在构建时也明确知道它们是 string。
const verifiedSupabaseUrl = supabaseUrl;
const verifiedSupabaseAnonKey = supabaseAnonKey;

export function createSupabaseServerClient() {
  return createClient(verifiedSupabaseUrl, verifiedSupabaseAnonKey);
}

// 这个是服务端高权限客户端。
// 后面做保存、新增、删除时都走它，这样浏览器不会直接接触 secret key。
export function createSupabaseAdminClient() {
  if (!supabaseSecretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY in .env.local");
  }

  return createClient(verifiedSupabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
