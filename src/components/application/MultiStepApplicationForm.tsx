'use client';

import { useState, useRef, FormEvent } from 'react';
import ProgressIndicator from './ProgressIndicator';
import { handleSubmitApplication } from '@/app/actions/formActions';

type MultiStepApplicationFormProps = {
  stepComponents: React.ReactNode[];
};

export default function MultiStepApplicationForm({ stepComponents }: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [allStepsData, setAllStepsData] = useState<Record<string, any>[]>([]); 
  const formRef = useRef<HTMLFormElement>(null);
  const totalSteps = stepComponents.length;

  /**
   * বর্তমান ধাপের ফর্মটি ভ্যালিডেট করে।
   * @returns boolean - ফর্মটি ভ্যালিড হলে true, অন্যথায় false।
   */
  const validateCurrentStep = (): boolean => {
    if (!formRef.current) return false;

    const form = formRef.current;
    let isValid = true;
    let firstInvalidField: HTMLElement | null = null;

    // প্রথমে সব ফিল্ড থেকে এরর স্টাইল সরিয়ে ফেলা হচ্ছে
    form.querySelectorAll('[required]').forEach(el => {
      const inputEl = el as HTMLInputElement;
      inputEl.style.borderColor = ''; // ডিফল্ট বর্ডার
      inputEl.style.boxShadow = ''; // ডিফল্ট শ্যাডো
    });

    const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[required]');

    requiredFields.forEach(field => {
      let fieldIsValid = true;
      
      if (field.type === 'checkbox') {
        if (!(field as HTMLInputElement).checked) {
          fieldIsValid = false;
        }
      } else if (field.type === 'radio') {
        const radioGroup = form.elements.namedItem(field.name) as RadioNodeList;
        if (!radioGroup.value) {
          fieldIsValid = false;
        }
      } else {
        if (field.value.trim() === '') {
          fieldIsValid = false;
        }
      }
      
      if (!fieldIsValid) {
        isValid = false;
        // Tailwind ক্লাস ব্যবহার করার পরিবর্তে সরাসরি স্টাইল দেওয়া হলো, কারণ ক্লাস যোগ করলে জটিলতা বাড়তে পারে
        field.style.borderColor = 'red';
        field.style.boxShadow = '0 0 0 1px red';
        
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (!isValid) {
      alert('Please fill in all required fields marked with *');
      firstInvalidField?.focus(); // ব্যবহারকারীকে প্রথম খালি ফিল্ডে ফোকাস করা
    }

    return isValid;
  };

  const handleStepChange = (nextStep: number) => {
    if (!formRef.current) return;

    // পরবর্তী ধাপে যাওয়ার আগে ভ্যালিডেশন চেক করা হচ্ছে
    if (nextStep > currentStep) {
      if (!validateCurrentStep()) {
        return; // ভ্যালিডেশন ফেইল করলে ফাংশন থেকে বেরিয়ে যাওয়া হবে
      }
    }
    
    const currentForm = new FormData(formRef.current);
    const stepData = Object.fromEntries(currentForm.entries());
    
    const newData = [...allStepsData];
    newData[currentStep - 1] = stepData;
    setAllStepsData(newData);
    
    if (nextStep > 0 && nextStep <= totalSteps) {
        setCurrentStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleFinalSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formRef.current) return;

      // চূড়ান্ত সাবমিশনের আগেও ভ্যালিডেশন চেক করা হচ্ছে
      if (!validateCurrentStep()) {
        return;
      }

      const lastStepForm = new FormData(formRef.current);
      const lastStepData = Object.fromEntries(lastStepForm.entries());
      
      const finalStepsData = [...allStepsData];
      finalStepsData[currentStep - 1] = lastStepData;
      
      const finalPayload = finalStepsData.reduce((acc, current) => {
          return { ...acc, ...current };
      }, {});

      const finalFormData = new FormData();
      for (const key in finalPayload) {
        finalFormData.append(key, (finalPayload as any)[key]);
      }
      
      await handleSubmitApplication(finalFormData);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <form ref={formRef} onSubmit={handleFinalSubmit} noValidate className="space-y-8">
        <div>
          {stepComponents[currentStep - 1]}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => handleStepChange(currentStep - 1)}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${currentStep === 1 ? 'invisible' : 'visible'}`}
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Previous
          </button>
          
          <div className="flex space-x-4">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => handleStepChange(currentStep + 1)}
                className="px-8 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-law-blue transition-colors duration-200"
              >
                Next <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <i className="fa-solid fa-check mr-2"></i>
                Submit Application
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}