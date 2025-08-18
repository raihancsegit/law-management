import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/lead-dashboard/Sidebar';
import Header from '@/components/lead-dashboard/Header';

// এই লাইনটি Next.js-কে এই রুটের ডেটা ক্যাশ না করতে বলে
export const revalidate = 0;

export default async function LeadDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();

  // Supabase ক্লায়েন্ট তৈরি করার সময় ক্যাশিং নিষ্ক্রিয় করার অপশন যোগ করা হয়েছে
  // এটি নিশ্চিত করে যে ডাটাবেস থেকে সবসময় লেটেস্ট ডেটা আসবে
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  }, {
    // এই অপশনটি Supabase ক্লায়েন্টের fetch অনুরোধের জন্য ক্যাশিং বন্ধ করে দেয়
    options: {
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            cache: 'no-store', // ক্যাশিং নিষ্ক্রিয় করার মূল লাইন
          });
        },
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  // এখন এই কোয়েরিটি আর ক্যাশড ডেটা ব্যবহার করবে না
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url, role, is_approved, is_verified')
    .eq('id', session.user.id)
    .single();
    
  if (!profile) {
    // যদি ডাটাবেসে প্রোফাইল না থাকে, লগইন পেজে পাঠাও
    return redirect('/login?error=profile_not_found');
  }

  if (!profile.is_approved || !profile.is_verified) {
    return redirect('/login?error=account_access_revoked');
  }
  
  // ভূমিকা অনুযায়ী পেজ অ্যাক্সেস নিয়ন্ত্রণ
  if (profile.role !== 'lead' && profile.role !== 'client') {
    return redirect('/unauthorized');
  }

  const user = {
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    avatar_url: profile.avatar_url,
    role: profile.role, // Sidebar-এর জন্য role পাস করা হচ্ছে
    role_display: profile.role === 'lead' ? 'Prospective Client' : 'Client',
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* user অবজেক্টটি এখন role সহ Sidebar-এ পাস করা হচ্ছে */}
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}