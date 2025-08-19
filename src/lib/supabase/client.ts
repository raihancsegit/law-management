import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// ক্লায়েন্টের একটি সিঙ্গলটন (singleton) ইনস্ট্যান্স রাখা হবে
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | undefined;

function getSupabaseBrowserClient() {
  // যদি ক্লায়েন্ট আগে থেকেই তৈরি করা থাকে, সেটিকেই রিটার্ন করা হবে
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // ক্লায়েন্টটি শুধুমাত্র প্রথমবার কল হওয়ার সময়ই তৈরি হবে
  supabaseClient = createClientComponentClient<Database>();
  
  return supabaseClient;
}

export default getSupabaseBrowserClient;