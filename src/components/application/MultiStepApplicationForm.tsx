'use client';

import { useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import { handleSaveProgress, handleSubmitApplication } from '@/app/actions/formActions';

// Props টাইপ
type MultiStepApplicationFormProps = {
  stepComponents: React.ReactNode[];
};

// Helper কম্পোনেন্ট
const FormSectionWrapper = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  </div>
);

// মূল কম্পোনেন্ট
export default function MultiStepApplicationForm({ stepComponents }: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = stepComponents.length;

  const handleNext = async () => {
    // "Next" বাটনটি শুধুমাত্র লগইন করা ব্যবহারকারীরা দেখতে পাবে, তাই এখানে ইউজার চেক করার দরকার নেই
    // তবে বাস্তবে, আমরা একটি 'save progress' ফাংশনও তৈরি করতে পারি যা প্রথমে ডেটা সেভ করে তারপর নেক্সট স্টেপে যায়
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* সার্ভার অ্যাকশনটি এখানে যুক্ত করা হয়েছে */}
      <form action={handleSubmitApplication} className="space-y-8">
        
        {/* প্রতিটি ধাপের জন্য কন্ডিশনাল রেন্ডারিং */}
        {stepComponents.map((component, index) => (
          <div key={index} className={currentStep === index + 1 ? 'block' : 'hidden'}>
            {component}
          </div>
        ))}

        {/* ফর্ম নেভিগেশন বাটন */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200">
           <button
            type="button"
            onClick={handlePrev}
            className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${currentStep === 1 ? 'invisible' : 'visible'}`}
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </main>
  );
}