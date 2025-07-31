// ফাইল: src/app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// এই রুটটি যেন সবসময় ডাইনামিকভাবে চলে এবং ক্যাশ না হয়
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // যদি URL-এ ভেরিফিকেশন কোড থাকে
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // কোডটি ব্যবহার করে একটি সেশন তৈরি করা হচ্ছে
    // exchangeCodeForSession সফল হলে ব্যবহারকারীর সেশন কুকিতে সেভ হয়ে যাবে
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('Auth callback error:', error.message);
        // কোনো সমস্যা হলে ব্যবহারকারীকে একটি এরর পেজে বা লগইন পেজে পাঠানো যেতে পারে
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could_not_authenticate_user`);
    }

    // যদি সেশন সফলভাবে তৈরি হয়, তাহলে ব্যবহারকারীর ভূমিকা চেক করতে হবে
    if (session) {
      // ডাটাবেস থেকে ব্যবহারকারীর প্রোফাইল আনা হচ্ছে
      const { data: profile } = await supabase
        .from('profiles')
        .select('role') // শুধুমাত্র 'role' কলামটি প্রয়োজন
        .eq('id', session.user.id)
        .single();

      // ভূমিকা অনুযায়ী সঠিক পেজে রিডাইরেক্ট করা হচ্ছে
      switch (profile?.role) {
        case 'admin':
        case 'attorney':
          // অ্যাডমিন বা অ্যাটর্নি হলে অ্যাডমিন ড্যাশবোর্ডে পাঠানো হবে
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        case 'lead':
        case 'client':
          // নতুন সাইন-আপ করা 'lead' বা বিদ্যমান 'client' হলে লিড/ক্লায়েন্ট ড্যাশবোর্ডে পাঠানো হবে
          return NextResponse.redirect(`${requestUrl.origin}/lead-dashboard`);
        default:
          // যদি কোনো কারণে প্রোফাইল বা ভূমিকা না পাওয়া যায়, একটি নিরাপদ ডিফল্ট পেজে পাঠানো হবে
          return NextResponse.redirect(`${requestUrl.origin}/unauthorized`);
      }
    }
  }

  // যদি URL-এ কোনো কোড না থাকে, তাহলে ব্যবহারকারীকে হোমপেজে বা লগইন পেজে পাঠানো হবে
  console.log('No auth code found in URL, redirecting to login.');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}