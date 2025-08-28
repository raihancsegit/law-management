'use client';
import { ChangeEvent, useEffect } from 'react'; // useEffect এখানে ইম্পোর্ট করা হয়েছে
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Main component props type
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

/**
 * একটি একক Secured Debt (সম্পত্তি দ্বারা সুরক্ষিত ঋণ) বিভাগের জন্য পুনঃব্যবহারযোগ্য কম্পোনেন্ট।
 */
const SecuredDebtCategory = ({ title, icon, debtType, theme, formData, setFormData, propertyPlaceholder, showLoanTypeField = false }: any) => {
    // --- useEffect এখান থেকে সরিয়ে ফেলা হয়েছে ---
    // Initialization logic is now handled by the parent Section3 component.

    const entries = formData[debtType] || [];
    const noDebtFlag = `no_${debtType}`;
    const isNoDebtChecked = formData[noDebtFlag] === true;

    const handleUpdateEntry = (index: number, fieldName: string, value: any) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [debtType]: updatedEntries });
    };
    
    const handleResponsibleChange = (index: number, value: string, checked: boolean) => {
        const currentResponsible = entries[index]?.responsible || [];
        let newResponsible;
        if (checked) {
            newResponsible = [...currentResponsible, value];
        } else {
            newResponsible = currentResponsible.filter((item: string) => item !== value);
        }
        handleUpdateEntry(index, 'responsible', newResponsible);
    };

    const handleAddEntry = () => {
        const newEntries = [...entries, { id: Date.now(), hasCodebtor: 'no', dispute: 'no', responsible: [] }];
        setFormData({ ...formData, [debtType]: newEntries, [noDebtFlag]: false });
    };

    const handleRemoveEntry = (index: number) => {
        const updatedEntries = entries.filter((_:any, i: number) => i !== index);
        setFormData({ ...formData, [debtType]: updatedEntries });
    };

    const handleNoDebtChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setFormData({ ...formData, [noDebtFlag]: true, [debtType]: [] });
        } else {
            setFormData({
                ...formData,
                [noDebtFlag]: false,
                [debtType]: entries.length === 0 ? [{ id: Date.now(), hasCodebtor: 'no', dispute: 'no', responsible: [] }] : entries
            });
        }
    };
    
    return (
        <div className={`bg-${theme}-50 border border-${theme}-200 rounded-lg p-6 mb-8`}>
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center`}>
                <i className={`fa-solid ${icon} mr-2 text-${theme}-600`}></i>
                {title}
            </h3>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" checked={isNoDebtChecked} onChange={handleNoDebtChange} className={`mr-2 text-${theme}-600 focus:ring-${theme}-500`} />
                    <span className="text-sm font-medium text-gray-700">I do not have any {debtType.replace(/([A-Z])/g, ' $1').toLowerCase()} debts</span>
                </label>
            </div>
            
            {!isNoDebtChecked && (
                <>
                    <div className="space-y-6">
                        {entries.map((entry: any, index: number) => (
                           <div key={entry.id || index} className={`bg-white border border-${theme}-300 rounded-lg p-6`}>
                                {showLoanTypeField && (
                                     <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                        <InputField label="Type of Loan/Property" name="loanType" value={entry.loanType || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="e.g., Equipment loan, etc." focusRingColor={`focus:ring-${theme}-500`} />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Column 1: Creditor Information */}
                                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Creditor Information</h4>
                                        <div className="space-y-4">
                                            <InputField label="1. Amount Owed" name="amount" value={entry.amount || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} type="number" step="0.01" focusRingColor={`focus:ring-${theme}-500`} />
                                            <TextareaField label="2. Creditor Name and Address" name="creditor" value={entry.creditor || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={3} placeholder="Full name and address" focusRingColor={`focus:ring-${theme}-500`} />
                                            <InputField label="3. Account Number" name="account" value={entry.account || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} focusRingColor={`focus:ring-${theme}-500`} />
                                            <InputField label="4. Date when debt was incurred" name="date" value={entry.date || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="MM/YYYY - MM/YYYY" focusRingColor={`focus:ring-${theme}-500`} />
                                            <TextareaField label="5. Contact person if different" name="contact" value={entry.contact || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={2} focusRingColor={`focus:ring-${theme}-500`} />
                                        </div>
                                    </div>
                                    {/* Column 2: Property Information */}
                                    <div className="lg:col-span-1 bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Property Information</h4>
                                        <div className="space-y-4">
                                            <TextareaField label="1. Describe property" name="property" value={entry.property || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={3} placeholder={propertyPlaceholder} focusRingColor="focus:ring-green-500" />
                                            <InputField label="2. Monthly payment" name="monthlyPayment" value={entry.monthlyPayment || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} type="number" step="0.01" focusRingColor="focus:ring-green-500" />
                                            <InputField label="3. Payments remaining" name="paymentsLeft" value={entry.paymentsLeft || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} type="number" focusRingColor="focus:ring-green-500" />
                                        </div>
                                    </div>
                                    {/* Column 3: Person(s) Responsible */}
                                    <div className="lg:col-span-1 bg-orange-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Person(s) Responsible/Codebtor</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Who owes the debt?</label>
                                                <div className="space-y-2">
                                                    {['self', 'spouse', 'joint', 'other'].map(type => (
                                                        <label key={type} className="flex items-center text-sm">
                                                            <input type="checkbox" value={type} checked={(entry.responsible || []).includes(type)} onChange={(e) => handleResponsibleChange(index, e.target.value, e.target.checked)} className="mr-2 text-orange-600 focus:ring-orange-500" />
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </label>
                                                    ))}
                                                    {(entry.responsible || []).includes('other') && (
                                                        <InputField name="responsibleOther" value={entry.responsibleOther || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="Specify other" className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500" focusRingColor="focus:ring-orange-500"/>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Is there a codebtor?</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center text-sm"><input type="radio" name={`hasCodebtor-${debtType}-${index}`} value="no" checked={entry.hasCodebtor !== 'yes'} onChange={() => handleUpdateEntry(index, 'hasCodebtor', 'no')} className="mr-2 text-orange-600 focus:ring-orange-500"/> No</label>
                                                    <label className="flex items-center text-sm"><input type="radio" name={`hasCodebtor-${debtType}-${index}`} value="yes" checked={entry.hasCodebtor === 'yes'} onChange={() => handleUpdateEntry(index, 'hasCodebtor', 'yes')} className="mr-2 text-orange-600 focus:ring-orange-500"/> Yes</label>
                                                </div>
                                                {entry.hasCodebtor === 'yes' && (
                                                    <TextareaField label="If yes, name and address:" name="codebtorDetails" value={entry.codebtorDetails || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" focusRingColor="focus:ring-orange-500"/>
                                                )}
                                            </div>
                                            <div className="border-t pt-3 mt-4">
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Do you dispute the debt?</label>
                                                <div className="flex space-x-4">
                                                    <label className="flex items-center text-sm"><input type="radio" name={`dispute-${debtType}-${index}`} value="no" checked={entry.dispute !== 'yes'} onChange={() => handleUpdateEntry(index, 'dispute', 'no')} className="mr-2 text-red-600 focus:ring-red-500"/> No</label>
                                                    <label className="flex items-center text-sm"><input type="radio" name={`dispute-${debtType}-${index}`} value="yes" checked={entry.dispute === 'yes'} onChange={() => handleUpdateEntry(index, 'dispute', 'yes')} className="mr-2 text-red-600 focus:ring-red-500"/> Yes</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => handleRemoveEntry(index)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                                        <i className="fa-solid fa-trash mr-2"></i> Remove Entry
                                    </button>
                                </div>
                           </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-lg hover:bg-${theme}-700 transition-colors duration-200 text-sm`}>
                        <i className="fa-solid fa-plus mr-2"></i> Add Another Entry
                    </button>
                </>
            )}
        </div>
    );
};


