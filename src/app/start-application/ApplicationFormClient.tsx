'use client';

import { useState } from 'react';
import MultiStepApplicationForm from '@/components/application/MultiStepApplicationForm';
import { FieldRenderer } from '@/components/forms/FieldRenderer';
import SignatureSection from '@/components/application/SignatureSection';
import Step4_DetailedQuestions from '@/components/application/Step4_DetailedQuestions';
import FormContext from '@/components/forms/FormContext';

// Helper: FormSection
const FormSection = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
        {children}
    </div>
);

// মূল ক্লায়েন্ট কম্পোনেন্ট
export default function ApplicationFormClient({ allFields }: { allFields: any[] }) {
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prevData => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const fieldsByStepAndGroup = allFields.reduce((acc, field) => {
        const step = field.step;
        const group = field.field_group?.trim() || 'Default';
        if (!acc[step]) acc[step] = {};
        if (!acc[step][group]) acc[step][group] = [];
        acc[step][group].push(field);
        return acc;
    }, {} as Record<number, Record<string, any[]>>);

    // --- ধাপ ১-এর UI তৈরি ---
    const step1Content = (
        <FormSection key="step-1" title="Basic Information" description="Please provide your basic contact and referral information.">
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Primary Client</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {fieldsByStepAndGroup[1]?.['Primary Client']?.map(field => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.is_required && ' *'}</label>
                                    <FieldRenderer field={field} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Second Client <span className="text-xs text-gray-400">(Optional)</span></h4>
                        <div className="grid grid-cols-3 gap-3">
                            {fieldsByStepAndGroup[1]?.['Second Client']?.map(field => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                    <FieldRenderer field={field} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {fieldsByStepAndGroup[1]?.['Address Information']?.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.is_required && ' *'}</label>
                                <FieldRenderer field={field} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldsByStepAndGroup[1]?.['Contact Information']?.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}{field.is_required && ' *'}</label>
                                <FieldRenderer field={field} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">How were you referred to our office?</h4>
                    {fieldsByStepAndGroup[1]?.['Referral Information']?.map(field => (
                        <FieldRenderer key={field.id} field={field} />
                    ))}
                </div>
                <div>
                    {fieldsByStepAndGroup[1]?.['Legal Problem']?.map(field => (
                        <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}{field.is_required && ' *'}</label>
                            <FieldRenderer field={field} />
                        </div>
                    ))}
                </div>
            </div>
        </FormSection>
    );

    // --- ধাপ ২-এর UI তৈরি ---
    const step2Content = (
        <FormSection key="step-2" title="Legal Notices" description="Please review the following important legal information carefully.">
            <div className="col-span-full prose max-w-none space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2">Important Notice Regarding Bankruptcy Proceedings</h4>
                    <p className="text-sm text-amber-700">Filing for bankruptcy is a significant legal decision that will affect your financial future...</p>
                </div>
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <p><strong>Attorney-Client Privilege:</strong> Communications between you and Cohen & Cohen P.C. are protected...</p>
                    <p><strong>Fees and Costs:</strong> Legal representation involves fees and costs...</p>
                    <p><strong>No Guarantee of Results:</strong> While we will work diligently on your behalf, we cannot guarantee specific outcomes...</p>
                    <p><strong>Debt Management and Credit Counseling:</strong> Before filing for bankruptcy, you may be required to complete credit counseling...</p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Your Rights and Responsibilities</h4>
                    <p className="text-sm text-blue-700">You have the right to competent legal representation and to be informed about all significant developments...</p>
                </div>
                <div className="mt-6">
                    {fieldsByStepAndGroup[2]?.['Default']?.map(field => (
                        <FieldRenderer key={field.id} field={field} />
                    ))}
                </div>
            </div>
        </FormSection>
    );

    // --- ধাপ ৩-এর UI তৈরি ---
    const step3Content = (
        <FormSection key="step-3" title="Acknowledgment of Receipt" description="Choose your preferred method to provide signatures and acknowledge receipt of this information.">
            <div className="col-span-full space-y-8">
                {(() => {
                    const step3Fields = fieldsByStepAndGroup[3]?.['Default'] || [];
                    const primaryFields = {
                        method: step3Fields.find(f => f.name === 'signature_method_primary'),
                        signature: step3Fields.find(f => f.name === 'signature_primary'),
                        date: step3Fields.find(f => f.name === 'date_primary'),
                        name: step3Fields.find(f => f.name === 'printed_name_primary'),
                    };
                    const secondFields = {
                         method: step3Fields.find(f => f.name === 'signature_method_second'),
                         signature: step3Fields.find(f => f.name === 'signature_second'),
                         date: step3Fields.find(f => f.name === 'date_second'),
                         name: step3Fields.find(f => f.name === 'printed_name_second'),
                    };
                    
                    if (Object.values(primaryFields).some(f => !f) || Object.values(secondFields).some(f => !f)) {
                         return <p className="text-red-500">Error: Signature fields could not be loaded correctly. Please check the `form_fields` table for step 3.</p>;
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
                })()}
            </div>
        </FormSection>
    );
    
    // --- ধাপ ৪-এর UI তৈরি ---
    const step4Content = (
        <FormSection key="step-4" title="Detailed Questions" description="Please answer the following questions to help us better understand your situation.">
            <div className="col-span-full">
                <Step4_DetailedQuestions fields={fieldsByStepAndGroup[4]?.['Default'] || []} />
            </div>
        </FormSection>
    );

    const steps = [
        step1Content, 
        step2Content, 
        step3Content, 
        step4Content
    ];

    return (
        <FormContext.Provider value={{ formData, handleChange }}>
            <MultiStepApplicationForm stepComponents={steps} />
        </FormContext.Provider>
    );
}