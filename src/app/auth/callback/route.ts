// ফাইল: src/app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// এই ফাংশনটি কখনও ক্যাশ করা হবে না, প্রতিবার নতুন করে চলবে
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') // URL থেকে 'code' প্যারামিটারটি নেওয়া হচ্ছে

  if (code) {
    const cookieStore = cookies()
    // একটি সার্ভার-সাইড ক্লায়েন্ট তৈরি করা হচ্ছে যা কুকি ম্যানেজ করতে পারে
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // পাওয়া 'code' টি দিয়ে একটি সেশন তৈরি করা হচ্ছে
    await supabase.auth.exchangeCodeForSession(code)
  }

  // সেশন তৈরি সফল হলে ব্যবহারকারীকে ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে
  // requestUrl.origin ব্যবহার করলে এটি যেকোনো ডোমেইনে (localhost, production) কাজ করবে
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}