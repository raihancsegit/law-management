'use client';
import { ChangeEvent } from 'react';
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Main component props type
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

/**
 * একটি সাধারণ খরচের ইনপুট ফিল্ডের জন্য Helper Component.
 */
const ExpenseInput = ({ label, name, formData, handleChange, helpText = "" }: { label: string, name: string, formData: any, handleChange: (e: ChangeEvent<any>) => void, helpText?: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {helpText && <p className="text-xs text-gray-500 mb-2">{helpText}</p>}
        <InputField type="number" step="0.01" name={name} value={formData[name] || ''} onChange={handleChange} />
    </div>
);

/**
 * পুনরাবৃত্তিমূলক (repeating) ইনপুট গ্রুপের জন্য Helper Component (e.g., Dependents, Other Utilities).
 */
const RepeatingField = ({ name, formData, setFormData, fields, addButtonText }: { name: string, formData: any, setFormData: (data: any) => void, fields: { name: string, label: string, type: string, placeholder: string }[], addButtonText: string }) => {
    const items = formData[name] || [{ id: Date.now() }];

    const handleItemChange = (index: number, fieldName: string, value: string) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [fieldName]: value };
        setFormData({ ...formData, [name]: updatedItems });
    };

    const addItem = () => {
        const newFields = fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
        setFormData({ ...formData, [name]: [...items, { id: Date.now(), ...newFields }] });
    };

    const removeItem = (indexToRemove: number) => {
        const updatedItems = items.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, [name]: updatedItems });
    };

    return (
        <div className="space-y-4">
            {items.map((item: any, index: number) => (
                <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg relative">
                    {fields.map(field => (
                        <div key={field.name} className={fields.length === 2 ? 'md:col-span-1' : 'md:col-span-2'}>
                            <InputField
                                label={field.label}
                                type={field.type}
                                value={item[field.name] || ''}
                                onChange={(e) => handleItemChange(index, field.name, e.target.value)}
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                    {items.length > 1 && (
                         <div className="md:col-span-2 text-right -mt-2">
                             <button type="button" onClick={() => removeItem(index)} className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium">
                                <i className="fa-solid fa-trash mr-1"></i>Remove
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button type="button" onClick={addItem} className="mt-4 px-4 py-2 border border-law-blue text-law-blue rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
            </button>
        </div>
    );
};


/**
 * Dependents অংশের জন্য একটি Helper Component.
 */
const DependentsSection = ({ formData, setFormData }: SectionProps) => {
    const dependents = formData.dependents || [{ id: Date.now(), relationship: '', age: '', livesWith: '' }];

    const handleDependentChange = (index: number, fieldName: string, value: string) => {
        const updatedDependents = [...dependents];
        updatedDependents[index][fieldName] = value;
        setFormData({ ...formData, dependents: updatedDependents });
    };

    const addDependent = () => {
        const newDependents = [...dependents, { id: Date.now(), relationship: '', age: '', livesWith: '' }];
        setFormData({ ...formData, dependents: newDependents });
    };

    const removeDependent = (indexToRemove: number) => {
        const updatedDependents = dependents.filter((_, index) => index !== indexToRemove);
        setFormData({ ...formData, dependents: updatedDependents });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">2. Please list all dependents of you and your spouse.</label>
            <div id="dependentsContainer" className="space-y-4">
                {dependents.map((dependent: any, index: number) => (
                    <div key={dependent.id || index} className="dependent-entry grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <InputField label="Relationship" value={dependent.relationship || ''} onChange={(e) => handleDependentChange(index, 'relationship', e.target.value)} placeholder="e.g., Child, Parent"/>
                        <InputField label="Age" type="number" value={dependent.age || ''} onChange={(e) => handleDependentChange(index, 'age', e.target.value)} />
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <InputField label="Who does the dependent live with?" value={dependent.livesWith || ''} onChange={(e) => handleDependentChange(index, 'livesWith', e.target.value)} placeholder="e.g., You, Spouse, Other"/>
                            </div>
                            {dependents.length > 1 && (
                                <button type="button" onClick={() => removeDependent(index)} className="px-3 py-2 text-red-600 hover:text-red-800" title="Remove Dependent">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addDependent} className="mt-4 px-4 py-2 border border-law-blue text-law-blue rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <i className="fa-solid fa-plus mr-2"></i> Add Dependent
            </button>
        </div>
    );
};

/**
 * একটি খরচের ইনপুট ফিল্ড, যা Yes/No টগলের সাথে শর্তসাপেক্ষে দেখানো হয়।
 */
const ExpenseInputWithToggle = ({ question, name, formData, handleChange }: { question: string, name: string, formData: any, handleChange: (e: ChangeEvent<any>) => void }) => {
    const hasExpense = formData[name] === 'yes';

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{question}</label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name={name} value="no" checked={formData[name] !== 'yes'} onChange={handleChange} className="mr-2 text-law-blue focus:ring-law-blue" />
                        No
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name={name} value="yes" checked={formData[name] === 'yes'} onChange={handleChange} className="mr-2 text-law-blue focus:ring-law-blue" />
                        Yes
                    </label>
                </div>
            </div>
            {hasExpense && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">If not included above, how much do you pay?</label>
                    <InputField type="number" step="0.01" name={`${name}Amount`} value={formData[`${name}Amount`] || ''} onChange={handleChange} />
                </div>
            )}
        </div>
    );
};

/**
 * Housing Expenses অংশের জন্য একটি সম্পূর্ণ Helper Component.
 */
const HousingExpensesSection = ({ formData, handleChange }: SectionProps & { handleChange: (e: ChangeEvent<any>) => void }) => {
    return (
        <div id="housingExpenses" className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200"><i className="fa-solid fa-home mr-2 text-law-blue"></i>Housing Expenses</h2>
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Indicate how much you pay for each item each month:</p>
            </div>
            <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">4. Primary Rent or Home Mortgage</h3>
                    <div className="space-y-4">
                        <ExpenseInput label="Monthly Amount" name="primaryRentMortgage" formData={formData} handleChange={handleChange} />
                        <ExpenseInputWithToggle question="Does that amount include real estate taxes?" name="includesRealEstateTaxes" formData={formData} handleChange={handleChange} />
                        <ExpenseInputWithToggle question="Does that amount include property, homeowner's, or renter's insurance?" name="includesInsurance" formData={formData} handleChange={handleChange} />
                         <ExpenseInputWithToggle question="Does that amount include any Home maintenance, repair, or upkeep expenses?" name="includesMaintenance" formData={formData} handleChange={handleChange} />
                         <ExpenseInputWithToggle question="Does that amount include any Homeowner's association or condominium dues?" name="includesHOA" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">5. Additional Mortgage Payments</h3>
                    <ExpenseInputWithToggle question="Are there Additional Mortgage payments?" name="additionalMortgage" formData={formData} handleChange={handleChange} />
                </div>
            </div>
        </div>
    );
};


/**
 * Monthly Living Expenses অংশের জন্য একটি সম্পূর্ণ Helper Component.
 */
const MonthlyExpensesSection = ({ formData, setFormData, handleChange }: SectionProps & { handleChange: (e: ChangeEvent<any>) => void }) => {
    return (
        <div id="monthlyExpenses" className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200"><i className="fa-solid fa-calendar mr-2 text-law-blue"></i>Monthly Living Expenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">6. Utilities</h3>
                    <div className="space-y-4">
                        <ExpenseInput label="a. Electricity and heating fuel" name="utilityElectricity" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="b. Water and sewer" name="utilityWaterSewer" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="c. Telephone service/long distance" name="utilityTelephone" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="d. Other (Cable, Internet, etc.)" name="utilityOther" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Living Expenses</h3>
                    <div className="space-y-4">
                        <ExpenseInput label="7. Food and housekeeping supplies" name="foodSupplies" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="8. Childcare and Children Education Costs" name="childcareEducation" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="9. Clothing, laundry, and dry cleaning" name="clothingLaundry" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="10. Personal care products and services" name="personalCare" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Health & Transportation</h3>
                    <div className="space-y-4">
                        <ExpenseInput label="11. Medical and dental expenses" name="medicalExpenses" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="12. Transportation (do NOT include car payments)" name="transportationExpenses" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="13. Recreation, entertainment, etc." name="recreationExpenses" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="14. Charitable contributions" name="charitableContributions" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">15. Insurance</h3>
                    <p className="text-xs text-gray-600 mb-4">(NOT deducted from wages or included in mortgage)</p>
                    <div className="space-y-4">
                        <ExpenseInput label="a. Life insurance" name="lifeInsurance" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="b. Health insurance" name="healthInsurance" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="c. Auto insurance" name="autoInsurance" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="d. Other insurance" name="otherInsurance" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">16. Tax bills NOT deducted from wages or included in mortgage</h3>
                    <RepeatingField
                        name="taxBills"
                        formData={formData}
                        setFormData={setFormData}
                        addButtonText="Add Tax Bill"
                        fields={[
                            { name: 'description', label: 'Description', type: 'text', placeholder: 'e.g., State taxes, Property taxes' },
                            { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Additional Expenses (707(b) Expenses for Form 122) অংশের জন্য একটি সম্পূর্ণ Helper Component.
 */
const BankruptcyExpensesSection = ({ formData, setFormData, handleChange }: SectionProps & { handleChange: (e: ChangeEvent<any>) => void }) => {
    return (
        <div id="bankruptcyExpenses" className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                <i className="fa-solid fa-gavel mr-2 text-law-blue"></i>
                Additional Expenses (707(b) Expenses for Form 122)
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    Due to the nature of the Federal Bankruptcy forms, please ignore the numbering and fill out everything that you can below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">17. Mandatory payroll deductions not already listed</h3>
                        <RepeatingField
                            name="payrollDeductions"
                            formData={formData}
                            setFormData={setFormData}
                            addButtonText="Add Payroll Deduction"
                            fields={[
                                { name: 'description', label: 'Description', type: 'text', placeholder: 'Description' },
                                { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                            ]}
                        />
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">19. Court ordered payments not already listed</h3>
                        <RepeatingField
                            name="courtOrderedPayments"
                            formData={formData}
                            setFormData={setFormData}
                            addButtonText="Add Court Ordered Payment"
                            fields={[
                                { name: 'description', label: 'Description', type: 'text', placeholder: 'Description' },
                                { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                            ]}
                        />
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">41. Non-mandatory contributions to retirement accounts</h3>
                        <p className="text-sm text-gray-600 mb-4">(including loan repayments)</p>
                        <RepeatingField
                            name="retirementContributions"
                            formData={formData}
                            setFormData={setFormData}
                            addButtonText="Add Retirement Contribution"
                            fields={[
                                { name: 'description', label: 'Account type/description', type: 'text', placeholder: 'Description' },
                                { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                            ]}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Specialized Expenses</h3>
                        <div className="space-y-4">
                            <ExpenseInput label="20. Education for employment or for a physically or mentally challenged child" name="specializedEducationExpense" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="21. Child care (day care, nursery & preschool, etc.)" name="childCareExpense" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="25. Disability Insurance (if not listed above)" name="specializedDisabilityInsurance" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="Health Savings Account" name="healthSavingsAccount" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="26. Care for elderly, chronically ill or disabled family members" name="elderCare" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="27. Protection from family violence" name="familyProtection" formData={formData} handleChange={handleChange} />
                            <ExpenseInput label="29. Education expense for your children under 18" name="childEducationExpense" formData={formData} handleChange={handleChange} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
/**
 * Additional Expenses অংশের জন্য একটি সম্পূর্ণ Helper Component.
 */
const AdditionalExpensesSection = ({ formData, setFormData, handleChange }: SectionProps & { handleChange: (e: ChangeEvent<any>) => void }) => {
    return (
        <div id="additionalExpenses" className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                <i className="fa-solid fa-receipt mr-2 text-law-blue"></i>
                Additional Expenses
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Installment Payments */}
                <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">17. Installment payments for car, furniture, etc.</h3>
                    <RepeatingField
                        name="installmentPayments"
                        formData={formData}
                        setFormData={setFormData}
                        addButtonText="Add Installment Payment"
                        fields={[
                            { name: 'description', label: 'Description', type: 'text', placeholder: 'e.g., Car loan, Furniture payment' },
                            { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                        ]}
                    />
                </div>

                {/* Support Payments */}
                <div className="p-6 bg-pink-50 rounded-lg border border-pink-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Support Payments</h3>
                    <div className="space-y-4">
                        <ExpenseInput label="18. Alimony, maintenance and support paid to others" name="alimonyPayments" formData={formData} handleChange={handleChange} />
                        <ExpenseInput label="19. Payments for support of additional dependents not living at your home" name="dependentSupport" formData={formData} handleChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Other Real Estate */}
            <div className="mt-6 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">20. Other Real Estate Property expenses</h3>
                <p className="text-sm text-gray-600 mb-4">(NOT included with Rent or Home Mortgage Property)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ExpenseInput label="a. Mortgage payment" name="otherRealEstateMortgage" formData={formData} handleChange={handleChange} />
                    <ExpenseInput label="b. Taxes" name="otherRealEstateTaxes" formData={formData} handleChange={handleChange} />
                    <ExpenseInput label="c. Insurance payments" name="otherRealEstateInsurance" formData={formData} handleChange={handleChange} />
                    <ExpenseInput label="d. Home maintenance" name="otherRealEstateMaintenance" formData={formData} handleChange={handleChange} />
                    <ExpenseInput label="e. Homeowner's association dues" name="otherRealEstateHOA" formData={formData} handleChange={handleChange} />
                </div>
            </div>

            {/* Other Expenses */}
            <div className="mt-6 p-6 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">21. Other expenses not listed elsewhere</h3>
                <RepeatingField
                    name="otherMiscExpenses"
                    formData={formData}
                    setFormData={setFormData}
                    addButtonText="Add Other Expense"
                    fields={[
                        { name: 'description', label: 'Description', type: 'text', placeholder: 'Describe the expense' },
                        { name: 'amount', label: 'Monthly Amount', type: 'number', placeholder: '' }
                    ]}
                />
            </div>

            {/* Expected Changes */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Expected Changes</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Describe any increase or decrease in expenses you expect to occur within the next year?</label>
                    <TextareaField name="expectedChanges" value={formData.expectedChanges || ''} onChange={handleChange} rows={4} placeholder="Describe any expected changes in your expenses..."/>
                </div>
            </div>
        </div>
    );
};

// মূল Section6 কম্পোনেন্ট
export default function Section6({ formData, setFormData }: SectionProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="text-sm text-amber-800 space-y-3">
                        <p><i className="fa-solid fa-exclamation-triangle mr-2"></i><strong>Important Instructions:</strong></p>
                        <p>Please list your normal, <strong>monthly average</strong> living expenses...</p>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div id="basicInfo" className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200"><i className="fa-solid fa-info-circle mr-2 text-law-blue"></i>Basic Information</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">1. Is this a Joint Filing with your Spouse?</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="jointFiling" value="no" checked={formData.jointFiling === 'no'} onChange={handleChange} className="mr-2 text-law-blue" /> No</label>
                            <label className="flex items-center"><input type="radio" name="jointFiling" value="yes" checked={formData.jointFiling === 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> Yes</label>
                        </div>
                    </div>
                    <DependentsSection formData={formData} setFormData={setFormData} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Do you and your spouse live separately?</label>
                        <div className="flex space-x-4">
                             <label className="flex items-center"><input type="radio" name="separateHouseholds" value="no" checked={formData.separateHouseholds !== 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> No</label>
                            <label className="flex items-center"><input type="radio" name="separateHouseholds" value="yes" checked={formData.separateHouseholds === 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> Yes</label>
                        </div>
                        {formData.separateHouseholds === 'yes' && (
                             <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">Please let your attorney know as an additional copy may be required.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">The following questions ask for your expenses each month...</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">3. Do your expenses include another person's expenses?</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="otherPersonExpenses" value="no" checked={formData.otherPersonExpenses !== 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> No</label>
                            <label className="flex items-center"><input type="radio" name="otherPersonExpenses" value="yes" checked={formData.otherPersonExpenses === 'yes'} onChange={handleChange} className="mr-2 text-law-blue" /> Yes</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Housing Expenses Section */}
            <HousingExpensesSection formData={formData} handleChange={handleChange} setFormData={setFormData} />

            {/* Monthly Expenses Section */}
            <MonthlyExpensesSection formData={formData} setFormData={setFormData} handleChange={handleChange} />

            <AdditionalExpensesSection formData={formData} setFormData={setFormData} handleChange={handleChange} />

             {/* Bankruptcy Expenses Section */}
            <BankruptcyExpensesSection formData={formData} setFormData={setFormData} handleChange={handleChange} />
            {/* পরবর্তী অংশগুলো (Additional Expenses, etc.) এখানে যোগ করা হবে */}
        </div>
    );
}