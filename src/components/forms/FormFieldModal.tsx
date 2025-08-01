'use client';
import { useState, useEffect } from 'react';
import { createFormField, updateFormField } from '@/app/actions/formActions';

// এই টাইপটি form_fields টেবিলের কলামগুলোর সাথে মিলবে
type FieldData = {
  id?: number;
  form_id: number;
  step: number;
  field_order: number;
  label: string;
  field_type: string;
  placeholder: string;
  is_required: boolean;
  options: string[];
};

// Props-এর টাইপ
type FormFieldModalProps = {
  formId: number;
  field?: any; // এডিটের জন্য বিদ্যমান ফিল্ডের ডেটা
  onComplete: () => void; // মডাল বন্ধ করার জন্য
};

export default function FormFieldModal({ formId, field, onComplete }: FormFieldModalProps) {
  const isEditing = !!field;
  const [error, setError] = useState<string | null>(null);

  // ফর্মের ডেটা state-এ রাখা হচ্ছে
  const [formData, setFormData] = useState<FieldData>({
    form_id: formId,
    step: field?.step || 1,
    field_order: field?.field_order || 1,
    label: field?.label || '',
    field_type: field?.field_type || 'text',
    placeholder: field?.placeholder || '',
    is_required: field?.is_required || true,
    options: field?.options || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // কমা দিয়ে সেপারেট করা স্ট্রিংকে একটি অ্যারেতে পরিণত করা হচ্ছে
    const optionsArray = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, options: optionsArray }));
  };

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formPayload = new FormData();
    // state থেকে ডেটা FormData-তে যোগ করা হচ্ছে
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'options' && Array.isArray(value)) {
        formPayload.append(key, JSON.stringify(value));
      } else {
        formPayload.append(key, String(value));
      }
    });

    if (isEditing) {
      formPayload.append('field_id', String(field.id));
    }

    const action = isEditing ? updateFormField : createFormField;
    const result = await action(formPayload);

    if (result?.error) {
      setError(result.error);
    } else {
      onComplete(); // সফল হলে মডাল বন্ধ হবে
    }
  };

  // ফিল্ড টাইপের তালিকা
  const fieldTypes = [
    'text', 'email', 'password', 'tel', 'date', 'number',
    'textarea', 'select', 'radio', 'checkbox', 'signature', 'file'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Field' : 'Add New Field'}</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Step</label>
              <input type="number" name="step" value={formData.step} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Field Order</label>
              <input type="number" name="field_order" value={formData.field_order} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Field Type</label>
              <select name="field_type" value={formData.field_type} onChange={handleChange} className="w-full p-2 border rounded" required>
                {fieldTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Label / Question</label>
            <input type="text" name="label" value={formData.label} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium">Placeholder Text</label>
            <input type="text" name="placeholder" value={formData.placeholder} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          {/* select বা radio টাইপের জন্য অপশন ইনপুট */}
          {(formData.field_type === 'select' || formData.field_type === 'radio') && (
            <div>
              <label className="block text-sm font-medium">Options (comma-separated)</label>
              <textarea
                name="options"
                value={formData.options.join(', ')}
                onChange={handleOptionsChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., Yes, No, Maybe"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_required"
              name="is_required"
              checked={formData.is_required}
              onChange={handleChange}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="is_required" className="ml-2 text-sm font-medium">Is this field required?</label>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onComplete} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-700">
              {isEditing ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}