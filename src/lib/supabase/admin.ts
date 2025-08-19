import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | undefined;

export const getSupabaseAdmin = () => {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  // createClient শুধুমাত্র তখনই কল হবে যখন getSupabaseAdmin প্রথমবার কল করা হবে।
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  
  return supabaseAdmin;
};