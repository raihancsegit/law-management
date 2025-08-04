import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import FolderEditor from '@/components/folders/FolderEditor';

// এই পেজের ডেটা যেন ক্যাশ না হয়
export const revalidate = 0;

export default async function FolderManagementPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // ডাটাবেস থেকে ডিফল্ট ফোল্ডার টেমপ্লেটটি লোড করা হচ্ছে
  const { data: template, error } = await supabase
    .from('folder_templates')
    .select('*')
    .eq('id', 1) // ধরে নিচ্ছি আপনার ডিফল্ট টেমপ্লেটের আইডি 1
    .single();

  if (error || !template) {
    return (
        <div className="p-6">
            <p className="text-red-500">
                Error: Could not load the folder template. Please ensure a template with ID 1 exists in the 'folder_templates' table.
            </p>
        </div>
    );
  }
  
  // ডেটা ক্লায়েন্ট কম্পোনেন্টের কাছে পাস করা হচ্ছে
  return <FolderEditor initialTemplate={template} />;
}