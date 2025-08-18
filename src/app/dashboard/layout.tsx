import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/login')
  }
  
  // প্রোফাইল এবং ভূমিকা চেক করার লজিক এখানে থাকতে পারে
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', session.user.id)
        .single();
    
    if (profile?.role !== 'admin') {
      return redirect('/unauthorized')
    }

     if (!profile.is_approved) {
        return redirect('/admin/login?error=account_deactivated');
    }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}