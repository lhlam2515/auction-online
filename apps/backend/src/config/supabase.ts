import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("❌ Missing Supabase environment variables in .env file");
}

const clientOptions: SupabaseClientOptions<"public"> = {
  auth: {
    flowType: "pkce",
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

/**
 * 1. SUPABASE CLIENT (ANON KEY)
 * - Dùng để: Verify JWT token từ client, query dữ liệu tuân thủ RLS.
 * - An toàn để sử dụng cho các logic thông thường.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  clientOptions
);

/**
 * 2. SUPABASE ADMIN (SERVICE ROLE KEY)
 * - Dùng để: Quản lý User (xóa/ban), Bypass RLS (truy cập mọi dữ liệu).
 * - CẢNH BÁO: Cực kỳ cẩn trọng, không bao giờ expose key này xuống client.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  clientOptions
);
