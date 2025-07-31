import MultiStepApplicationForm from '@/components/application/MultiStepApplicationForm';
import FormRenderer from '@/components/forms/FormRenderer';

// Helper কম্পোনেন্টটি এখানেও ব্যবহার করা যেতে পারে অথবা একটি কমন লোকেশনে রাখা যেতে পারে
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

export default async function StartApplicationPage() {
  // প্রতিটি ধাপের জন্য UI কম্পোনেন্টগুলো এখানে আগে থেকেই তৈরি করে নেওয়া হচ্ছে
  // যেহেতু এই পেজটি একটি সার্ভার কম্পোনেন্ট, এখানে FormRenderer কল করা সম্পূর্ণ নিরাপদ
  const steps = [
    <FormSectionWrapper key={1} title="Basic Information" description="Please provide your basic contact and referral information.">
      <FormRenderer formId={1} step={1} />
    </FormSectionWrapper>,
    <FormSectionWrapper key={2} title="Financial Information" description="Provide details about your financial status.">
      <FormRenderer formId={1} step={2} />
    </FormSectionWrapper>,
    <FormSectionWrapper key={3} title="Case Details & Signature" description="Explain your case and provide your signature.">
      <FormRenderer formId={1} step={3} />
    </FormSectionWrapper>,
    <FormSectionWrapper key={4} title="Document Upload & Review" description="Upload required documents and review your application.">
      <FormRenderer formId={1} step={4} />
    </FormSectionWrapper>,
  ];

  return <MultiStepApplicationForm stepComponents={steps} />;
}