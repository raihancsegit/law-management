import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function FormsListPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: forms, error } = await supabase.from('forms').select('*');

  if (error) {
    return <p className="p-6 text-red-500">Error loading forms: {error.message}</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Management</h1>
        {/* নতুন ফর্ম তৈরির বাটন (ভবিষ্যতের জন্য) */}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Form Name</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{form.name}</td>
                <td className="px-6 py-4">{form.description}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/forms/${form.id}`} className="font-medium text-law-blue hover:underline">
                    Manage Fields
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}