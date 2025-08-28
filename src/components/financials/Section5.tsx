'use client';
import { ChangeEvent } from 'react';
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Main component props type
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

/**
 * Other Deductions অংশের জন্য একটি পুনঃব্যবহারযোগ্য কম্পোনেন্ট।
 */
const OtherDeductions = ({ personType, formData, setFormData }: { personType: 'debtor' | 'spouse', formData: any, setFormData: (data: any) => void }) => {
    const fieldName = personType === 'debtor' ? 'otherDeductions' : 'spouseOtherDeductions';
    const deductions = formData[fieldName] || [{ desc: '', amount: '' }];

    const handleDeductionChange = (index: number, field: 'desc' | 'amount', value: string) => {
        const updatedDeductions = [...deductions];
        updatedDeductions[index] = { ...updatedDeductions[index], [field]: value };
        setFormData({ ...formData, [fieldName]: updatedDeductions });
    };

    const addDeduction = () => {
        setFormData({ ...formData, [fieldName]: [...deductions, { desc: '', amount: '' }] });
    };

    return (
        <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-4">Other Deductions</h4>
            <div className="space-y-4">
                {deductions.map((deduction: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Other Deduction (describe)" value={deduction.desc} onChange={(e) => handleDeductionChange(index, 'desc', e.target.value)} placeholder="e.g., Parking, Transportation" />
                        <InputField label="Amount" value={deduction.amount} onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)} type="number" step="0.01" />
                    </div>
                ))}
            </div>
            <button type="button" onClick={addDeduction} className="mt-4 px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors duration-200">
                <i className="fa-solid fa-plus mr-2"></i> Add Another Deduction
            </button>
        </div>
    );
};

/**
 * Additional Income Sources অংশের প্রতিটি আইটেমের জন্য পুনঃব্যবহারযোগ্য কম্পোনেন্ট।
 */
const IncomeSourceItem = ({ title, name, formData, handleChange, showDescription = false }: { title: string, name: string, formData: any, handleChange: (e: ChangeEvent<any>) => void, showDescription?: boolean }) => {
    const hasIncome = formData[name] === 'yes';

    return (
        <div className="income-source p-4 bg-gray-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
            <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                    <input type="radio" name={name} value="no" checked={formData[name] === 'no' || !formData[name]} onChange={handleChange} className="mr-2 text-law-blue focus:ring-law-blue" /> No
                </label>
                <label className="flex items-center">
                    <input type="radio" name={name} value="yes" checked={formData[name] === 'yes'} onChange={handleChange} className="mr-2 text-law-blue focus:ring-law-blue" /> Yes
                </label>
            </div>
            {hasIncome && (
                <div className="space-y-4">
                    {showDescription && (
                        <InputField label="If yes, please describe:" name={`${name}Desc`} value={formData[`${name}Desc`] || ''} onChange={handleChange} placeholder="Describe the source" />
                    )}
                    <InputField label="How much do you receive per month?" name={`${name}Amount`} value={formData[`${name}Amount`] || ''} onChange={handleChange} type="number" step="0.01" />
                </div>
            )}
        </div>
    );
};


