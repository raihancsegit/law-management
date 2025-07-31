'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function handleLeadRegistration(formData: FormData) {
  const cookieStore = cookies();
  // সার্ভার অ্যাকশনের জন্য createServerActionClient ব্যবহার করা সবচেয়ে ভালো অভ্যাস
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ফর্ম থেকে ডেটা এক্সট্রাক্ট করা
  const firstName = formData.get('first_name')?.toString();
  const lastName = formData.get('last_name')?.toString();
  const email = formData.get('email_address')?.toString();
  const password = formData.get('password')?.toString();

  // বেসিক ভ্যালিডেশন
  if (!email || !password || !firstName || !lastName) {
    // এখানে একটি অবজেক্ট রিটার্ন করলে ক্লায়েন্ট সাইডে এরর হ্যান্ডেল করা সহজ হয়।
    // আপাতত আমরা রিডাইরেক্ট করছি।
    return redirect('/start-application?error=All_fields_are_required');
  }

  // NEXT_PUBLIC_BASE_URL ভেরিয়েবলটি .env.local থেকে আসবে
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      // এখানে সরাসরি URL দিতে হবে
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return redirect(`/start-application?error=${encodeURIComponent(error.message)}`);
  }
  
  // সফল হলে, ব্যবহারকারীকে একটি "Check your email" পেজে পাঠানো হবে
  return redirect('/check-email');
}

// export async function handleSignOut() {
//   const cookieStore = cookies();
//   const supabase = createServerActionClient({ cookies: () => cookieStore });
//   await supabase.auth.signOut();
//   return redirect('/login');
// }

export async function handleSignOut(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ফর্ম থেকে redirectTo পাথের মান নেওয়া হচ্ছে
  const redirectTo = formData.get('redirectTo')?.toString() || '/login';

  await supabase.auth.signOut();
  
  // ডাইনামিক পাথে রিডাইরেক্ট করা হচ্ছে
  return redirect(redirectTo);
}