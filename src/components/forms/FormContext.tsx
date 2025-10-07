// src/components/forms/FormContext.tsx
'use client';
import { createContext, useContext, ChangeEvent } from 'react';

type FormContextType = {
  formData: Record<string, any>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

export default FormContext;