// মূল Section5 কম্পোনেন্ট
export default function Section5({ formData, setFormData }: SectionProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    return (
        <div className="mainsection6">
            <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800"><i className="fa-solid fa-info-circle mr-2"></i> Complete this section with your current employment and income information. Please be as accurate as possible with all amounts.</p>
                </div>
            </div>

            {/* Employment Status Check */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Employment Status</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" name="currentlyEmployed" checked={!!formData.currentlyEmployed} onChange={handleChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700">I am currently employed</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="spouseEmployed" checked={!!formData.spouseEmployed} onChange={handleChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700">My spouse is currently employed</span>
                    </label>
                </div>
            </div>

            {/* Part A & C for Debtor */}
            {formData.currentlyEmployed && (
                <>
                    {/* Part A: Your Employer Information */}
                    <div id="partA" className="mb-12">
                        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>Part A. Your Employer Information</h2>
                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-lg border border-blue-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-building mr-2 text-law-blue"></i>Primary Employer</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2"><TextareaField label="Name and Address of your employer" name="primaryEmployerAddress" value={formData.primaryEmployerAddress || ''} onChange={handleChange} rows={3} placeholder="Company name and full address"/></div>
                                        <InputField label="How long have you been employed?" name="primaryEmploymentDuration" value={formData.primaryEmploymentDuration || ''} onChange={handleChange} placeholder="e.g., 2 years, 6 months"/>
                                        <InputField label="Occupation (job title)" name="primaryOccupation" value={formData.primaryOccupation || ''} onChange={handleChange} placeholder="e.g., Software Engineer, Manager"/>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-blue-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800"><i className="fa-solid fa-building-user mr-2 text-law-blue"></i>Second Employer</h3>
                                        <label className="flex items-center text-sm">
                                            <input type="checkbox" name="hasSecondJob" checked={!!formData.hasSecondJob} onChange={handleChange} className="mr-2" />
                                            <span className="text-gray-600">I have a second job</span>
                                        </label>
                                    </div>
                                    {formData.hasSecondJob && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2"><TextareaField label="Name and Address of second employer" name="secondEmployerAddress" value={formData.secondEmployerAddress || ''} onChange={handleChange} rows={3} placeholder="Company name and full address"/></div>
                                            <InputField label="How long employed at this job?" name="secondEmploymentDuration" value={formData.secondEmploymentDuration || ''} onChange={handleChange} placeholder="e.g., 1 year"/>
                                            <InputField label="Occupation (job title)" name="secondOccupation" value={formData.secondOccupation || ''} onChange={handleChange} placeholder="Job title or description"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Part C: Your Wage Information */}
                    <div id="partC" className="mb-12">
                         <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-dollar-sign mr-2 text-law-blue"></i>Part C. Your Wage Information</h2>
                            <div className="space-y-8">
                                <div className="p-6 bg-white rounded-lg border border-yellow-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-money-check mr-2 text-law-blue"></i>Paycheck Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Gross amount of your paycheck (before deductions)" name="grossPaycheck" value={formData.grossPaycheck || ''} onChange={handleChange} type="number" step="0.01" />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">How often do you get paid?</label>
                                            <div className="space-y-2">
                                                {['weekly', 'biweekly', 'semimonthly', 'monthly', 'other'].map(freq => (
                                                    <label key={freq} className="flex items-center">
                                                        <input type="radio" name="payFrequency" value={freq} checked={formData.payFrequency === freq} onChange={handleChange} className="mr-2 text-law-blue focus:ring-law-blue" />
                                                        {freq === 'weekly' ? 'Once a week' : freq === 'biweekly' ? 'Every two weeks' : freq === 'semimonthly' ? 'Twice a month' : freq === 'monthly' ? 'Once a month' : 'Other:'}
                                                        {freq === 'other' && formData.payFrequency === 'other' && <InputField name="payFrequencyOther" value={formData.payFrequencyOther || ''} onChange={handleChange} className="ml-2 flex-1"/>}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <InputField label="Estimated overtime pay per month" name="overtimePay" value={formData.overtimePay || ''} onChange={handleChange} type="number" step="0.01" />
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-yellow-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-calculator mr-2 text-law-blue"></i>Paycheck Deductions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Taxes, Medicare, Social Security (total)" name="taxDeductions" value={formData.taxDeductions || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Mandatory Retirement Contributions" name="mandatoryRetirement" value={formData.mandatoryRetirement || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Voluntary Retirement Contributions" name="voluntaryRetirement" value={formData.voluntaryRetirement || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Retirement Fund Loan Repayments" name="retirementLoans" value={formData.retirementLoans || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Insurance Deductions" name="insuranceDeductions" value={formData.insuranceDeductions || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Domestic Support Obligations" name="domesticSupport" value={formData.domesticSupport || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Union Dues" name="unionDues" value={formData.unionDues || ''} onChange={handleChange} type="number" step="0.01" />
                                    </div>
                                    <OtherDeductions personType="debtor" formData={formData} setFormData={setFormData} />
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-yellow-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-coins mr-2 text-law-blue"></i>Additional Income Sources</h3>
                                    <div className="space-y-6">
                                        <IncomeSourceItem title="Income from business operations?" name="businessIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Income from interest or dividends?" name="interestIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Income from alimony or family support?" name="alimonyIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Income from Unemployment?" name="unemploymentIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Income from Social Security?" name="socialSecurityIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Monetary government assistance?" name="governmentAssistance" formData={formData} handleChange={handleChange} showDescription={true} />
                                        <IncomeSourceItem title="Retirement or pension money?" name="retirementIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Any other source of income?" name="otherIncome" formData={formData} handleChange={handleChange} showDescription={true} />
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-yellow-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-chart-line mr-2 text-law-blue"></i>Expected Income Changes</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expecting any increase or decrease in salary next year?</label>
                                        <div className="flex space-x-4 mb-4">
                                            <label className="flex items-center"><input type="radio" name="salaryChange" value="no" checked={formData.salaryChange !== 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> No</label>
                                            <label className="flex items-center"><input type="radio" name="salaryChange" value="yes" checked={formData.salaryChange === 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> Yes</label>
                                        </div>
                                        {formData.salaryChange === 'yes' && (
                                            <TextareaField label="If yes, please describe:" name="salaryChangeDescription" value={formData.salaryChangeDescription || ''} onChange={handleChange} rows={3} placeholder="Describe the expected change in salary" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Part B & D for Spouse */}
            {formData.spouseEmployed && (
                 <>
                    {/* Part B: Spouse's Employer Information */}
                     <div id="partB" className="mb-12">
                         <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                             <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-heart mr-2 text-law-blue"></i>Part B. Spouse's Employer Information</h2>
                             <div className="space-y-6">
                                <div className="p-6 bg-white rounded-lg border border-green-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-building mr-2 text-law-blue"></i>Spouse's Primary Employer</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2"><TextareaField label="Name and Address of spouse's employer" name="spousePrimaryEmployerAddress" value={formData.spousePrimaryEmployerAddress || ''} onChange={handleChange} rows={3} placeholder="Company name and full address"/></div>
                                        <InputField label="How long has spouse been employed?" name="spousePrimaryEmploymentDuration" value={formData.spousePrimaryEmploymentDuration || ''} onChange={handleChange} placeholder="e.g., 3 years, 8 months"/>
                                        <InputField label="Spouse's Occupation (job title)" name="spousePrimaryOccupation" value={formData.spousePrimaryOccupation || ''} onChange={handleChange} placeholder="e.g., Teacher, Accountant"/>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-green-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800"><i className="fa-solid fa-building-user mr-2 text-law-blue"></i>Spouse's Second Employer</h3>
                                        <label className="flex items-center text-sm">
                                            <input type="checkbox" name="spouseHasSecondJob" checked={!!formData.spouseHasSecondJob} onChange={handleChange} className="mr-2" />
                                            <span className="text-gray-600">Spouse has a second job</span>
                                        </label>
                                    </div>
                                    {formData.spouseHasSecondJob && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2"><TextareaField label="Name and Address of spouse's second employer" name="spouseSecondEmployerAddress" value={formData.spouseSecondEmployerAddress || ''} onChange={handleChange} rows={3} placeholder="Company name and full address"/></div>
                                            <InputField label="How long employed at this job?" name="spouseSecondEmploymentDuration" value={formData.spouseSecondEmploymentDuration || ''} onChange={handleChange} placeholder="e.g., 6 months"/>
                                            <InputField label="Spouse's Occupation (job title)" name="spouseSecondOccupation" value={formData.spouseSecondOccupation || ''} onChange={handleChange} placeholder="Job title or description"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                     </div>

                    {/* Part D: Spouse's Wage Information */}
                    <div id="partD" className="mb-12">
                         <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-heart mr-2 text-law-blue"></i>Part D. Spouse's Wage Information</h2>
                            <div className="space-y-8">
                                <div className="p-6 bg-white rounded-lg border border-purple-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-money-check mr-2 text-law-blue"></i>Spouse's Paycheck Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Gross amount of spouse's paycheck" name="spouseGrossPaycheck" value={formData.spouseGrossPaycheck || ''} onChange={handleChange} type="number" step="0.01" />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">How often does spouse get paid?</label>
                                            <div className="space-y-2">
                                                 {['weekly', 'biweekly', 'semimonthly', 'monthly', 'other'].map(freq => (
                                                    <label key={freq} className="flex items-center">
                                                        <input type="radio" name="spousePayFrequency" value={freq} checked={formData.spousePayFrequency === freq} onChange={handleChange} className="mr-2 text-law-blue" />
                                                        {freq === 'weekly' ? 'Once a week' : freq === 'biweekly' ? 'Every two weeks' : freq === 'semimonthly' ? 'Twice a month' : freq === 'monthly' ? 'Once a month' : 'Other:'}
                                                        {freq === 'other' && formData.spousePayFrequency === 'other' && <InputField name="spousePayFrequencyOther" value={formData.spousePayFrequencyOther || ''} onChange={handleChange} className="ml-2 flex-1"/>}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <InputField label="Spouse's estimated overtime pay per month" name="spouseOvertimePay" value={formData.spouseOvertimePay || ''} onChange={handleChange} type="number" step="0.01" />
                                    </div>
                                </div>
                                 <div className="p-6 bg-white rounded-lg border border-purple-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-calculator mr-2 text-law-blue"></i>Spouse's Paycheck Deductions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Taxes, Medicare, Social Security (total)" name="spouseTaxDeductions" value={formData.spouseTaxDeductions || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Mandatory Retirement Contributions" name="spouseMandatoryRetirement" value={formData.spouseMandatoryRetirement || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Voluntary Retirement Contributions" name="spouseVoluntaryRetirement" value={formData.spouseVoluntaryRetirement || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Retirement Fund Loan Repayments" name="spouseRetirementLoans" value={formData.spouseRetirementLoans || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Insurance Deductions" name="spouseInsuranceDeductions" value={formData.spouseInsuranceDeductions || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Alimony or family support" name="spouseFamilySupport" value={formData.spouseFamilySupport || ''} onChange={handleChange} type="number" step="0.01" />
                                        <InputField label="Union Dues" name="spouseUnionDues" value={formData.spouseUnionDues || ''} onChange={handleChange} type="number" step="0.01" />
                                    </div>
                                    <OtherDeductions personType="spouse" formData={formData} setFormData={setFormData} />
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-purple-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-coins mr-2 text-law-blue"></i>Spouse's Additional Income</h3>
                                    <div className="space-y-6">
                                        <IncomeSourceItem title="Spouse's income from business?" name="spouseBusinessIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's income from interest/dividends?" name="spouseInterestIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's income from alimony/support?" name="spouseAlimonyIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's income from Unemployment?" name="spouseUnemploymentIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's income from Social Security?" name="spouseSocialSecurityIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's government assistance?" name="spouseGovernmentAssistance" formData={formData} handleChange={handleChange} showDescription={true} />
                                        <IncomeSourceItem title="Spouse's retirement/pension money?" name="spouseRetirementIncome" formData={formData} handleChange={handleChange} />
                                        <IncomeSourceItem title="Spouse's other income?" name="spouseOtherIncome" formData={formData} handleChange={handleChange} showDescription={true} />
                                    </div>
                                </div>
                                 <div className="p-6 bg-white rounded-lg border border-purple-300">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4"><i className="fa-solid fa-chart-line mr-2 text-law-blue"></i>Spouse's Expected Income Changes</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Is spouse expecting salary changes next year?</label>
                                        <div className="flex space-x-4 mb-4">
                                            <label className="flex items-center"><input type="radio" name="spouseSalaryChange" value="no" checked={formData.spouseSalaryChange !== 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> No</label>
                                            <label className="flex items-center"><input type="radio" name="spouseSalaryChange" value="yes" checked={formData.spouseSalaryChange === 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> Yes</label>
                                        </div>
                                        {formData.spouseSalaryChange === 'yes' && (
                                            <TextareaField label="If yes, please describe:" name="spouseSalaryChangeDescription" value={formData.spouseSalaryChangeDescription || ''} onChange={handleChange} rows={3} placeholder="Describe the expected change in spouse's salary" />
                                        )}
                                    </div>
                                </div>
                            </div>
                         </div>
                     </div>
                </>
            )}
        </div>
    );
}