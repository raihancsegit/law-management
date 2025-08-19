import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
// আমরা এই কম্পোনেন্টগুলো তৈরি করব
import AddFieldButton from '@/components/forms/AddFieldButton';
import EditFieldButton from '@/components/forms/EditFieldButton';
import DeleteFieldButton from '@/components/forms/DeleteFieldButton';
import type { Metadata, ResolvingMetadata } from 'next';
export const revalidate = 0;

// === পরিবর্তন ২: Props-এর জন্য একটি নতুন, শক্তিশালী টাইপ 정의 করা ===
type Props = {
  params: { formId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// === পরিবর্তন ৩ (ঐচ্ছিক কিন্তু সেরা অভ্যাস): ডাইনামিক মেটাডেটা ===
// এই ফাংশনটি সার্ভারে পেজের <title> ট্যাগ সেট করে।
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const formId = parseInt(params.formId, 10);
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: form } = await supabase.from('forms').select('name').eq('id', formId).single();

  return {
    title: `${form?.name || 'Form'} Fields | Admin Dashboard`,
  };
}

export default async function FormFieldsPage({ params }: Props) {
  const formId = parseInt(params.formId, 10);
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('name')
    .eq('id', formId)
    .single();

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('step', { ascending: true })
    .order('field_order', { ascending: true });

  if (formError || fieldsError) {
    return <p className="p-6 text-red-500">Error loading form details.</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/forms" className="text-sm text-gray-500 hover:text-law-blue">
            ← Back to Forms
          </Link>
          <h1 className="text-2xl font-bold">{form.name} - Fields</h1>
        </div>
        <AddFieldButton formId={formId} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50 text-sm font-medium text-gray-500">
                <td className="px-6 py-4">{field.step}</td>
                <td className="px-6 py-4">{field.field_order}</td>
                <td className="px-6 py-4 ">{field.label}</td>
                <td className="px-6 py-4">{field.field_type}</td>
                <td className="px-6 py-4">{field.is_required ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-right flex justify-end space-x-2">
                  <EditFieldButton field={field} />
                  <DeleteFieldButton fieldId={field.id} formId={formId}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}