'use client'; // যেহেতু এগুলো onChange হ্যান্ডলার ব্যবহার করে
import { ChangeEvent } from 'react';

// Input Field Helper Component
export const InputField = ({ label, required, ...props }: { label: string, required?: boolean, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            required={required}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue" 
            {...props} 
        />
    </div>
);

// Textarea Field Helper Component
export const TextareaField = ({ label, required, ...props }: { label: string, required?: boolean, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea 
            required={required}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue"
            {...props} 
        />
    </div>
);

// Select Field Helper Component
export const SelectField = ({ label, required, children, ...props }: { label: string, required?: boolean, children: React.ReactNode, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select 
            required={required} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue"
            {...props}
        >
            {children}
        </select>
    </div>
);

// Radio Group Helper Component (চূড়ান্ত এবং ফিক্সড সংস্করণ)
export const RadioGroup = ({ label, required, options, name, value, onChange }: {
    label: string,
    required?: boolean,
    // options এখন string[] বা {value, label}[] হতে পারে
    options: (string | { value: string; label: string })[], 
    name: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) => (
     <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            {options.map((option) => {
                // অপশনটি স্ট্রিং নাকি অবজেক্ট, তা চেক করা হচ্ছে
                const optionValue = typeof option === 'string' ? option.toLowerCase() : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;

                return (
                    <label key={optionValue} className="flex items-center text-sm">
                        <input 
                            type="radio" 
                            name={name}
                            value={optionValue} 
                            checked={value === optionValue} // state অনুযায়ী checked অবস্থা নিয়ন্ত্রণ
                            onChange={onChange} // state পরিবর্তনের জন্য onChange
                            className="mr-2 text-law-blue focus:ring-law-blue" 
                            required={required} 
                        />
                        {optionLabel}
                    </label>
                )
            })}
        </div>
    </div>
);