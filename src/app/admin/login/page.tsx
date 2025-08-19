'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // সরাসরি ইম্পোর্ট
import { useEffect, useState } from 'react'; // useState ইম্পোর্ট করা হয়েছে
import { useRouter } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js'; // টাইপ ইম্পোর্ট

export default function AdminLoginPage() {
  const router = useRouter();

  // supabase ক্লায়েন্টটিকে state-এ রাখা হচ্ছে
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // createClientComponentClient শুধুমাত্র ক্লায়েন্ট-সাইডে কল করা হচ্ছে
    const supabaseClient = createClientComponentClient();
    setSupabase(supabaseClient);

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // অ্যাডমিন/অ্যাটর্নিদের জন্য ড্যাশবোর্ডে পাঠানো হচ্ছে
        router.push('/dashboard');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // supabase লোড না হওয়া পর্যন্ত একটি লোডিং স্টেট দেখানো
  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
            Loading Admin Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Admin & Staff Portal</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light" // 'light' থিম সেট করা
          view="sign_in"
          showLinks={true} // "Forgot password?" দেখানোর জন্য
          providers={[]} // সোশ্যাল প্রোভাইডার দেখানো হবে না
        />
      </div>
    </div>
  );
}