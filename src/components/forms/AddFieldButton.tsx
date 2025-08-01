// src/components/forms/AddFieldButton.tsx
'use client';
import { useState } from 'react';
import FormFieldModal from './FormFieldModal';

export default function AddFieldButton({ formId }: { formId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-law-blue text-white rounded-lg">Add New Field</button>
      {isOpen && <FormFieldModal formId={formId} onComplete={() => setIsOpen(false)} />}
    </>
  );
}