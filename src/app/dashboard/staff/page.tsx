import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import StaffManagementClientPage from './StaffManagementClientPage';
import { redirect } from 'next/navigation';

export const revalidate = 0;

// SearchParams-এর জন্য টাইপ সংজ্ঞা যোগ করা
type StaffPageProps = {
    searchParams: {
        page?: string;
        q?: string;
        role?: string;
    }
}

export default async function StaffManagementPage({ searchParams }: StaffPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // অ্যাডমিন কিনা তা নিশ্চিত করা
  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (!user || adminProfile?.role !== 'admin') {
      return redirect('/dashboard');
  }

  // ক্লায়েন্ট ও লিড টেবিলের জন্য URL থেকে প্যারামিটারগুলো নেওয়া
 const page = parseInt(searchParams.page || '1', 10);
  const searchTerm = searchParams.q || '';
  const roleFilter = searchParams.role || 'all';
  
  // --- নতুন পরিবর্তন: উভয় RPC ফাংশনকে Promise.all দিয়ে একসাথে কল করা হচ্ছে ---
   const [staffResponse, clientsLeadsResponse] = await Promise.all([
    supabase.rpc('get_system_staff'),
    supabase.rpc('get_clients_and_leads', {
        page_number: page,
        search_term: searchTerm,
        filter_role: roleFilter
    })
  ]);
  
  const { data: staff, error: staffError } = staffResponse;
  const { data: clientsLeads, error: clientsLeadsError } = clientsLeadsResponse;

  if (staffError || clientsLeadsError) {
    // বিস্তারিত এরর লগ করা হচ্ছে ডিবাগিংয়ের জন্য
    console.error("Error loading user data:", { staffError, clientsLeadsError });
    // একটি অর্থপূর্ণ এরর মেসেজ দেখানো হচ্ছে
    return (
        <div className="p-6">
            <h3 className="text-red-600 font-bold">Error: Could not load user data.</h3>
            {staffError && <p className="text-sm mt-2">Staff Error: {staffError.message}</p>}
            {clientsLeadsError && <p className="text-sm mt-1">Clients/Leads Error: {clientsLeadsError.message}</p>}
            <p className="text-xs text-gray-500 mt-4">Please ensure the RPC functions and their permissions are set up correctly in your Supabase project.</p>
        </div>
    );
  }

  // ক্লায়েন্ট/লিড টেবিলের জন্য মোট ব্যবহারকারীর সংখ্যা
  const totalCount = clientsLeads?.[0]?.total_count || 0;
  
  // ক্লায়েন্ট কম্পোনেন্টে দুটি ভিন্ন ডেটা সেট পাস করা হচ্ছে
  return (
    <StaffManagementClientPage
      initialStaff={staff || []}
      initialClientsLeads={clientsLeads || []}
      totalCount={totalCount}
      searchParams={searchParams}
    />
  );
}