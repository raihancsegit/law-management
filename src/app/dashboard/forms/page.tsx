import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const revalidate = 0; // ডেটা ক্যাশিং নিষ্ক্রিয় করা

// একটি একক ফর্ম কার্ডের জন্য Helper Component
const FormCard = ({ form, fieldCounts, submissionCounts }: { 
  form: any; 
  fieldCounts: Record<number, number>;
  submissionCounts: Record<number, number> 
}) => {
  const icon = form.name.includes('Bankruptcy') ? 'fa-solid fa-file-contract' : 'fa-solid fa-clipboard-list';
  const colors = form.name.includes('Bankruptcy') 
    ? { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600' }
    : { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-600' };
  
  const fields = fieldCounts[form.id] || 0;
  const submissions = submissionCounts[form.id] || 0;

  return (
    <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} rounded-lg p-6 border`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{form.name}</h4>
          <p className="text-sm text-gray-600 mb-4">{form.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span><i className="fa-solid fa-list mr-1"></i>{fields} Fields</span>
            <span><i className="fa-solid fa-users mr-1"></i>{submissions} Submissions</span>
          </div>
        </div>
        <div className={colors.text}>
          <i className={`${icon} text-3xl`}></i>
        </div>
      </div>
      <div className="mt-4 text-right">
        <Link href={`/dashboard/forms/${form.id}`} className="font-medium text-law-blue hover:underline">
          Manage Fields →
        </Link>
      </div>
    </div>
  );
};

// মূল পেজ কম্পোনেন্ট
export default async function FormsListPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Promise.all ব্যবহার করে সমান্তরালভাবে ডেটা লোড করা হচ্ছে
  const [formsResponse, fieldCountsResponse, submissionCountsResponse] = await Promise.all([
    supabase.from('forms').select('*'),
    supabase.rpc('get_form_field_counts'), // 필드 গণনার জন্য RPC (ঐচ্ছিক, নিচে তৈরি করার কোড দেওয়া আছে)
    supabase.rpc('get_form_submission_counts') // সাবমিশন গণনার জন্য আমাদের নতুন RPC
  ]);

  const { data: forms, error: formsError } = formsResponse;
  const { data: fieldCounts, error: fieldCountsError } = fieldCountsResponse;
  const { data: submissionCounts, error: submissionCountsError } = submissionCountsResponse;

  if (formsError || fieldCountsError || submissionCountsError) {
    console.error("Error loading forms data:", { formsError, fieldCountsError, submissionCountsError });
    return <p className="p-6 text-red-500">Error loading forms. Please try again later.</p>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Form Management</h3>
            <p className="text-sm text-gray-500 mt-1">Design and customize forms for leads and clients</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800">
              <i className="fa-solid fa-plus mr-2"></i>
              Create New Form
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {forms?.map((form) => (
              <FormCard 
                key={form.id} 
                form={form} 
                fieldCounts={fieldCounts || {}}
                submissionCounts={submissionCounts || {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}