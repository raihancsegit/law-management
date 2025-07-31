import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/lead-dashboard/Sidebar'; // আমরা এটি তৈরি করব
import Header from '@/components/lead-dashboard/Header'; // আমরা এটি তৈরি করব

export default async function LeadDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url, role')
    .eq('id', session.user.id)
    .single();

  if (!profile || (profile.role !== 'lead' && profile.role !== 'client')) {
    return redirect('/unauthorized');
  }

  const user = {
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    avatar_url: profile.avatar_url,
    role_display: profile.role === 'lead' ? 'Prospective Client' : 'Client',
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* বাম পাশের সাইডবার */}
      <Sidebar user={user} />
      
      {/* ডান পাশের মূল কন্টেন্ট */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* উপরের হেডার */}
        <Header user={user} />
        
        {/* children এখানে main কন্টেন্ট রেন্ডার করবে (যেমন dashboard, consultation পেজ) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}