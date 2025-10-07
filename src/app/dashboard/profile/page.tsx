// app/dashboard/profile/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const revalidate = 0;

export default async function AdminProfilePage() {
  const supabase = createServerComponentClient({ cookies });

  // === মূল পরিবর্তন এখানে ===
  // getSession() এর পরিবর্তে getUser() ব্যবহার করে সম্পূর্ণ user object আনা হচ্ছে
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // যদি কোনো user না থাকে, তাহলে লগইন পেজে পাঠিয়ে দেওয়া হবে
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Profile fetch error:', error);
    return <div className="p-6 text-red-500">Could not load admin profile data.</div>;
  }

  // user object থেকে ডেটা নিয়ে initialProfile তৈরি করা হচ্ছে
  const initialProfile = {
    ...profile,
    email: user.email,
    account_created_at: user.created_at, // এখন এখানে সঠিক ডেটা আসবে
    last_sign_in_at: user.last_sign_in_at, // এখানেও সঠিক ডেটা আসবে
    is_verified: !!user.email_confirmed_at,
  };
  
  return (
    <div className="p-6">
      <ProfileClient initialProfile={initialProfile} />
    </div>
  );
}