// src/components/forms/getFormFields.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getFormFields(formId: number) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data, error } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('field_order', { ascending: true });

  if (error) {
    console.error('Error fetching form fields:', error);
    return [];
  }
  return data || [];
}