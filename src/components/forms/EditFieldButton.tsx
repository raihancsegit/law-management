// src/components/forms/EditFieldButton.tsx
'use client';
import { useState } from 'react';
import FormFieldModal from './FormFieldModal';

export default function EditFieldButton({ field }: { field: any }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-blue-600 hover:underline">Edit</button>
      {isOpen && <FormFieldModal formId={field.form_id} field={field} onComplete={() => setIsOpen(false)} />}
    </>
  );
}