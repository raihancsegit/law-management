'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react'; // useState ইম্পোর্ট করা হয়েছে
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js'; // টাইপ ইম্পোর্ট করা হয়েছে

export default function ClientLoginPage() {
  const router = useRouter();

  // supabase ক্লায়েন্টটিকে state-এ রাখা হচ্ছে, প্রাথমিক মান null
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // createClientComponentClient শুধুমাত্র useEffect-এর ভেতরে কল করা হচ্ছে,
    // যা নিশ্চিত করে এটি শুধু ব্রাউজারে রান হবে, বিল্ড টাইমে নয়।
    const supabaseClient = createClientComponentClient();
    setSupabase(supabaseClient);

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // ক্লায়েন্ট/লিডদের জন্য lead-dashboard-এ পাঠানো হচ্ছে
        router.push('/lead-dashboard');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // supabase লোড না হওয়া পর্যন্ত একটি লোডিং স্টেট দেখানো হচ্ছে
  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
            Loading Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-container flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Client Portal Login</h2>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="sign_in"
          showLinks={true}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                // সাইন-আপ লিঙ্ক লুকিয়ে ফেলার জন্য
                social_provider_text: ' ', 
              },
            },
          }}

        />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/start-application" className="font-medium text-law-blue hover:text-blue-700">
              Start Your Application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}