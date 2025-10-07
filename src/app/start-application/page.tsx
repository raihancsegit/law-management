import MultiStepApplicationForm from '@/components/application/MultiStepApplicationForm';
import { FieldRenderer } from '@/components/forms/FieldRenderer';
import FormRenderer  from '@/components/forms/FormRenderer';
import SignatureSection from '@/components/application/SignatureSection';
import Step4_DetailedQuestions from '@/components/application/Step4_DetailedQuestions';
import { getFormFields } from '@/components/forms/getFormFields';

// Helper: একটি সম্পূর্ণ ফর্ম সেকশন রেন্ডার করে
const FormSection = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
        {children}
    </div>
);

// Helper: একটি একক ফিল্ড এবং তার লেবেল রেন্ডার করে
const LabeledField = ({ field }: { field: any }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label.replace(/\s*\*$/, '')} {/* Removes trailing asterisk */}
        {field.is_required && <span className="text-red-500"> *</span>}
      </label>
      <FieldRenderer field={field} />
    </div>
);

// মূল সার্ভার পেজ
export default async function StartApplicationPage() {
  const allFields = await getFormFields(1);

  if (!allFields || allFields.length === 0) {
    return <div>Error: No fields were fetched from the database.</div>;
  }

  // ফিল্ডগুলোকে তাদের গ্রুপ অনুযায়ী ভাগ করা
  const fieldsByGroup = allFields.reduce((acc, field) => {
    // field_group null হলে 'Default' গ্রুপ ব্যবহার করা হচ্ছে
    const group = field.field_group?.trim() || 'Default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as Record<string, any[]>);

  // --- ধাপ ১-এর UI তৈরি ---
  const step1Content = (
    <FormSection key="step-1" title="Basic Information" description="Please provide your basic contact and referral information.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Primary Client</h4>
            <div className="grid grid-cols-3 gap-3">
              {fieldsByGroup['Primary Client']?.map(field => <LabeledField key={field.id} field={field} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Second Client <span className="text-xs text-gray-400">(Optional)</span></h4>
            <div className="grid grid-cols-3 gap-3">
              {fieldsByGroup['Second Client']?.map(field => <LabeledField key={field.id} field={field} />)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fieldsByGroup['Address Information']?.map(field => <LabeledField key={field.id} field={field} />)}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldsByGroup['Contact Information']?.map(field => <LabeledField key={field.id} field={field} />)}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">How were you referred to our office?</h4>
          {fieldsByGroup['Referral Information']?.map(field => <FieldRenderer key={field.id} field={field} />)}
        </div>

        <div>
          {fieldsByGroup['Legal Problem']?.map(field => <LabeledField key={field.id} field={field} />)}
        </div>
      </div>
    </FormSection>
  );

    const step2Content = (
    <FormSection key="step-2" title="Legal Notices" description="Please review the following important legal information carefully.">
      <div className="col-span-full prose max-w-none space-y-6">
        {/* === স্ট্যাটিক Legal Notices টেক্সট এখানে হার্ডকোড করা হচ্ছে === */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Important Notice Regarding Bankruptcy Proceedings</h4>
          <p className="text-sm text-amber-700">
            Filing for bankruptcy is a significant legal decision that will affect your financial future...
          </p>
        </div>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p><strong>Attorney-Client Privilege:</strong> Communications between you and Cohen & Cohen P.C. are protected...</p>
          <p><strong>Fees and Costs:</strong> Legal representation involves fees and costs...</p>
           <p>
                                <strong>No Guarantee of Results:</strong> While we will work diligently on your behalf, we cannot guarantee specific outcomes in your bankruptcy case. The success of your case depends on many factors, including the specific facts of your situation, applicable law, and court decisions.
                            </p>

                            <p>
                                <strong>Debt Management and Credit Counseling:</strong> Before filing for bankruptcy, you may be required to complete credit counseling from an approved agency. We can provide you with information about approved agencies and help you understand this requirement.
                            </p>

                            <p>
                                <strong>Alternatives to Bankruptcy:</strong> Bankruptcy may not be the best solution for everyone. We will discuss with you all available options, including debt consolidation, negotiation with creditors, and other alternatives that may be appropriate for your situation.
                            </p>

                            <p>
                                <strong>Impact on Credit:</strong> Filing for bankruptcy will have a significant impact on your credit score and credit report. A bankruptcy filing may remain on your credit report for up to 10 years, though its impact on your ability to obtain credit typically diminishes over time.
                            </p>

                            <p>
                                <strong>Asset Protection:</strong> While bankruptcy can provide relief from overwhelming debt, it may also require the liquidation of certain assets. We will help you understand which assets may be protected under applicable exemption laws and which assets may be at risk.
                            </p>

                            <p>
                                <strong>Ongoing Obligations:</strong> Even after a successful bankruptcy discharge, you may have ongoing obligations, including the payment of certain types of debt that are not dischargeable, such as most student loans, recent tax obligations, and domestic support obligations.
                            </p>
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Your Rights and Responsibilities</h4>
          <p className="text-sm text-blue-700">
            You have the right to competent legal representation and to be informed about all significant developments...
          </p>
        </div>
        
        {/* === ডাইনামিক চেকবক্স ফিল্ডটি FormRenderer দিয়ে রেন্ডার করা হচ্ছে === */}
        <div className="mt-6">
          <FormRenderer formId={1} step={2}>
            {(groupedFields) => (
              <>
                {groupedFields['Default']?.map(field => <FieldRenderer key={field.id} field={field} />)}
              </>
            )}
          </FormRenderer>
        </div>
      </div>
     </FormSection>
  );

    const step3Content = (
    <FormSection key="step-3" title="Acknowledgment of Receipt" description="Choose your preferred method to provide signatures and acknowledge receipt of this information.">
      <div className="col-span-full space-y-8">
        <FormRenderer formId={1} step={3}>
          {(groupedFields) => {
            // ডাটাবেস থেকে আসা ফিল্ডগুলোকে একটি সহজ স্ট্রাকচারে পরিণত করা
            const primaryFields = {
              method: groupedFields['Default']?.find(f => f.label.includes('Method (Primary)')),
              signature: groupedFields['Default']?.find(f => f.label.includes('Signature (Primary)')),
              date: groupedFields['Default']?.find(f => f.label.includes('Date (Primary)')),
              name: groupedFields['Default']?.find(f => f.label.includes('Printed Name (Primary)')),
            };
            const secondFields = {
              method: groupedFields['Default']?.find(f => f.label.includes('Method (Second)')),
              signature: groupedFields['Default']?.find(f => f.label.includes('Signature (Second)')),
              date: groupedFields['Default']?.find(f => f.label.includes('Date (Second)')),
              name: groupedFields['Default']?.find(f => f.label.includes('Printed Name (Second)')),
            };

            // যদি কোনো 필্ড খুঁজে না পাওয়া যায়, তাহলে কিছু রেন্ডার না করা
            if (!primaryFields.method || !primaryFields.signature || !primaryFields.date || !primaryFields.name ||
                !secondFields.method || !secondFields.signature || !secondFields.date || !secondFields.name) {
              return <p>Error: Signature fields could not be loaded.</p>;
            }

            return (
              <>
                <SignatureSection 
                  title="Primary Client Signature"
                  fields={primaryFields as any}
                  clientIndex={1}
                />
                <hr className="my-8" />
                <SignatureSection
                  title="Second Client Signature"
                  isOptional={true}
                  fields={secondFields as any}
                  clientIndex={2}
                />
              </>
            );
          }}
        </FormRenderer>
      </div>
    </FormSection>
  );

  const step4Content = (
    <FormSection key="step-4" title="Detailed Questions" description="Please answer the following questions to help us better understand your situation.">
      <div className="col-span-full">
        <FormRenderer formId={1} step={4}>
          {(groupedFields) => (
            // groupedFields['Default']-এ ধাপ ৪-এর সব ফিল্ড থাকবে
            <Step4_DetailedQuestions fields={groupedFields['Default'] || []} />
          )}
        </FormRenderer>
      </div>
    </FormSection>
  );
  
    const steps = [
        step1Content,
        step2Content,
        step3Content,
        step4Content,
    ];

    return <MultiStepApplicationForm stepComponents={steps} />;
}