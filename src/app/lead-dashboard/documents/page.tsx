import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DocumentManager from '@/components/documents/DocumentManager';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function MyDocumentsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role')
    .eq('id', user.id)
    .single();
    
  if (!profile || profile.role !== 'client') {
      return (
          <div className="p-6">
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p>This page is only available for approved clients.</p>
          </div>
      );
  }

  const [templateRes, filesRes] = await Promise.all([
    supabase.from('folder_templates').select('structure').eq('id', 1).single(),
    supabase.from('client_files').select('*').eq('owner_id', user.id)
  ]);
  
  const predefinedFolders = templateRes.data?.structure || [];
  const allFiles = filesRes.data || [];
  const clientFolderName = `${profile.last_name}_${profile.first_name}_${profile.id}`.toLowerCase().replace(/\s+/g, '_');
  const rootPath = `client-documents/${clientFolderName}`;

  // DocumentManager নিজেই এখন একটি পূর্ণাঙ্গ UI রেন্ডার করে
  return (
    <DocumentManager
      predefinedFolders={predefinedFolders}
      customFolders={[]}
      initialFiles={allFiles}
      clientRootPath={rootPath}
      userId={user.id}
    />
  );
}