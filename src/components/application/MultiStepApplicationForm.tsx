'use client';

import { useState, useRef, FormEvent } from 'react';
import ProgressIndicator from './ProgressIndicator';
import { handleSubmitApplication } from '@/app/actions/formActions';

type MultiStepApplicationFormProps = {
  stepComponents: React.ReactNode[];
};

export default function MultiStepApplicationForm({ stepComponents }: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // formData state এখন একটি অ্যারে অফ অবজেক্টস হবে, প্রতিটি ধাপের জন্য একটি
  const [allStepsData, setAllStepsData] = useState<Record<string, any>[]>([]); 
  const formRef = useRef<HTMLFormElement>(null);
  const totalSteps = stepComponents.length;

  const handleStepChange = (nextStep: number) => {
    if (formRef.current) {
      const currentForm = new FormData(formRef.current);
      const stepData = Object.fromEntries(currentForm.entries());
      
      // বর্তমান ধাপের ডেটা অ্যারেতে যোগ করা বা আপডেট করা
      const newData = [...allStepsData];
      newData[currentStep - 1] = stepData; // ইনডেক্স অনুযায়ী সেভ করা
      setAllStepsData(newData);
      
      // পরবর্তী ধাপে যাওয়া
      if (nextStep > 0 && nextStep <= totalSteps) {
          setCurrentStep(nextStep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  const handleFinalSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!formRef.current) return;

      // শেষ ধাপের ডেটা সংগ্রহ করা
      const lastStepForm = new FormData(formRef.current);
      const lastStepData = Object.fromEntries(lastStepForm.entries());
      
      // শেষ ধাপের ডেটা অ্যারেতে যোগ করা
      const finalStepsData = [...allStepsData];
      finalStepsData[currentStep - 1] = lastStepData;
      
      // সব ধাপের ডেটা একটি মাত্র অবজেক্টে একত্রিত করা
      const finalPayload = finalStepsData.reduce((acc, current) => {
          return { ...acc, ...current };
      }, {});

      // চূড়ান্ত FormData তৈরি করা
      const finalFormData = new FormData();
      for (const key in finalPayload) {
        finalFormData.append(key, (finalPayload as any)[key]);
      }
      
      // সার্ভার অ্যাকশন কল করা
      await handleSubmitApplication(finalFormData);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <form ref={formRef} onSubmit={handleFinalSubmit} className="space-y-8">
        <div>
          {stepComponents[currentStep - 1]}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => handleStepChange(currentStep - 1)}
            className={`px-6 py-2 border rounded-lg ${currentStep === 1 ? 'invisible' : 'visible'}`}
          >
            Previous
          </button>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => handleStepChange(currentStep + 1)}
              className="px-8 py-2 bg-law-blue text-white rounded-lg"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-2 bg-green-600 text-white rounded-lg"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </main>
  );
}