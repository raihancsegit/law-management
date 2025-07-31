import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Props এর টাইপ ডিফাইন করা হচ্ছে
type FormRendererProps = {
  formId: number;
  step: number;
  // পরে আমরা ব্যবহারকারীর আগের সাবমিট করা ডেটাও পাস করতে পারি ডিফল্ট ভ্যালু হিসেবে
  // submissionData?: Record<string, any>;
};

// ডাটাবেস থেকে আসা একটি ফিল্ডের টাইপ
type FormField = {
  id: number;
  label: string;
  field_type: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'signature' | 'file';
  placeholder: string | null;
  is_required: boolean;
  options: string[] | null; // JSONB কলাম থেকে আসা অপশন (e.g., ["Yes", "No"])
  name: string; // HTML ফর্মের জন্য ইউনিক নাম
};

// একটি helper ফাংশন, যা লেবেলকে snake_case-এ পরিণত করে (e.g., "First Name" -> "first_name")
const toSnakeCase = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[?']/g, '');
};

// মূল কম্পোনেন্ট
export default async function FormRenderer({ formId, step }: FormRendererProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // ডাটাবেস থেকে ফর্মের ফিল্ডগুলো আনা হচ্ছে
  const { data, error } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .eq('step', step)
    .order('field_order', { ascending: true });

  if (error) {
    console.error('Error fetching form fields:', error);
    return <p className="text-red-500 col-span-full">Could not load the form fields.</p>;
  }

  if (!data || data.length === 0) {
    return <p className="col-span-full">No fields found for this step.</p>;
  }

  // ডাটাবেসের ফিল্ডগুলোকে আমাদের FormField টাইপের সাথে মিলিয়ে নেওয়া হচ্ছে
  const fields: FormField[] = data.map(field => ({
    ...field,
    name: toSnakeCase(field.label),
  }));

  // প্রতিটি ফিল্ডের জন্য UI রেন্ডার করার ফাংশন
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.is_required,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-transparent",
    };

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder || ''}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          ></textarea>
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${toSnakeCase(option)}`}
                  name={field.name}
                  value={option}
                  required={field.is_required}
                  className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
         return (
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              required={field.is_required}
              className="mt-1 h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );

      case 'signature':
        // Signature pad এর জন্য একটি বিশেষ কম্পোনেন্ট লাগবে
        // আপাতত একটি প্লেসহোল্ডার বাটন দেখানো হচ্ছে
        return (
          <div className="text-center">
            <button type="button" className="flex items-center px-6 py-3 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 mx-auto">
              <i className="fa-solid fa-pen mr-2"></i>
              Draw Signature
            </button>
            <p className="text-xs text-gray-500 mt-2">{field.placeholder}</p>
          </div>
        );

      case 'file':
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-law-blue transition-colors duration-200">
                <i className="fa-solid fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <div>
                    <label htmlFor={field.name} className="cursor-pointer text-law-blue hover:text-blue-800 font-medium">
                        Click to upload
                    </label>
                    <input type="file" id={field.name} name={field.name} className="hidden" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{field.placeholder || 'PDF, JPG, PNG files'}</p>
            </div>
        );

      default: // text, email, password, tel, date, number
        return (
          <input
            {...commonProps}
            type={field.field_type}
            placeholder={field.placeholder || ''}
          />
        );
    }
  };

  return (
    <>
      {fields.map((field) => (
        // প্রতিটি ফিল্ডকে একটি div এর ভেতরে র‍্যাপ করা হচ্ছে
        // checkbox ছাড়া বাকি সব ফিল্ডের জন্য লেবেল উপরে থাকবে
        <div key={field.id} className={field.field_type === 'checkbox' ? 'col-span-full' : ''}>
          {field.field_type !== 'checkbox' && (
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}
    </>
  );
}