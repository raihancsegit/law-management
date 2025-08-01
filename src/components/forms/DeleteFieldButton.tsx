// src/components/forms/DeleteFieldButton.tsx
'use client';
import { deleteFormField } from '@/app/actions/formActions';

export default function DeleteFieldButton({ fieldId, formId }: { fieldId: number, formId: number }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this field?')) {
      await deleteFormField(fieldId, formId);
    }
  };
  return <button onClick={handleDelete} className="text-red-600 hover:underline">Delete</button>;
}