import ProgressIndicator from '@/components/application/ProgressIndicator';
import FormRenderer from '@/components/forms/FormRenderer'; // এই কম্পোনেন্টটি আপডেট করতে হবে
// import FormNavigation from '@/components/application/FormNavigation';

type ApplicationFormPageProps = {
  params: {
    step: string;
  };
};

export default function ApplicationFormPage({ params }: ApplicationFormPageProps) {
  const currentStep = parseInt(params.step, 10);
  const totalSteps = 4; // এটি ডাইনামিক করা যেতে পারে

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      <form className="space-y-8">
        <section className="form-section">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              {/* সেকশনের টাইটেল ডাইনামিকভাবে আসতে পারে */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Step {currentStep}: Section Title
              </h3>
              <p className="text-gray-500">
                Please provide the following information.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FormRenderer এখানে ফিল্ডগুলো রেন্ডার করবে */}
                <FormRenderer formId={1} step={currentStep} />
              </div>
            </div>
          </div>
        </section>

        {/* <FormNavigation currentStep={currentStep} totalSteps={totalSteps} /> */}
      </form>
    </main>
  );
}