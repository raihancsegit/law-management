'use client';
import { useState } from 'react';
import { FieldRenderer } from '../forms/FieldRenderer';

// FormField টাইপ
type FormField = {
  id: number;
  label: string;
  field_type: any;
  placeholder: string | null;
  is_required: boolean;
  options: string[] | null;
  name: string;
};

type Step4Props = {
  fields: FormField[];
};

// একটি লেবেল এবং ফিল্ড রেন্ডার করার জন্য Helper কম্পোনেন্ট
const LabeledField = ({ field }: { field: FormField }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {field.label}
      {field.is_required && ' *'}
    </label>
    <FieldRenderer field={field} />
  </div>
);

// মূল কম্পোনেন্ট
export default function Step4_DetailedQuestions({ fields }: Step4Props) {
  const [livedElsewhere, setLivedElsewhere] = useState('');
  const [paidCreditors, setPaidCreditors] = useState('');
  const [behindPayments, setBehindPayments] = useState('');

  const findField = (labelPart: string) => fields.find(f => f.label.includes(labelPart));
  
  const bankruptcyReason = findField('What prompted you');
  const residenceQuestion = findField('Have you lived anywhere');
  const residenceDetails = {
    where: findField('Where did you live'),
    when: findField('When did you live there')
  };
  const creditorQuestion = findField('Have you paid any creditors');
  const creditorDetails = findField('provide details about these payments');
  const housingQuestion = findField('Are you behind on mortgage');
  const housingDetails = {
    details: findField('provide details about missed payments'),
    inForeclosure: findField('In foreclosure?'),
    foreclosureDate: findField('Foreclosure Court date:'),
    eviction: findField('Eviction?'),
    evictionDate: findField('Eviction Court date:'),
  };
  const assetsQuestion = findField('Do you own any of the following');

  if (!fields || fields.length === 0) {
    return <p>Loading questions...</p>;
  }

  return (
    <div className="space-y-8">
      {bankruptcyReason && (
        <div id="bankruptcy-reason">
          <LabeledField field={bankruptcyReason} />
        </div>
      )}

      {/* Residence History Section */}
      {residenceQuestion && (
        <div id="residence-history" className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 shrink-0">
                {residenceQuestion.label} {residenceQuestion.is_required && '*'}
            </label>
            <div className="flex space-x-4" onChange={(e: any) => setLivedElsewhere(e.target.value)}>
              <FieldRenderer field={residenceQuestion} />
            </div>
          </div>
          {livedElsewhere === 'Yes' && residenceDetails.where && residenceDetails.when && (
            <div id="residence-details" className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg">
              <LabeledField field={residenceDetails.where} />
              <LabeledField field={residenceDetails.when} />
            </div>
          )}
        </div>
      )}

      {/* Creditor Payments Section */}
      {creditorQuestion && (
        <div id="creditor-payments" className="space-y-4">
           <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 shrink-0">
                {creditorQuestion.label} {creditorQuestion.is_required && '*'}
            </label>
            <div className="flex space-x-4" onChange={(e: any) => setPaidCreditors(e.target.value)}>
             <FieldRenderer field={creditorQuestion} />
            </div>
          </div>
          {paidCreditors === 'Yes' && creditorDetails && (
            <div id="creditor-details" className="ml-4 p-4 bg-gray-50 rounded-lg">
              <LabeledField field={creditorDetails} />
            </div>
          )}
        </div>
      )}

      {/* Housing Payments Section */}
      {housingQuestion && (
        <div id="housing-payments" className="space-y-4">
           <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 shrink-0">
                {housingQuestion.label} {housingQuestion.is_required && '*'}
            </label>
            <div className="flex space-x-4" onChange={(e: any) => setBehindPayments(e.target.value)}>
                <FieldRenderer field={housingQuestion} />
            </div>
          </div>
          {behindPayments === 'Yes' && housingDetails.details && (
            <div id="housing-details" className="ml-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <LabeledField field={housingDetails.details} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {housingDetails.inForeclosure && <FieldRenderer field={housingDetails.inForeclosure} />}
                  {housingDetails.foreclosureDate && 
                    <div className="ml-6 mt-2">
                      <LabeledField field={housingDetails.foreclosureDate} />
                    </div>
                  }
                </div>
                <div className="space-y-2">
                  {housingDetails.eviction && <FieldRenderer field={housingDetails.eviction} />}
                  {housingDetails.evictionDate &&
                    <div className="ml-6 mt-2">
                       <LabeledField field={housingDetails.evictionDate} />
                    </div>
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assets Ownership Section */}
      {assetsQuestion && (
        <div id="assets-ownership">
            <FieldRenderer field={assetsQuestion} />
        </div>
      )}
    </div>
  );
}