import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
// আমরা এই কম্পোনেন্টগুলো তৈরি করব
import AddFieldButton from '@/components/forms/AddFieldButton';
import EditFieldButton from '@/components/forms/EditFieldButton';
import DeleteFieldButton from '@/components/forms/DeleteFieldButton';

export const revalidate = 0;

type FormFieldsPageProps = {
  params: {
    formId: string;
  };
};

export default async function FormFieldsPage({ params }: FormFieldsPageProps) {
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
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Step</th>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Label</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Required</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{field.step}</td>
                <td className="px-6 py-4">{field.field_order}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{field.label}</td>
                <td className="px-6 py-4">{field.field_type}</td>
                <td className="px-6 py-4">{field.is_required ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-right flex justify-end space-x-2">
                  <EditFieldButton field={field} />
                  <DeleteFieldButton fieldId={field.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}