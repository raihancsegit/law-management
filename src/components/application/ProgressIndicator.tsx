'use client'; // এটি ক্লায়েন্ট কম্পোনেন্ট কারণ এটি currentStep-এর উপর নির্ভর করে

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const stepTitles = ["Basic Information", "Legal Notices", "Acknowledgment", "Detailed Questions"];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Bankruptcy Application</h2>
        <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-law-blue h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {stepTitles.map(title => <span key={title}>{title}</span>)}
      </div>
    </div>
  );
}