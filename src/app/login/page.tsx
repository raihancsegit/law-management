// src/app/login/page.tsx
'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientLoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // === পরিবর্তন: লগইন সফল হওয়ার পর প্রোফাইল চেক ===
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved, is_verified') // is_approved এবং is_verified চেক করা হচ্ছে
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          await supabase.auth.signOut(); // সেশন ধ্বংস করে দেওয়া হচ্ছে
          router.push('/login?error=profile_not_found');
          return;
        }

        // যদি ভেরিফাইড বা অ্যাপ্রুভড না হয়, তাহলে সাইন-আউট করে দেওয়া
        if (!profile.is_approved || !profile.is_verified) {
          await supabase.auth.signOut();
          const reason = !profile.is_approved ? 'account_deactivated' : 'account_not_verified';
          router.push(`/login?error=${reason}`);
        } else {
          // সবকিছু ঠিক থাকলে ড্যাশবোর্ডে পাঠানো
          router.push('/lead-dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Client Portal Login</h2>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="sign_in"
          showLinks={true} // "Forgot password?" লিঙ্ক দেখানোর জন্য
          providers={[]}
          
          // ========================================================
          // == এই অংশটি যোগ করা হয়েছে ==
          // ========================================================
          localization={{
            variables: {
              sign_in: {
                // "Don't have an account?" টেক্সট পরিবর্তন বা লুকানোর জন্য
                // আমরা এখানে একটি খালি স্পেস দিচ্ছি, যা এটিকে কার্যকরভাবে লুকিয়ে ফেলবে
                social_provider_text: ' ', 
              },
              // যদি আপনি "Sign up" টেক্সটটিও পুরোপুরি সরাতে চান (যদিও view="sign_in" এটি লুকানোর কথা)
              sign_up: {
                link_text: '', // এটি অপ্রয়োজনীয় হতে পারে, কিন্তু নিশ্চিত করার জন্য যোগ করা হলো
              }
            },
          }}
          // ========================================================
        />
        <div className="text-center">
          <p className="text-sm text-gray-600">
           {'Don\'t have an account? '}{' '}
            <Link href="/start-application" className="font-medium text-law-blue hover:text-blue-700">
              Start Your Application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}