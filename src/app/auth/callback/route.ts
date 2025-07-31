// ফাইল: src/app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('Auth callback error:', error.message);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could_not_authenticate_user`);
    }

    if (session) {
      // ===================================================================
      // == সঠিক স্থানটি এখানে ==
      // ===================================================================
      // যেহেতু সেশন সফলভাবে তৈরি হয়েছে, তার মানে ইমেইল ভেরিফাইড।
      // এখন profiles টেবিলে is_verified স্ট্যাটাসটি আপডেট করতে হবে।
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_verified: true }) // is_verified-কে true করা হচ্ছে
        .eq('id', session.user.id);

      if (updateError) {
        // যদি প্রোফাইল আপডেট করতে কোনো সমস্যা হয়, আমরা সেটি লগ করব।
        // কিন্তু ব্যবহারকারীকে আটকাবো না, তাকে ড্যাশবোর্ডে যেতে দেব।
        console.error('Error updating profile verification status:', updateError.message);
      }
      // ===================================================================
      // == আপডেট করার কোড শেষ ==
      // ===================================================================

      // এখন ব্যবহারকারীর ভূমিকা চেক করে রিডাইরেক্ট করা হবে
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      switch (profile?.role) {
        case 'admin':
        case 'attorney':
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        case 'lead':
        case 'client':
          return NextResponse.redirect(`${requestUrl.origin}/lead-dashboard`);
        default:
          // যদি প্রোফাইল খুঁজে না পাওয়া যায়, যা প্রায় অসম্ভব কারণ ট্রিগার প্রোফাইল তৈরি করে দেয়।
          // তবুও একটি ফলব্যাক হিসেবে রাখা ভালো।
          return NextResponse.redirect(`${requestUrl.origin}/unauthorized`);
      }
    }
  }

  console.log('No auth code found in URL, redirecting to login.');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}