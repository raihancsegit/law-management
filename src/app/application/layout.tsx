import ApplicationHeader from '@/components/application/ApplicationHeader';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  // যদি লগইন করা না থাকে বা রোল 'lead' না হয়
  if (!session) {
    return redirect('/login');
  }

  // প্রোফাইল থেকে ইউজার ডেটা আনা হচ্ছে
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url, role')
    .eq('id', session.user.id)
    .single();
  
  if (!profile || profile.role !== 'lead') {
      return redirect('/unauthorized');
  }

  const user = {
      name: `${profile.first_name} ${profile.last_name}`,
      avatar_url: profile.avatar_url,
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <ApplicationHeader user={user} />
      {/* children এখানে main কন্টেন্ট রেন্ডার করবে */}
      {children}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">© 2024 Cohen & Cohen P.C. All rights reserved.</p>
            <p className="text-xs text-gray-400 mt-2">All information provided is confidential and protected by attorney-client privilege.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}