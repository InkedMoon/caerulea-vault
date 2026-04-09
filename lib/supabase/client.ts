import { createClient } from "@supabase/supabase-js";

// 这里统一读取前端可用的 Supabase 环境变量。
// 之后不管是编辑页、上传页还是标签筛选，只要在浏览器里请求 Supabase，都从这里拿客户端。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables in .env.local");
}

// 先导出一个浏览器端可复用的客户端实例。
// 现在我们还没接认证和数据库表，所以先保留最基础的写法。
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
