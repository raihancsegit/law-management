import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import React from 'react';

// টাইপ সংজ্ঞা
type FormField = {
  id: number;
  label: string;
  field_type: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'signature' | 'file';
  placeholder: string | null;
  is_required: boolean;
  options: string[] | null;
  name: string;
  field_order: number;
};

const toSnakeCase = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[?()'"]/g, '');
};

// মূল সার্ভার কম্পোনেন্ট
export default async function FormRenderer({ formId, step, children }: {
  formId: number;
  step: number;
  children: (groupedFields: Record<string, FormField[]>) => React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .eq('step', step)
    .order('field_order', { ascending: true });

  if (error || !data) {
    return <p className="text-red-500 col-span-full">Could not load the form fields. Please check your database connection and table names.</p>;
  }

  const fields: FormField[] = data.map(field => ({
    ...field,
    name: toSnakeCase(field.label),
  }));

  // ফিল্ডগুলোকে গ্রুপ করার লজিক
  const groupedFields: Record<string, FormField[]> = {};
  
  fields.forEach(field => {
    let groupName = 'Default';

    // শুধুমাত্র ধাপ ১-এর জন্য এই জটিল গ্রুপিং লজিকটি প্রয়োগ করা হবে
    if (step === 1) {
        if (field.field_order >= 10 && field.field_order < 40) groupName = 'Primary Client';
        else if (field.field_order >= 40 && field.field_order < 70) groupName = 'Second Client';
        else if (field.field_order >= 70 && field.field_order < 100) groupName = 'Address Information';
        else if (field.field_order >= 100 && field.field_order < 160) groupName = 'Contact Information';
        else if (field.field_order === 160) groupName = 'Referral Information';
        else if (field.field_order === 170) groupName = 'Legal Problem';
        else if (field.field_order === 180) groupName = 'Account Creation';
    }
    // ধাপ ২, ৩, ৪-এর জন্য সব ফিল্ড 'Default' গ্রুপেই থাকবে

    if (!groupedFields[groupName]) {
      groupedFields[groupName] = [];
    }
    groupedFields[groupName].push(field);
});

  return <>{children(groupedFields)}</>;
}