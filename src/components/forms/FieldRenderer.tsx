'use client';

// টাইপ সংজ্ঞা
type Option = {
  value: string;
  label: string;
  hasInput?: boolean; // নতুন প্রপার্টি: ইনপুট ফিল্ড আছে কিনা
  placeholder?: string; // ইনপুট ফিল্ডের জন্য placeholder
};

type FormField = {
  id: number;
  label: string;
  field_type: string; // স্ট্রিং হিসেবে রাখা হয়েছে নমনীয়তার জন্য
  placeholder: string | null;
  is_required: boolean;
  options: Option[] | null;
  name: string;
};

const toSnakeCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[?()'"]/g, '');
};

export const FieldRenderer = ({ field }: { field: FormField }) => {
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
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="space-y-3">
          {field.options?.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`${field.name}-${option.value}`}
                name={field.name}
                value={option.value}
                required={field.is_required}
                className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
       if (!field.options || field.options.length === 0) {
            return (
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        required={field.is_required}
                        className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300 rounded"
                    />
                    {/* সিঙ্গেল চেকবক্সের জন্য মূল লেবেলটি দেখানো হচ্ছে */}
                    <span className="text-sm text-gray-700">{field.label}</span>
                </label>
            );
       }
       // মাল্টিপল চেকবক্স (options সহ)
       return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.is_required && '*'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    // মাল্টিপল চেকবক্সের জন্য প্রতিটি ইনপুটের একটি ইউনিক নাম থাকা উচিত
                    name={`${field.name}_${option.value}`} 
                    value={option.value}
                    className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
        </div>
       );

    case 'signature':
      return (
        <div className="text-center">
          <button type="button" className="flex items-center mx-auto px-6 py-3 bg-law-blue text-white rounded-lg hover:bg-blue-800">
            <i className="fa-solid fa-pen mr-2"></i> Draw Signature
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

    case 'radio_with_input':
      return (
        <div className="space-y-3">
          {field.options?.map((option) => (
            // যদি অপশনের সাথে ইনপুট ফিল্ড থাকে, তাহলে div দিয়ে র‍্যাপ করা হচ্ছে
            option.hasInput ? (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  required={field.is_required}
                  className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300"
                />
                <label htmlFor={`${field.name}-${option.value}`} className="text-sm text-gray-700">{option.label}</label>
                <input
                  type="text"
                  // ইনপুট ফিল্ডের জন্য একটি ইউনিক নাম
                  name={`${field.name}_input_${option.value}`}
                  placeholder={option.placeholder || ''}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-law-blue focus:border-transparent"
                />
              </div>
            ) : (
              // যদি সাধারণ রেডিও বাটন হয়
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  required={field.is_required}
                  className="h-4 w-4 text-law-blue focus:ring-law-blue border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            )
          ))}
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