/**
 * একটি একক Unsecured Debt (সম্পত্তি দ্বারা সুরক্ষিত নয় এমন ঋণ) বিভাগের জন্য পুনঃব্যবহারযোগ্য কম্পোনেন্ট।
 * এটি সব ধরনের Credit Card, Medical, Tax, Student Loan Debts এর জন্য ব্যবহৃত হবে।
 */
/**
 * একটি একক Unsecured Debt (সম্পত্তি দ্বারা সুরক্ষিত নয় এমন ঋণ) বিভাগের জন্য পুনঃব্যবহারযোগ্য কম্পোনেন্ট।
 */
const UnsecuredDebtCategory = ({ title, icon, debtType, theme, formData, setFormData, showDebtTypeField = false }: any) => {
    const entries = formData[debtType] || [];
    const noDebtFlag = `no_${debtType}`;
    const isNoDebtChecked = formData[noDebtFlag] === true;

    const handleUpdateEntry = (index: number, fieldName: string, value: any) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [debtType]: updatedEntries });
    };

    const handleResponsibleChange = (index: number, value: string, checked: boolean) => {
        const currentResponsible = entries[index]?.responsible || [];
        let newResponsible;
        if (checked) {
            newResponsible = [...currentResponsible, value];
        } else {
            newResponsible = currentResponsible.filter((item: string) => item !== value);
        }
        handleUpdateEntry(index, 'responsible', newResponsible);
    };

    const handleAddEntry = () => {
        const newEntries = [...entries, { id: Date.now(), hasCodebtor: 'no', dispute: 'no', responsible: [] }];
        setFormData({ ...formData, [debtType]: newEntries, [noDebtFlag]: false });
    };

    const handleRemoveEntry = (index: number) => {
        const updatedEntries = entries.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, [debtType]: updatedEntries });
    };

    const handleNoDebtChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setFormData({ ...formData, [noDebtFlag]: true, [debtType]: [] });
        } else {
            setFormData({
                ...formData,
                [noDebtFlag]: false,
                [debtType]: entries.length === 0 ? [{ id: Date.now(), hasCodebtor: 'no', dispute: 'no', responsible: [] }] : entries
            });
        }
    };

    return (
        <div className={`bg-${theme}-50 border border-${theme}-200 rounded-lg p-6 mb-8`}>
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center`}>
                <i className={`fa-solid ${icon} mr-2 text-${theme}-600`}></i>
                {title}
            </h3>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" checked={isNoDebtChecked} onChange={handleNoDebtChange} className={`mr-2 text-${theme}-600 focus:ring-${theme}-500`} />
                    <span className="text-sm font-medium text-gray-700">I do not have any {debtType.replace(/([A-Z])/g, ' $1').toLowerCase()} debts</span>
                </label>
            </div>

            {!isNoDebtChecked && (
                <>
                    <div className="space-y-6">
                        {entries.map((entry: any, index: number) => (
                            <div key={entry.id || index} className={`bg-white border border-${theme}-300 rounded-lg p-6`}>
                                {/* --- নতুন শর্তসাপেক্ষ ব্লক --- */}
                                {showDebtTypeField && (
                                    <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <label className="block text-sm font-medium text-gray-800 mb-2">
                                            <i className="fa-solid fa-tag mr-2 text-amber-600"></i>
                                            Please Describe the Type of Debt
                                        </label>
                                        <p className="text-xs text-gray-600 mb-3">(e.g. unpaid rent, alimony or child support, etc.)</p>
                                        <InputField name="debtTypeDescription" value={entry.debtTypeDescription || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="Describe the type of debt..." focusRingColor="focus:ring-amber-500"/>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Column 1: Creditor Information */}
                                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Creditor Information</h4>
                                        <div className="space-y-4">
                                            <InputField label="1. Amount Owed" name="amount" value={entry.amount || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} type="number" step="0.01" focusRingColor={`focus:ring-${theme}-500`} />
                                            <TextareaField label="2. Creditor Name and Address" name="creditor" value={entry.creditor || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={3} placeholder="Full name and address" focusRingColor={`focus:ring-${theme}-500`} />
                                            <InputField label="3. Account Number" name="account" value={entry.account || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} focusRingColor={`focus:ring-${theme}-500`} />
                                            <InputField label="4. Date when debt was incurred" name="date" value={entry.date || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="MM/YYYY - MM/YYYY" focusRingColor={`focus:ring-${theme}-500`} />
                                            <TextareaField label="5. Contact person if different" name="contact" value={entry.contact || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={2} focusRingColor={`focus:ring-${theme}-500`} />
                                            <TextareaField label="6. Additional information" name="additionalInfo" value={entry.additionalInfo || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={2} placeholder="Additional information"/>
                                        </div>
                                    </div>
                                    {/* Column 2: Person(s) Responsible */}
                                    <div className="lg:col-span-1 bg-orange-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Person(s) Responsible/Codebtor</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Who owes the debt?</label>
                                                <div className="space-y-2">
                                                    {['self', 'spouse', 'joint', 'other'].map(type => (
                                                        <label key={type} className="flex items-center text-sm">
                                                            <input type="checkbox" value={type} checked={(entry.responsible || []).includes(type)} onChange={(e) => handleResponsibleChange(index, e.target.value, e.target.checked)} className="mr-2 text-orange-600 focus:ring-orange-500" />
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </label>
                                                    ))}
                                                    {(entry.responsible || []).includes('other') && (
                                                        <InputField name="responsibleOther" value={entry.responsibleOther || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} placeholder="Specify other" className="mt-1" focusRingColor="focus:ring-orange-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Is there a codebtor?</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center text-sm"><input type="radio" name={`hasCodebtor-${debtType}-${index}`} value="no" checked={entry.hasCodebtor !== 'yes'} onChange={() => handleUpdateEntry(index, 'hasCodebtor', 'no')} className="mr-2 text-orange-600 focus:ring-orange-500" /> No</label>
                                                    <label className="flex items-center text-sm"><input type="radio" name={`hasCodebtor-${debtType}-${index}`} value="yes" checked={entry.hasCodebtor === 'yes'} onChange={() => handleUpdateEntry(index, 'hasCodebtor', 'yes')} className="mr-2 text-orange-600 focus:ring-orange-500" /> Yes</label>
                                                </div>
                                                {entry.hasCodebtor === 'yes' && (
                                                    <TextareaField label="If yes, name and address:" name="codebtorDetails" value={entry.codebtorDetails || ''} onChange={(e) => handleUpdateEntry(index, e.target.name, e.target.value)} rows={2} className="mt-2" focusRingColor="focus:ring-orange-500" />
                                                )}
                                            </div>
                                            <div className="border-t pt-3 mt-4">
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Do you dispute the debt?</label>
                                                <div className="flex space-x-4">
                                                    <label className="flex items-center text-sm"><input type="radio" name={`dispute-${debtType}-${index}`} value="no" checked={entry.dispute !== 'yes'} onChange={() => handleUpdateEntry(index, 'dispute', 'no')} className="mr-2 text-red-600 focus:ring-red-500" /> No</label>
                                                    <label className="flex items-center text-sm"><input type="radio" name={`dispute-${debtType}-${index}`} value="yes" checked={entry.dispute === 'yes'} onChange={() => handleUpdateEntry(index, 'dispute', 'yes')} className="mr-2 text-red-600 focus:ring-red-500" /> Yes</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => handleRemoveEntry(index)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                                        <i className="fa-solid fa-trash mr-2"></i> Remove Entry
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-lg hover:bg-${theme}-700 transition-colors duration-200 text-sm`}>
                        <i className="fa-solid fa-plus mr-2"></i> Add Another Entry
                    </button>
                </>
            )}
        </div>
    );
};

// মূল Section3 কম্পোনেন্ট
export default function Section3({ formData, setFormData }: SectionProps) {
    
    // --- সমাধান: useEffect এখন Section3-তে ---
    useEffect(() => {
        // যে সকল ঋণ বিভাগের জন্য ডিফল্ট এন্ট্রি প্রয়োজন, তাদের তালিকা
        const debtTypesToInitialize = ['homeLoans', 'carLoans', 'otherSecuredLoans','majorCreditCards', 'departmentStoreCards', 'otherCreditCards', 'cashAdvances', 'medicalDebts','taxDebts','studentLoanDebts','otherDebts'];
        
        let needsUpdate = false;
        const updatedData = { ...formData };

        debtTypesToInitialize.forEach(debtType => {
            const noDebtFlag = `no_${debtType}`;
            const entriesExist = Array.isArray(updatedData[debtType]) && updatedData[debtType].length > 0;
            const noDebtFlagIsSet = updatedData[noDebtFlag] === true;

            // যদি কোনো এন্ট্রি না থাকে এবং "no debt" ফ্ল্যাগও true সেট করা না থাকে
            if (!entriesExist && !noDebtFlagIsSet) {
                updatedData[debtType] = [{ id: Date.now(), hasCodebtor: 'no', dispute: 'no', responsible: [] }];
                needsUpdate = true;
            }
        });

        // যদি কোনো পরিবর্তন হয়ে থাকে, তাহলে একবারেই state আপডেট করুন
        if (needsUpdate) {
            setFormData(updatedData);
        }
    }, []); // খালি dependency array মানে এই ইফেক্ট শুধুমাত্র একবার রান হবে।

    return (
        <div className="bg-white rounded-lg">
            <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                        <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                        List all debts and obligations. Include secured debts, unsecured debts, and any other financial obligations.
                    </p>
                </div>
            </div>

            {/* Part A: Debts Secured by Property */}
            <div id="partASection" className="mb-12">
                <div className="bg-blue-100 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-shield-alt mr-2 text-blue-600"></i>
                        Part A. Debts Secured by Property
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all debts that you owe OR that creditors claim you owe that are secured by property.</p>
                </div>

                <SecuredDebtCategory
                    title="Home Loans and/or Mortgages"
                    icon="fa-home"
                    debtType="homeLoans"
                    theme="blue"
                    formData={formData}
                    setFormData={setFormData}
                    propertyPlaceholder="Property address and description"
                />
                
                <SecuredDebtCategory
                    title="Car Loans"
                    icon="fa-car"
                    debtType="carLoans"
                    theme="purple"
                    formData={formData}
                    setFormData={setFormData}
                    propertyPlaceholder="Year, Make, Model, VIN"
                />

                <SecuredDebtCategory
                    title="Other Property Loans That Are Secured"
                    icon="fa-building"
                    debtType="otherSecuredLoans"
                    theme="indigo"
                    formData={formData}
                    setFormData={setFormData}
                    propertyPlaceholder="Equipment, jewelry, boat, etc."
                    showLoanTypeField={true}
                />
            </div>

            <div id="partBSection" className="mb-12">
                <div className="bg-red-100 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-credit-card mr-2 text-red-600"></i>
                        Part B. Credit Card Debts
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all credit card debts that you owe OR that creditors claim you owe.</p>
                </div>

                <UnsecuredDebtCategory
                    title="Major Credit Card Debts (Visa, Amex, etc.)"
                    icon="fa-credit-card"
                    debtType="majorCreditCards"
                    theme="red"
                    formData={formData}
                    setFormData={setFormData}
                />

                <UnsecuredDebtCategory
                    title="Department Store Credit Card Debts"
                    icon="fa-store"
                    debtType="departmentStoreCards"
                    theme="red"
                    formData={formData}
                    setFormData={setFormData}
                />

                <UnsecuredDebtCategory
                    title="Other Credit Card Debts (gas cards, etc.)"
                    icon="fa-gas-pump"
                    debtType="otherCreditCards"
                    theme="red"
                    formData={formData}
                    setFormData={setFormData}
                />

                <UnsecuredDebtCategory
                    title="Cash Advances"
                    icon="fa-money-bill-wave"
                    debtType="cashAdvances"
                    theme="red"
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

             {/* Part C: Medical Debts */}
            <div id="partCSection" className="mb-12">
                <div className="bg-blue-100 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-user-doctor mr-2 text-blue-600"></i>
                        Part C. Medical Debts
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all unpaid medical bill debts that you owe OR that creditors claim you owe.</p>
                </div>

                <UnsecuredDebtCategory
                    title="Unpaid Medical Bills"
                    icon="fa-stethoscope"
                    debtType="medicalDebts"
                    theme="blue"
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            <div id="partDSection" className="mb-12">
                <div className="bg-green-100 border-l-4 border-green-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-file-invoice-dollar mr-2 text-green-600"></i>
                        Part D. Tax Debts
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all unpaid tax debts that you owe OR that creditors claim you owe.</p>
                </div>

                <UnsecuredDebtCategory
                    title="Unpaid Taxes"
                    icon="fa-calculator"
                    debtType="taxDebts"
                    theme="green"
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {/* Part E: Student Loan Debts */}
            <div id="partESection" className="mb-12">
                <div className="bg-purple-100 border-l-4 border-purple-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-graduation-cap mr-2 text-purple-600"></i>
                        Part E. Student Loan Debts
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all Student Loan debts that you owe OR that creditors claim you owe.</p>
                </div>

                <UnsecuredDebtCategory
                    title="Student Loans"
                    icon="fa-school"
                    debtType="studentLoanDebts"
                    theme="purple"
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {/* Part F: Other Debts */}
            <div id="partFSection" className="mb-12">
                <div className="bg-amber-100 border-l-4 border-amber-500 p-6 mb-6 rounded-r-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        <i className="fa-solid fa-list mr-2 text-amber-600"></i>
                        Part F. Other Debts
                    </h2>
                    <p className="text-gray-700 text-sm">Please list below all debts not listed above that you owe OR that creditors claim you owe.</p>
                </div>

                <UnsecuredDebtCategory
                    title="Other Debts (e.g. unpaid rent, alimony or child support, service fees, other bank loans, or personal loans.)"
                    icon="fa-clipboard-list"
                    debtType="otherDebts"
                    theme="amber"
                    formData={formData}
                    setFormData={setFormData}
                    showDebtTypeField={true} // এই নতুন prop টি ব্যবহার করা হয়েছে
                />
            </div>
            
            {/* পরবর্তী সেকশনগুলো (Part B, C, etc.) এখানে যোগ করা হবে */}

        </div>
    );
}