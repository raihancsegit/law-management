'use client';
import { ChangeEvent, useEffect } from 'react';
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Main component props type
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

/**
 * প্রশ্ন ১: Previous Addresses এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PreviousAddressesSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'previousAddresses';
    const noneFlag = 'no_previousAddresses';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({
                ...formData,
                [dataKey]: [{ id: Date.now(), address: '', fromDate: '', toDate: '' }],
                [noneFlag]: false
            });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({
            ...formData,
            [noneFlag]: isChecked,
            [dataKey]: isChecked ? [] : [{ id: Date.now(), address: '', fromDate: '', toDate: '' }]
        });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => {
        setFormData({ ...formData, [dataKey]: [...entries, { id: Date.now(), address: '', fromDate: '', toDate: '' }] });
    };

    const removeEntry = (indexToRemove: number) => {
        const updatedEntries = entries.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    return (
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className="fa-solid fa-map-marker-alt mr-2 text-law-blue"></i>
                1. List every address where you have lived other than where you live now during the last 3 years.
            </h2>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if you have not lived at any other address in the last 3 years</span>
                </label>
            </div>

            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={entry.id || index} className="p-4 bg-white rounded-lg border border-blue-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-3">
                                        <TextareaField label="Previous Address(es)" value={entry.address || ''} onChange={(e) => handleEntryChange(index, 'address', e.target.value)} rows={3} placeholder="Street address, city, state, zip" />
                                    </div>
                                    <InputField label="From" type="date" value={entry.fromDate || ''} onChange={(e) => handleEntryChange(index, 'fromDate', e.target.value)} />
                                    <InputField label="To" type="date" value={entry.toDate || ''} onChange={(e) => handleEntryChange(index, 'toDate', e.target.value)} />
                                </div>
                                {entries.length > 1 && (
                                    <button type="button" onClick={() => removeEntry(index)} className="mt-3 text-red-600 hover:text-red-800 text-sm">
                                        <i className="fa-solid fa-trash mr-1"></i>Remove Address
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm inline-flex items-center">
                        <i className="fa-solid fa-plus mr-2"></i>Add Previous Address
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২: Community Property এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const CommunityPropertySection = ({ formData, setFormData }: SectionProps) => {
    // --- সমাধান: এখানে একটি লোকাল SelectField তৈরি করা হয়েছে ---
    const StateSelectField = ({ label, value, onChange, options }: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-law-blue focus:border-law-blue text-sm"
            >
                {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const dataKey = 'communityProperties';
    const noneFlag = 'no_communityProperty';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({
                ...formData,
                [dataKey]: [{ id: Date.now(), state: '', partnerInfo: '' }],
                [noneFlag]: false
            });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({
            ...formData,
            [noneFlag]: isChecked,
            [dataKey]: isChecked ? [] : [{ id: Date.now(), state: '', partnerInfo: '' }]
        });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => {
        setFormData({ ...formData, [dataKey]: [...entries, { id: Date.now(), state: '', partnerInfo: '' }] });
    };

    const removeEntry = (indexToRemove: number) => {
        const updatedEntries = entries.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const stateOptions = [
        { value: "", label: "Select State/Territory" },
        { value: "AZ", label: "Arizona" }, { value: "CA", label: "California" }, { value: "ID", label: "Idaho" },
        { value: "LA", label: "Louisiana" }, { value: "NV", label: "Nevada" }, { value: "NM", label: "New Mexico" },
        { value: "PR", label: "Puerto Rico" }, { value: "TX", label: "Texas" }, { value: "WA", label: "Washington" },
        { value: "WI", label: "Wisconsin" }
    ];

    return (
        <div className="p-6 bg-green-50 rounded-lg border border-green-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-users mr-2 text-law-blue"></i>2. Community Property Information (Last 8 Years)</h2>
            <p className="text-sm text-gray-600 mb-4">If you lived with a spouse or domestic partner in a community property state or territory within the last 8 years, list the state or territory where you lived and the name and current address of your spouse or domestic partner.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if you did not live with a spouse/domestic partner in a community property state</span>
                </label>
            </div>
            <div className="mb-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800"><i className="fa-solid fa-info-circle mr-2"></i><strong>Community property states:</strong> AZ, CA, ID, LA, NV, NM, PR, TX, WA, WI</p>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={entry.id || index} className="p-4 bg-white rounded-lg border border-green-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <StateSelectField label="Community Property State or Territory" value={entry.state || ''} onChange={(e:any) => handleEntryChange(index, 'state', e.target.value)} options={stateOptions} />
                                    <TextareaField label="Name and Address of Spouse or Domestic Partner" value={entry.partnerInfo || ''} onChange={(e) => handleEntryChange(index, 'partnerInfo', e.target.value)} rows={3} placeholder="Full name and current address" />
                                </div>
                                {entries.length > 1 && (
                                     <button type="button" onClick={() => removeEntry(index)} className="mt-3 text-red-600 hover:text-red-800 text-sm">
                                        <i className="fa-solid fa-trash mr-1"></i>Remove Entry
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm inline-flex items-center">
                        <i className="fa-solid fa-plus mr-2"></i>Add Community Property Entry
                    </button>
                </>
            )}
        </div>
    );
};


/**
 * একটি নির্দিষ্ট সময়কালের আয়ের তথ্য দেখানোর জন্য Helper Component।
 */
const IncomePeriod = ({ title, person, period, formData, setFormData, isOtherIncome = false }: any) => {
    const baseName = `${person}${period}`;
    const sourceName = `${baseName}OtherSource`;
    const wagesFlag = `${baseName}Wages`;
    const wagesAmount = `${wagesFlag}Amount`;
    const businessFlag = `${baseName}Business`;
    const businessAmount = `${businessFlag}Amount`;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div className={`income-period p-4 bg-yellow-50 rounded-lg border border-yellow-200`}>
            <h4 className="font-medium text-gray-700 mb-3">{title}</h4>
            {isOtherIncome ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextareaField label="Source of income (describe)" name={sourceName} value={formData[sourceName] || ''} onChange={handleChange} rows={2} />
                    <InputField label="Gross income (before deductions)" name={`${baseName}OtherAmount`} value={formData[`${baseName}OtherAmount`] || ''} onChange={handleChange} type="number" step="0.01" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center mb-2">
                            <input type="checkbox" name={wagesFlag} checked={!!formData[wagesFlag]} onChange={handleChange} className="mr-2" />
                            <span className="text-sm font-medium text-gray-700">Wages, commissions, bonuses, tips</span>
                        </label>
                        {formData[wagesFlag] && <InputField name={wagesAmount} value={formData[wagesAmount] || ''} onChange={handleChange} type="number" step="0.01" placeholder="Gross income" />}
                    </div>
                    <div>
                        <label className="flex items-center mb-2">
                            <input type="checkbox" name={businessFlag} checked={!!formData[businessFlag]} onChange={handleChange} className="mr-2" />
                            <span className="text-sm font-medium text-gray-700">Operating a business</span>
                        </label>
                        {formData[businessFlag] && <InputField name={businessAmount} value={formData[businessAmount] || ''} onChange={handleChange} type="number" step="0.01" placeholder="Gross income" />}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Debtor বা Spouse-এর আয়ের সম্পূর্ণ ব্লকটি পরিচালনা করার জন্য Helper Component।
 */
const IncomeBlock = ({ person, formData, setFormData, isOtherIncome = false }: any) => {
    const personTitle = person.charAt(0).toUpperCase() + person.slice(1);
    const periods = [
        { key: 'Current', title: 'January 1 of this year through date of case filing' },
        { key: 'Last', title: 'Last year (January 1 - December 31)' },
        { key: 'Before', title: 'The year before last (January 1 - December 31)' },
    ];
    
    return (
        <div className={`p-4 bg-white rounded-lg border border-yellow-300`}>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <i className={`fa-solid ${person === 'debtor' ? 'fa-user' : 'fa-heart'} mr-2 text-law-blue`}></i>
                {personTitle}
            </h3>
            <div className="space-y-4">
                {periods.map(period => (
                    <IncomePeriod key={period.key} title={period.title} person={person} period={period.key} formData={formData} setFormData={setFormData} isOtherIncome={isOtherIncome} />
                ))}
            </div>
        </div>
    );
};


/**
 * প্রশ্ন ৩: Employment Income এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const EmploymentIncomeSection = ({ formData, setFormData }: SectionProps) => {
    const noneFlag = 'no_employmentIncome';
    const hasSpouseIncomeFlag = 'hasSpouseEmploymentIncome';

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [noneFlag]: e.target.checked });
    };
    
    const handleSpouseToggle = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [hasSpouseIncomeFlag]: e.target.checked });
    };

    return (
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-dollar-sign mr-2 text-law-blue"></i>3. Total Income from Jobs and Businesses</h2>
            <p className="text-sm text-gray-700 mb-4">List the total amount of income received from all jobs and businesses during this year and the two previous calendar years.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no employment or business income</span>
                </label>
            </div>

            {!formData[noneFlag] && (
                <div className="space-y-6">
                    <IncomeBlock person="debtor" formData={formData} setFormData={setFormData} />
                    <div className="p-4 bg-white rounded-lg border border-yellow-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800"><i className="fa-solid fa-heart mr-2 text-law-blue"></i>Spouse (if applicable)</h3>
                            <label className="flex items-center text-sm">
                                <input type="checkbox" name={hasSpouseIncomeFlag} checked={!!formData[hasSpouseIncomeFlag]} onChange={handleSpouseToggle} className="mr-2" />
                                <span className="text-gray-600">Include spouse income</span>
                            </label>
                        </div>
                        {formData[hasSpouseIncomeFlag] && <div className="mt-4"><IncomeBlock person="spouse" formData={formData} setFormData={setFormData} /></div>}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ৪: Other Income এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const OtherIncomeSection = ({ formData, setFormData }: SectionProps) => {
    const noneFlag = 'no_otherIncome';
    const hasSpouseIncomeFlag = 'hasSpouseOtherIncome';

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [noneFlag]: e.target.checked });
    };

    const handleSpouseToggle = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [hasSpouseIncomeFlag]: e.target.checked });
    };
    
    return (
        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-chart-line mr-2 text-law-blue"></i>4. Other Income</h2>
            <p className="text-sm text-gray-700 mb-4">List any other income you received during this year and the two previous calendar years (e.g., benefits, gambling winnings, rent income).</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no other income</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                 <div className="space-y-6">
                    <IncomeBlock person="debtor" formData={formData} setFormData={setFormData} isOtherIncome={true} />
                    <div className="p-4 bg-white rounded-lg border border-purple-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800"><i className="fa-solid fa-heart mr-2 text-law-blue"></i>Spouse (if applicable)</h3>
                            <label className="flex items-center text-sm">
                                <input type="checkbox" name={hasSpouseIncomeFlag} checked={!!formData[hasSpouseIncomeFlag]} onChange={handleSpouseToggle} className="mr-2" />
                                <span className="text-gray-600">Include spouse other income</span>
                            </label>
                        </div>
                        {formData[hasSpouseIncomeFlag] && <div className="mt-4"><IncomeBlock person="spouse" formData={formData} setFormData={setFormData} isOtherIncome={true} /></div>}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ৫ এবং ৬: Consumer/Business Debt Payments এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const DebtPaymentSection = ({ title, questionNumber, icon, theme, instruction, noneCheckboxLabel, addButtonText, dataKey, formData, setFormData }: any) => {
    const entries = formData[dataKey] || [];
    const noneFlag = `no_${dataKey}`;

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({
                ...formData,
                [dataKey]: [{ id: Date.now(), paymentType: [] }],
                [noneFlag]: false
            });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({
            ...formData,
            [noneFlag]: isChecked,
            [dataKey]: isChecked ? [] : [{ id: Date.now(), paymentType: [] }]
        });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const handlePaymentTypeChange = (index: number, value: string, checked: boolean) => {
        const updatedEntries = [...entries];
        const currentTypes = updatedEntries[index].paymentType || [];
        let newTypes;
        if (checked) {
            newTypes = [...currentTypes, value];
        } else {
            newTypes = currentTypes.filter((type: string) => type !== value);
        }
        updatedEntries[index].paymentType = newTypes;
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };
    
    const addEntry = () => {
        setFormData({ ...formData, [dataKey]: [...entries, { id: Date.now(), paymentType: [] }] });
    };

    const removeEntry = (indexToRemove: number) => {
        const updatedEntries = entries.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const paymentOptions = ['mortgage', 'car', 'credit_card', 'loan_repayment', 'suppliers', 'other'];

    return (
        <div className={`p-6 bg-${theme}-50 rounded-lg border border-${theme}-200 mb-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className={`fa-solid ${icon} mr-2 text-law-blue`}></i>
                {`${questionNumber}. ${title}`}
            </h2>
            {instruction.map((p: string, i: number) => <p key={i} className={`text-sm ${i > 0 ? 'text-gray-600 italic' : 'text-gray-700'} mb-4`}>{p}</p>)}
            
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">{noneCheckboxLabel}</span>
                </label>
            </div>

            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={entry.id || index} className={`p-4 bg-white rounded-lg border border-${theme}-300`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Creditor" value={entry.creditorName || ''} onChange={(e) => handleEntryChange(index, 'creditorName', e.target.value)} rows={3} />
                                    <InputField label="Dates of Payment" value={entry.paymentDates || ''} onChange={(e) => handleEntryChange(index, 'paymentDates', e.target.value)} placeholder="Enter payment dates" />
                                    <InputField label="Total Amount Paid" type="number" step="0.01" value={entry.amountPaid || ''} onChange={(e) => handleEntryChange(index, 'amountPaid', e.target.value)} />
                                    <InputField label="Amount Still Owed" type="number" step="0.01" value={entry.amountOwed || ''} onChange={(e) => handleEntryChange(index, 'amountOwed', e.target.value)} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Was this payment for ...</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {paymentOptions.map(option => (
                                            <label key={option} className="flex items-center">
                                                <input type="checkbox" value={option} checked={(entry.paymentType || []).includes(option)} onChange={(e) => handlePaymentTypeChange(index, e.target.value, e.target.checked)} className="mr-2" />
                                                <span className="text-sm capitalize">{option.replace('_', ' ')}</span>
                                                {option === 'other' && <span className="text-sm mr-2">:</span>}
                                                {option === 'other' && (entry.paymentType || []).includes('other') && (
                                                    <InputField value={entry.paymentTypeOther || ''} onChange={(e) => handleEntryChange(index, 'paymentTypeOther', e.target.value)} placeholder="Specify" className="flex-1" />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm">
                                    <i className="fa-solid fa-trash mr-1"></i>Remove Entry
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-md hover:bg-${theme}-700 text-sm inline-flex items-center`}>
                        <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ৭ এবং ৮: Insider Payments/Transfers এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const InsiderPaymentSection = ({ title, questionNumber, icon, theme, instruction, noneCheckboxLabel, addButtonText, dataKey, formData, setFormData }: any) => {
    const entries = formData[dataKey] || [];
    const noneFlag = `no_${dataKey}`;

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({
                ...formData,
                [dataKey]: [{}],
                [noneFlag]: false
            });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({
            ...formData,
            [noneFlag]: isChecked,
            [dataKey]: isChecked ? [] : [{ id: Date.now() }]
        });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => {
        setFormData({ ...formData, [dataKey]: [...entries, { id: Date.now() }] });
    };

    const removeEntry = (indexToRemove: number) => {
        const updatedEntries = entries.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    return (
        <div className={`p-6 bg-${theme}-50 rounded-lg border border-${theme}-200 mb-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className={`fa-solid ${icon} mr-2 text-law-blue`}></i>
                {`${questionNumber}. ${title}`}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{instruction}</p>
            
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">{noneCheckboxLabel}</span>
                </label>
            </div>

            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={entry.id || index} className={`p-4 bg-white rounded-lg border border-${theme}-300`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <TextareaField label="Name and Address of Insider" value={entry.insiderName || ''} onChange={(e) => handleEntryChange(index, 'insiderName', e.target.value)} rows={3} />
                                    <InputField label="Dates of Payment" value={entry.paymentDates || ''} onChange={(e) => handleEntryChange(index, 'paymentDates', e.target.value)} placeholder="Enter payment dates" />
                                    <InputField label="Total Amount Paid" type="number" step="0.01" value={entry.amountPaid || ''} onChange={(e) => handleEntryChange(index, 'amountPaid', e.target.value)} />
                                    <InputField label="Amount Still Owed" type="number" step="0.01" value={entry.amountOwed || ''} onChange={(e) => handleEntryChange(index, 'amountOwed', e.target.value)} />
                                    <div className="lg:col-span-2">
                                        <TextareaField label="Reason for payment" value={entry.reason || ''} onChange={(e) => handleEntryChange(index, 'reason', e.target.value)} rows={2} placeholder="Explain the reason for payment" />
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeEntry(index)} className="mt-3 text-red-600 hover:text-red-800 text-sm">
                                    <i className="fa-solid fa-trash mr-1"></i>Remove Entry
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-md hover:bg-${theme}-700 text-sm inline-flex items-center`}>
                        <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ৯: Legal Proceedings এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const LegalProceedingsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'legalProceedings';
    const noneFlag = 'no_legalProceedings';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-gavel mr-2 text-law-blue"></i>9. Legal Proceedings (Past 1 Year)</h2>
            <p className="text-sm text-gray-600 mb-4">List any lawsuits, court actions, or administrative proceedings to which you are or were a party within the past 1 year.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no legal proceedings in past 1 year</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-gray-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <TextareaField label="Case Title and Case Number" value={entry.caseTitle || ''} onChange={(e) => handleEntryChange(index, 'caseTitle', e.target.value)} rows={2} />
                                    <TextareaField label="Nature of the Case" value={entry.caseNature || ''} onChange={(e) => handleEntryChange(index, 'caseNature', e.target.value)} rows={2} />
                                    <TextareaField label="Court or Agency and Location" value={entry.courtLocation || ''} onChange={(e) => handleEntryChange(index, 'courtLocation', e.target.value)} rows={2} />
                                    <TextareaField label="Status or Disposition" value={entry.caseStatus || ''} onChange={(e) => handleEntryChange(index, 'caseStatus', e.target.value)} rows={2} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="mt-3 text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Legal Proceeding</button>
                </>
            )}
        </div>
    );
};


/**
 * প্রশ্ন ১০: Property Repossession/Foreclosure এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PropertyRepossessionSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'propertyRepossessions';
    const noneFlag = 'no_propertyRepossessions';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{ repossessionType: [] }], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{ repossessionType: [] }] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };
    
    const handleTypeChange = (index: number, value: string, checked: boolean) => {
        const updatedEntries = [...entries];
        const currentTypes = updatedEntries[index].repossessionType || [];
        let newTypes;
        if (checked) {
            newTypes = [...currentTypes, value];
        } else {
            newTypes = currentTypes.filter((type: string) => type !== value);
        }
        updatedEntries[index].repossessionType = newTypes;
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, { repossessionType: [] }] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });
    
    const repossessionOptions = ['repossessed', 'foreclosed', 'garnished', 'attached_seized_levied'];

    return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-home mr-2 text-law-blue"></i>10. Property Repossession/Foreclosure (Past 1 Year)</h2>
            <p className="text-sm text-gray-600 mb-4">Describe all property that has been repossessed, foreclosed, garnished, attached, seized, or levied within the past 1 year.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no property repossession/foreclosure in past 1 year</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-red-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Creditor's Name and Address" value={entry.creditor || ''} onChange={(e) => handleEntryChange(index, 'creditor', e.target.value)} rows={3} />
                                    <TextareaField label="Description and Value of Property" value={entry.description || ''} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} rows={3} />
                                    <InputField label="Date" type="date" value={entry.date || ''} onChange={(e) => handleEntryChange(index, 'date', e.target.value)} />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Explain what happened</label>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {repossessionOptions.map(opt => (
                                                <label key={opt} className="flex items-center">
                                                    <input type="checkbox" value={opt} checked={(entry.repossessionType || []).includes(opt)} onChange={(e) => handleTypeChange(index, e.target.value, e.target.checked)} className="mr-2" />
                                                    <span className="text-sm capitalize">{opt.replace(/_/g, ', ')}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <TextareaField name="explanation" value={entry.explanation || ''} onChange={(e) => handleEntryChange(index, 'explanation', e.target.value)} rows={2} placeholder="Additional explanation..." />
                                    </div>
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Property Repossession</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১১: Setoffs by Creditors এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const SetoffsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'setoffs';
    const noneFlag = 'no_setoffs';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return (
        <div className="p-6 bg-cyan-50 rounded-lg border border-cyan-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-scale-balanced mr-2 text-law-blue"></i>11. Setoffs by Creditors (Last 90 Days)</h2>
            <p className="text-sm text-gray-600 mb-4">List all setoffs made by any creditor against a debt or deposit within 90 days before the filing of this case.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no setoffs by creditors in last 90 days</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-cyan-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Creditor's Name and Address" value={entry.creditorName || ''} onChange={(e) => handleEntryChange(index, 'creditorName', e.target.value)} rows={3} />
                                    <TextareaField label="Description of action taken by creditor" value={entry.actionDescription || ''} onChange={(e) => handleEntryChange(index, 'actionDescription', e.target.value)} rows={3} />
                                    <InputField label="Date Action Taken" type="date" value={entry.actionDate || ''} onChange={(e) => handleEntryChange(index, 'actionDate', e.target.value)} />
                                    <InputField label="Setoff Amount and Last 4 Digits of Account" value={entry.setoffAmount || ''} onChange={(e) => handleEntryChange(index, 'setoffAmount', e.target.value)} placeholder="Amount and account info" />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Setoff</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১২: Property in Possession of Assignee/Receiver এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PropertyInPossessionSection = ({ formData, setFormData }: SectionProps) => {
    const radioName = 'propertyInPossession';
    const hasProperty = formData[radioName] === 'yes';
    const dataKey = 'propertyInPossessionEntries';
    const entries = formData[dataKey] || [];

    const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value === 'yes' && entries.length === 0) {
            setFormData({ ...formData, [radioName]: value, [dataKey]: [{}] });
        } else {
            setFormData({ ...formData, [radioName]: value });
        }
    };
    
    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-handshake mr-2 text-law-blue"></i>12. Property in Possession of Assignee/Receiver</h2>
            <p className="text-sm text-gray-600 mb-2">Within the past 1 year, was any of your property in the possession of an assignee for the benefit of creditors, a court-appointed receiver, a custodian, or another official?</p>
            <div className="mb-4">
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name={radioName} value="no" checked={formData[radioName] !== 'yes'} onChange={handleRadioChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700">No</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name={radioName} value="yes" checked={formData[radioName] === 'yes'} onChange={handleRadioChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700">Yes</span>
                    </label>
                </div>
            </div>
            {hasProperty && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-indigo-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Assignee/Official" value={entry.assigneeName || ''} onChange={(e) => handleEntryChange(index, 'assigneeName', e.target.value)} rows={3} />
                                    <InputField label="Date of Assignment" type="date" value={entry.assignmentDate || ''} onChange={(e) => handleEntryChange(index, 'assignmentDate', e.target.value)} />
                                    <div className="lg:col-span-2">
                                        <TextareaField label="Terms of Assignment or Settlement" value={entry.assignmentTerms || ''} onChange={(e) => handleEntryChange(index, 'assignmentTerms', e.target.value)} rows={4} />
                                    </div>
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Assignment</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১৩: Gifts Made এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const GiftsMadeSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'giftsMade';
    const noneFlag = 'no_giftsMade';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-pink-50 rounded-lg border border-pink-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-gift mr-2 text-law-blue"></i>13. Gifts Made (Past 4 Years, $600+ per person)</h2>
            <p className="text-sm text-gray-600 mb-4">List any gifts that you made within the past 4 years that have a total value of more than $600 per person.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no gifts made over $600 per person in past 4 years</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-pink-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Recipient" value={entry.recipient || ''} onChange={(e) => handleEntryChange(index, 'recipient', e.target.value)} rows={3} />
                                    <InputField label="Relationship to You" value={entry.relationship || ''} onChange={(e) => handleEntryChange(index, 'relationship', e.target.value)} />
                                    <TextareaField label="Description of Gifts" value={entry.description || ''} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} rows={2} />
                                    <InputField label="Dates Gifts Given" value={entry.dates || ''} onChange={(e) => handleEntryChange(index, 'dates', e.target.value)} />
                                    <InputField label="Value" type="number" step="0.01" value={entry.value || ''} onChange={(e) => handleEntryChange(index, 'value', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Gift</button>
                </>
            )}
        </div>
    );
};


/**
 * প্রশ্ন ১৪: Charitable Contributions এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const CharitableContributionsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'charitableContributions';
    const noneFlag = 'no_charitableContributions';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });
    
    return(
        <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-hand-holding-heart mr-2 text-law-blue"></i>14. Charitable Contributions (Past 4 Years, $600+)</h2>
            <p className="text-sm text-gray-600 mb-4">List any gifts or contributions that you made to a charity within the past 4 years that have a total value of more than $600.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no charitable contributions over $600 in past 4 years</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-emerald-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Charity" value={entry.charityName || ''} onChange={(e) => handleEntryChange(index, 'charityName', e.target.value)} rows={3} />
                                    <TextareaField label="Description of Contribution" value={entry.description || ''} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} rows={3} />
                                    <InputField label="Contribution Date" type="date" value={entry.date || ''} onChange={(e) => handleEntryChange(index, 'date', e.target.value)} />
                                    <InputField label="Value" type="number" step="0.01" value={entry.value || ''} onChange={(e) => handleEntryChange(index, 'value', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Charitable Contribution</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১৫: Losses from Fire, Theft, Disaster, or Gambling এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const LossesSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'losses';
    const noneFlag = 'no_losses';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });
    
    return(
        <div className="p-6 bg-amber-50 rounded-lg border border-amber-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-fire mr-2 text-law-blue"></i>15. Losses from Fire, Theft, Disaster, or Gambling (Past 1 Year)</h2>
            <p className="text-sm text-gray-600 mb-4">List all losses from fire, theft, or other disaster, or gambling within the past 1 year.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no losses in past 1 year</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-amber-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Description of Property and How Loss Occurred" value={entry.lossDescription || ''} onChange={(e) => handleEntryChange(index, 'lossDescription', e.target.value)} rows={3} />
                                    <TextareaField label="Description of any Insurance Coverage" value={entry.lossInsurance || ''} onChange={(e) => handleEntryChange(index, 'lossInsurance', e.target.value)} rows={3} placeholder="Include amount insurance has paid" />
                                    <InputField label="Date of Loss" type="date" value={entry.lossDate || ''} onChange={(e) => handleEntryChange(index, 'lossDate', e.target.value)} />
                                    <InputField label="Value of Property Lost" type="number" step="0.01" value={entry.lossValue || ''} onChange={(e) => handleEntryChange(index, 'lossValue', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Loss</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১৬ এবং ১৭: Payments for Bankruptcy/Creditor Assistance এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PaymentConsultationSection = ({ title, questionNumber, icon, theme, instruction, noneCheckboxLabel, addButtonText, dataKey, formData, setFormData }: any) => {
    const entries = formData[dataKey] || [];
    const noneFlag = `no_${dataKey}`;

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return (
        <div className={`p-6 bg-${theme}-50 rounded-lg border border-${theme}-200 mb-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className={`fa-solid ${icon} mr-2 text-law-blue`}></i>
                {`${questionNumber}. ${title}`}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{instruction}</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">{noneCheckboxLabel}</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className={`p-4 bg-white rounded-lg border border-${theme}-300`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Person Paid" value={entry.payeeName || ''} onChange={(e) => handleEntryChange(index, 'payeeName', e.target.value)} rows={3} />
                                    <InputField label="Name of Person Who Made the Payment, if Not You" value={entry.payerName || ''} onChange={(e) => handleEntryChange(index, 'payerName', e.target.value)} />
                                    <TextareaField label="Description and Value of Any Property Transferred" value={entry.propertyTransferred || ''} onChange={(e) => handleEntryChange(index, 'propertyTransferred', e.target.value)} rows={2} />
                                    <InputField label="Date of Payment or Transfer" type="date" value={entry.paymentDate || ''} onChange={(e) => handleEntryChange(index, 'paymentDate', e.target.value)} />
                                    <InputField label="Amount of Payment" type="number" step="0.01" value={entry.paymentAmount || ''} onChange={(e) => handleEntryChange(index, 'paymentAmount', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-md hover:bg-${theme}-700 text-sm inline-flex items-center`}>
                        <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১৮ এবং ১৮.৫: Property Transfers এবং Asset Protection Transfers এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PropertyTransferSection = ({ title, questionNumber, icon, theme, instruction, noneCheckboxLabel, addButtonText, dataKey, formData, setFormData }: any) => {
    const entries = formData[dataKey] || [];
    const noneFlag = `no_${dataKey}`;

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return (
        <div className={`p-6 bg-${theme}-50 rounded-lg border border-${theme}-200 mb-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className={`fa-solid ${icon} mr-2 text-law-blue`}></i>
                {`${questionNumber}. ${title}`}
            </h2>
            {instruction.map((p: string, i: number) => <p key={i} className={`text-sm ${i > 1 ? 'italic' : 'text-gray-600'} mb-2`}>{p}</p>)}

            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">{noneCheckboxLabel}</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className={`p-4 bg-white rounded-lg border border-${theme}-300`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name, Address of Recipient & Relationship to You" value={entry.recipient || ''} onChange={(e) => handleEntryChange(index, 'recipient', e.target.value)} rows={3} />
                                    <TextareaField label="Description and Value of Property Transferred" value={entry.propertyDescription || ''} onChange={(e) => handleEntryChange(index, 'propertyDescription', e.target.value)} rows={3} />
                                    <TextareaField label="Describe Any Property/Payments Received in Exchange" value={entry.exchange || ''} onChange={(e) => handleEntryChange(index, 'exchange', e.target.value)} rows={3} />
                                    <InputField label="Date of Transfer" type="date" value={entry.transferDate || ''} onChange={(e) => handleEntryChange(index, 'transferDate', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-md hover:bg-${theme}-700 text-sm inline-flex items-center`}>
                        <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ১৯: Self-Settled Trust Transfers এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const TrustTransfersSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'trustTransfers';
    const noneFlag = 'no_trustTransfers';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-violet-50 rounded-lg border border-violet-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-landmark mr-2 text-law-blue"></i>19. Self-Settled Trust Transfers (Past 10 Years)</h2>
            <p className="text-sm text-gray-600 mb-4">List all property you transferred within the past 10 years to a self-settled trust or a similar device of which you are a beneficiary.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no trust transfers in past 10 years</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-violet-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <InputField label="Name of Trust" value={entry.trustName || ''} onChange={(e) => handleEntryChange(index, 'trustName', e.target.value)} />
                                    <TextareaField label="Description and Value of Property Transferred" value={entry.propertyDescription || ''} onChange={(e) => handleEntryChange(index, 'propertyDescription', e.target.value)} rows={3} />
                                    <InputField label="Date of Transfer" type="date" value={entry.transferDate || ''} onChange={(e) => handleEntryChange(index, 'transferDate', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Trust Transfer</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২০: Closed Financial Accounts এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const ClosedAccountsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'closedAccounts';
    const noneFlag = 'no_closedAccounts';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{ accountType: [] }], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{ accountType: [] }] });
    };
    
    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const handleTypeChange = (index: number, value: string, checked: boolean) => {
        const updatedEntries = [...entries];
        const currentTypes = updatedEntries[index].accountType || [];
        let newTypes;
        if (checked) {
            newTypes = [...currentTypes, value];
        } else {
            newTypes = currentTypes.filter((type: string) => type !== value);
        }
        updatedEntries[index].accountType = newTypes;
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, { accountType: [] }] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    const accountOptions = ['checking', 'savings', 'money_market', 'brokerage', 'other'];

    return(
         <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-university mr-2 text-law-blue"></i>20. Closed Financial Accounts (Past 1 Year)</h2>
            <p className="text-sm text-gray-600 mb-4">List all financial accounts and instruments held in your name that were closed, sold, moved, or transferred within the past 1 year.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no closed financial accounts in past 1 year</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-blue-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Institution" value={entry.institution || ''} onChange={(e) => handleEntryChange(index, 'institution', e.target.value)} rows={3} />
                                    <InputField label="Last 4 Digits of Account Number" value={entry.last4Digits || ''} onChange={(e) => handleEntryChange(index, 'last4Digits', e.target.value)} maxLength={4} placeholder="1234" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type of Account or Instrument</label>
                                        <div className="space-y-2">
                                            {accountOptions.map(opt => (
                                                <label key={opt} className="flex items-center">
                                                    <input type="checkbox" value={opt} checked={(entry.accountType || []).includes(opt)} onChange={(e) => handleTypeChange(index, e.target.value, e.target.checked)} className="mr-2" />
                                                    <span className="text-sm capitalize">{opt.replace('_', ' ')}</span>
                                                    {opt === 'other' && <span className="text-sm mr-2">:</span>}
                                                    {opt === 'other' && (entry.accountType || []).includes('other') && (
                                                        <InputField value={entry.accountTypeOther || ''} onChange={(e) => handleEntryChange(index, 'accountTypeOther', e.target.value)} placeholder="Specify" className="flex-1" />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <InputField label="Date Account Was Closed/Transferred" type="date" value={entry.closeDate || ''} onChange={(e) => handleEntryChange(index, 'closeDate', e.target.value)} />
                                    <InputField label="Last Balance Before Closing" type="number" step="0.01" value={entry.lastBalance || ''} onChange={(e) => handleEntryChange(index, 'lastBalance', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Closed Account</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২১ এবং ২২: Safe Deposit Boxes & Storage Units এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const DepositorySection = ({ title, questionNumber, icon, theme, instruction, noneCheckboxLabel, addButtonText, dataKey, formData, setFormData }: any) => {
    const entries = formData[dataKey] || [];
    const noneFlag = `no_${dataKey}`;

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className={`p-6 bg-${theme}-50 rounded-lg border border-${theme}-200 mb-8`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className={`fa-solid ${icon} mr-2 text-law-blue`}></i>
                {`${questionNumber}. ${title}`}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{instruction}</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">{noneCheckboxLabel}</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className={`p-4 bg-white rounded-lg border border-${theme}-300`}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label={`Name and Address of ${dataKey === 'safeDepositBoxes' ? 'Financial Institution' : 'Storage Facility'}`} value={entry.institution || ''} onChange={(e) => handleEntryChange(index, 'institution', e.target.value)} rows={3} />
                                    <TextareaField label="Name and Address of Anyone With Access" value={entry.access || ''} onChange={(e) => handleEntryChange(index, 'access', e.target.value)} rows={3} />
                                    <TextareaField label="Description of Contents" value={entry.contents || ''} onChange={(e) => handleEntryChange(index, 'contents', e.target.value)} rows={3} />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Do You Still Have It?</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input type="radio" name={`stillHave-${dataKey}-${index}`} value="no" checked={entry.stillHave === 'no'} onChange={(e) => handleEntryChange(index, 'stillHave', e.target.value)} className="mr-2" />
                                                <span className="text-sm">No</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="radio" name={`stillHave-${dataKey}-${index}`} value="yes" checked={entry.stillHave === 'yes'} onChange={(e) => handleEntryChange(index, 'stillHave', e.target.value)} className="mr-2" />
                                                <span className="text-sm">Yes</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className={`mt-4 px-4 py-2 bg-${theme}-600 text-white rounded-md hover:bg-${theme}-700 text-sm inline-flex items-center`}>
                        <i className="fa-solid fa-plus mr-2"></i>{addButtonText}
                    </button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২৩: Property Held for Others এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const PropertyHeldSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'propertyHeldForOthers';
    const noneFlag = 'no_propertyHeldForOthers';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-lime-50 rounded-lg border border-lime-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-hands-holding mr-2 text-law-blue"></i>23. Property Held for Others</h2>
            <p className="text-sm text-gray-600 mb-2">List all property that you hold or control that is owned by someone else.</p>
            <p className="text-sm text-gray-600 mb-4 italic">For example, boats, cars, or other assets at your home for friends or family.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no property held for others</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-lime-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address of Owner" value={entry.ownerName || ''} onChange={(e) => handleEntryChange(index, 'ownerName', e.target.value)} rows={3} />
                                    <TextareaField label="Location of Property" value={entry.propertyLocation || ''} onChange={(e) => handleEntryChange(index, 'propertyLocation', e.target.value)} rows={3} />
                                    <TextareaField label="Description of Property" value={entry.propertyDescription || ''} onChange={(e) => handleEntryChange(index, 'propertyDescription', e.target.value)} rows={3} />
                                    <InputField label="Value" type="number" step="0.01" value={entry.propertyValue || ''} onChange={(e) => handleEntryChange(index, 'propertyValue', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Property</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২৪: Environmental Law Violations এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const EnvironmentalViolationsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'environmentalViolations';
    const noneFlag = 'no_environmentalViolations';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });
    
    return(
        <div className="p-6 bg-green-50 rounded-lg border border-green-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-leaf mr-2 text-law-blue"></i>24. Environmental Law Violations</h2>
            <p className="text-sm text-gray-600 mb-2">List every site for which you received notice by a governmental unit that you may be liable under or in violation of an environmental law.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no environmental law violations</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-green-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Site Name and Address" value={entry.site || ''} onChange={(e) => handleEntryChange(index, 'site', e.target.value)} rows={3} />
                                    <TextareaField label="Name and Address of Governmental Unit" value={entry.governmentalUnit || ''} onChange={(e) => handleEntryChange(index, 'governmentalUnit', e.target.value)} rows={3} />
                                    <InputField label="Environmental Law, If You Know It" value={entry.environmentalLaw || ''} onChange={(e) => handleEntryChange(index, 'environmentalLaw', e.target.value)} />
                                    <InputField label="Date of Notice" type="date" value={entry.noticeDate || ''} onChange={(e) => handleEntryChange(index, 'noticeDate', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Violation</button>
                </>
            )}
        </div>
    );
};
/**
 * প্রশ্ন ২৫: Hazardous Material Releases এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const HazardousReleasesSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'hazardousReleases';
    const noneFlag = 'no_hazardousReleases';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-radiation mr-2 text-law-blue"></i>25. Hazardous Material Releases</h2>
            <p className="text-sm text-gray-600 mb-4">List every site for which you have notified a governmental unit of a hazardous material release.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no hazardous material releases</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-red-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Site Name and Address" value={entry.site || ''} onChange={(e) => handleEntryChange(index, 'site', e.target.value)} rows={3} />
                                    <TextareaField label="Name and Address of Governmental Unit" value={entry.governmentalUnit || ''} onChange={(e) => handleEntryChange(index, 'governmentalUnit', e.target.value)} rows={3} />
                                    <InputField label="Date of Notice" type="date" value={entry.noticeDate || ''} onChange={(e) => handleEntryChange(index, 'noticeDate', e.target.value)} />
                                    <InputField label="Environmental Law" value={entry.environmentalLaw || ''} onChange={(e) => handleEntryChange(index, 'environmentalLaw', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Release</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২৬: Environmental Legal Proceedings এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const EnvironmentalProceedingsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'environmentalProceedings';
    const noneFlag = 'no_environmentalProceedings';
    const entries = formData[dataKey] || [];
    
    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{ status: [] }], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{ status: [] }] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const handleStatusChange = (index: number, value: string, checked: boolean) => {
        const updatedEntries = [...entries];
        const currentStatus = updatedEntries[index].status || [];
        let newStatus;
        if (checked) {
            newStatus = [...currentStatus, value];
        } else {
            newStatus = currentStatus.filter((s: string) => s !== value);
        }
        updatedEntries[index].status = newStatus;
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, { status: [] }] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    const statusOptions = ['pending', 'on_appeal', 'concluded'];

    return(
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-balance-scale mr-2 text-law-blue"></i>26. Environmental Legal Proceedings</h2>
            <p className="text-sm text-gray-600 mb-4">List all judicial or administrative proceedings under any environmental law to which you have been a party.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no environmental legal proceedings</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-yellow-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <InputField label="Case Title and Case Number" value={entry.caseTitle || ''} onChange={(e) => handleEntryChange(index, 'caseTitle', e.target.value)} />
                                    <TextareaField label="Name and Address of Court or Agency" value={entry.court || ''} onChange={(e) => handleEntryChange(index, 'court', e.target.value)} rows={3} />
                                    <TextareaField label="Nature of the Case" value={entry.nature || ''} onChange={(e) => handleEntryChange(index, 'nature', e.target.value)} rows={3} />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status of the Case</label>
                                        <div className="space-y-2">
                                            {statusOptions.map(opt => (
                                                <label key={opt} className="flex items-center">
                                                    <input type="checkbox" value={opt} checked={(entry.status || []).includes(opt)} onChange={(e) => handleStatusChange(index, e.target.value, e.target.checked)} className="mr-2" />
                                                    <span className="text-sm capitalize">{opt.replace('_', ' ')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Proceeding</button>
                </>
            )}
        </div>
    );
};

/**
 * প্রশ্ন ২৭: Business Connections এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const BusinessConnectionsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'businessConnections';
    const noneFlag = 'no_businessConnections';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });

    return(
        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>27. Business Connections (Past 4 Years)</h2>
            <p className="text-sm text-gray-600 mb-4">List the name, address, nature of business, accountant, EIN, and dates of operation of every business you were connected with in the past 4 years.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no business connections in past 4 years</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-purple-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Business Name and Address" value={entry.businessName || ''} onChange={(e) => handleEntryChange(index, 'businessName', e.target.value)} rows={3} />
                                    <TextareaField label="Nature of Business" value={entry.businessNature || ''} onChange={(e) => handleEntryChange(index, 'businessNature', e.target.value)} rows={3} />
                                    <InputField label="Name of Accountant or Bookkeeper" value={entry.accountant || ''} onChange={(e) => handleEntryChange(index, 'accountant', e.target.value)} />
                                    <InputField label="Employer Identification Number (EIN)" value={entry.ein || ''} onChange={(e) => handleEntryChange(index, 'ein', e.target.value)} placeholder="XX-XXXXXXX" />
                                    <InputField label="Beginning and End Dates of Operation" value={entry.dates || ''} onChange={(e) => handleEntryChange(index, 'dates', e.target.value)} placeholder="MM/DD/YYYY - MM/DD/YYYY" />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Business Connection</button>
                </>
            )}
        </div>
    );
};


/**
 * প্রশ্ন ২৮: Financial Statements to Institutions এর জন্য ডেডিকেটেড কম্পোনেন্ট
 */
const FinancialStatementsSection = ({ formData, setFormData }: SectionProps) => {
    const dataKey = 'financialStatements';
    const noneFlag = 'no_financialStatements';
    const entries = formData[dataKey] || [];

    useEffect(() => {
        if (formData[dataKey] === undefined && formData[noneFlag] === undefined) {
            setFormData({ ...formData, [dataKey]: [{}], [noneFlag]: false });
        }
    }, []);

    const handleNoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData({ ...formData, [noneFlag]: isChecked, [dataKey]: isChecked ? [] : [{}] });
    };

    const handleEntryChange = (index: number, fieldName: string, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [dataKey]: updatedEntries });
    };

    const addEntry = () => setFormData({ ...formData, [dataKey]: [...entries, {}] });
    const removeEntry = (indexToRemove: number) => setFormData({ ...formData, [dataKey]: entries.filter((_: any, i: number) => i !== indexToRemove) });
    
    return(
        <div className="p-6 bg-cyan-50 rounded-lg border border-cyan-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4"><i className="fa-solid fa-chart-bar mr-2 text-law-blue"></i>28. Financial Statements to Institutions (Past 2 Years)</h2>
            <p className="text-sm text-gray-600 mb-4">List all financial institutions, creditors, or other parties to which you gave a financial statement about your business within the past 2 years.</p>
            <div className="mb-4">
                <label className="flex items-center">
                    <input type="checkbox" name={noneFlag} checked={!!formData[noneFlag]} onChange={handleNoneChange} className="mr-2" />
                    <span className="text-sm font-medium text-gray-700">NONE - Check if no financial statements given in past 2 years</span>
                </label>
            </div>
            {!formData[noneFlag] && (
                <>
                    <div className="space-y-4">
                        {entries.map((entry: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-cyan-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    <TextareaField label="Name and Address" value={entry.recipient || ''} onChange={(e) => handleEntryChange(index, 'recipient', e.target.value)} rows={3} />
                                    <InputField label="Date Issued" type="date" value={entry.dateIssued || ''} onChange={(e) => handleEntryChange(index, 'dateIssued', e.target.value)} />
                                </div>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(index)} className="text-red-600 hover:text-red-800 text-sm"><i className="fa-solid fa-trash mr-1"></i>Remove Entry</button>}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addEntry} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm inline-flex items-center"><i className="fa-solid fa-plus mr-2"></i>Add Financial Statement</button>
                </>
            )}
        </div>
    );
};
// মূল Section7 কম্পোনেন্ট
export default function Section7({ formData, setFormData }: SectionProps) {
    return (
        <div className="main-section7">
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <i className="fa-solid fa-flag-checkered text-green-600 mr-3 text-lg"></i>
                        <div>
                            <p className="text-sm font-medium text-gray-800 mb-1">Final Section - Statement of Financial Affairs</p>
                            <p className="text-sm text-gray-600">If you are filing jointly with your spouse, include information about both you and your spouse.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question 1: Previous Addresses */}
            <PreviousAddressesSection formData={formData} setFormData={setFormData} />

            {/* Question 2: Community Property */}
            <CommunityPropertySection formData={formData} setFormData={setFormData} />
            
            {/* Question 3: Employment Income */}
            <EmploymentIncomeSection formData={formData} setFormData={setFormData} />
            
            {/* Question 4: Other Income */}
            <OtherIncomeSection formData={formData} setFormData={setFormData} />

            {/* Question 5: Consumer Debt Payments */}
            <DebtPaymentSection
                title="Consumer Debt Payments ($600+ in Last 90 Days)"
                questionNumber={5}
                icon="fa-credit-card"
                theme="red"
                instruction={[
                    "If your debts are primarily consumer debts, list each creditor to whom you paid a total of $600 or more within the last 90 days.",
                    "Indicate the name and address of the creditor, dates of payment(s), amount paid, and amount still owing."
                ]}
                noneCheckboxLabel="NONE - Check if no consumer debt payments of $600+ in last 90 days"
                addButtonText="Add Consumer Debt Payment"
                dataKey="consumerDebtPayments"
                formData={formData}
                setFormData={setFormData}
            />

            {/* Question 6: Business Debt Payments */}
            <DebtPaymentSection
                title="Business Debt Payments ($6,425+ in Last 90 Days)"
                questionNumber={6}
                icon="fa-building"
                theme="orange"
                instruction={[
                    "If your debts are primarily non-consumer debts (business), list each creditor to whom you paid a total of $6,425 or more within the last 90 days.",
                    "Same thing here, but ONLY if your case is primarily a business case and its over $6,425."
                ]}
                noneCheckboxLabel="NONE - Check if no business debt payments of $6,425+ in last 90 days"
                addButtonText="Add Business Debt Payment"
                dataKey="businessDebtPayments"
                formData={formData}
                setFormData={setFormData}
            />

              {/* Question 7: Payments to Insiders */}
            <InsiderPaymentSection
                title="Payments to Insiders (Past 1 Year)"
                questionNumber={7}
                icon="fa-user-friends"
                theme="pink"
                instruction='List all payments that you made within the past 1 year to any "insider." ("Insiders" include your relatives, business partners, etc.)'
                noneCheckboxLabel="NONE - Check if no payments to insiders in past 1 year"
                addButtonText="Add Insider Payment"
                dataKey="insiderPayments"
                formData={formData}
                setFormData={setFormData}
            />

            {/* Question 8: Property Transfers Benefiting Insiders */}
            <InsiderPaymentSection
                title="Property Transfers Benefiting Insiders (Past 1 Year)"
                questionNumber={8}
                icon="fa-exchange-alt"
                theme="indigo"
                instruction='List all payments or transfers of property that you made within the past 1 year that benefitted an "insider."'
                noneCheckboxLabel="NONE - Check if no property transfers benefiting insiders in past 1 year"
                addButtonText="Add Property Transfer"
                dataKey="insiderPropertyTransfers"
                formData={formData}
                setFormData={setFormData}
            />

              {/* Question 9: Legal Proceedings */}
            <LegalProceedingsSection formData={formData} setFormData={setFormData} />

            {/* Question 10: Property Repossession/Foreclosure */}
            <PropertyRepossessionSection formData={formData} setFormData={setFormData} />

        {/* Question 11: Setoffs by Creditors */}
            <SetoffsSection formData={formData} setFormData={setFormData} />
            
            {/* Question 12: Property in Possession of Assignee/Receiver */}
            <PropertyInPossessionSection formData={formData} setFormData={setFormData} />


            {/* Question 13: Gifts Made */}
            <GiftsMadeSection formData={formData} setFormData={setFormData} />

            {/* Question 14: Charitable Contributions */}
            <CharitableContributionsSection formData={formData} setFormData={setFormData} />
            {/* পরবর্তী প্রশ্নগুলো এখানে যোগ করা হবে */}

            {/* Question 15: Losses */}
            <LossesSection formData={formData} setFormData={setFormData} />

             {/* Question 16: Payments for Bankruptcy Consultation */}
            <PaymentConsultationSection
                title="Payments for Bankruptcy Consultation (Past 1 Year)"
                questionNumber={16}
                icon="fa-gavel"
                theme="slate"
                instruction="List all payments made or property transferred by you or someone on your behalf to anyone you consulted about filing for bankruptcy within the past 1 year."
                noneCheckboxLabel="NONE - Check if no payments for bankruptcy consultation in past 1 year"
                addButtonText="Add Payment"
                dataKey="bankruptcyPayments"
                formData={formData}
                setFormData={setFormData}
            />

            <PaymentConsultationSection
                title="Payments to Creditor Assistance Services (Past 1 Year)"
                questionNumber={17}
                icon="fa-handshake"
                theme="rose"
                instruction="List all payments made or property transferred within the past 1 year to anyone who promised to help you deal with your creditors."
                noneCheckboxLabel="NONE - Check if no payments to creditor assistance services in past 1 year"
                addButtonText="Add Payment"
                dataKey="creditorAssistancePayments"
                formData={formData}
                setFormData={setFormData}
            />

             {/* Question 18: Property Transfers */}
            <PropertyTransferSection
                title="Property Transfers (Past 4 Years)"
                questionNumber="18"
                icon="fa-exchange-alt"
                theme="teal"
                instruction={[
                    "List all property, other than in the ordinary course of your business, that you sold, traded, or transferred within the past 4 years.",
                    "This is a catch all question. If you have transferred anything at all in the past 4 years, list it here."
                ]}
                noneCheckboxLabel="NONE - Check if no property transfers in past 4 years"
                addButtonText="Add Transfer"
                dataKey="propertyTransfers"
                formData={formData}
                setFormData={setFormData}
            />
            
            {/* Question 18.5: Asset Protection Transfers */}
            <PropertyTransferSection
                title="Asset Protection Transfers"
                questionNumber="18.5"
                icon="fa-shield-alt"
                theme="orange"
                instruction={[
                    "THIS IS NOT A STANDARD QUESTION BUT CAN COME UP ON OCCASION. An honest answer can save you a lot of trouble.",
                    "Have you ever transferred any assets out of your name for less than fair market value, in contemplation of a future business transaction, or for asset protection?"
                ]}
                noneCheckboxLabel="NONE - Check if no asset protection transfers"
                addButtonText="Add Transfer"
                dataKey="assetProtectionTransfers"
                formData={formData}
                setFormData={setFormData}
            />

             {/* Question 19: Self-Settled Trust Transfers */}
            <TrustTransfersSection formData={formData} setFormData={setFormData} />
            
            {/* Question 20: Closed Financial Accounts */}
            <ClosedAccountsSection formData={formData} setFormData={setFormData} />

            <DepositorySection
                title="Safe Deposit Boxes (Past 1 Year)"
                questionNumber="21"
                icon="fa-vault"
                theme="gray"
                instruction="List each safe deposit box or other depository for securities, cash, or other valuables that you have had within the past 1 year."
                noneCheckboxLabel="NONE - Check if no safe deposit boxes in past 1 year"
                addButtonText="Add Safe Deposit Box"
                dataKey="safeDepositBoxes"
                formData={formData}
                setFormData={setFormData}
            />

            {/* Question 22: Storage Units */}
            <DepositorySection
                title="Storage Units (Past 1 Year)"
                questionNumber="22"
                icon="fa-warehouse"
                theme="stone"
                instruction="List any storage unit or place other than your home in which you have stored property within the past 1 year."
                noneCheckboxLabel="NONE - Check if no storage units in past 1 year"
                addButtonText="Add Storage Unit"
                dataKey="storageUnits"
                formData={formData}
                setFormData={setFormData}
            />

            {/* Question 23: Property Held for Others */}
            <PropertyHeldSection formData={formData} setFormData={setFormData} />

            {/* Question 24: Environmental Law Violations */}
            <EnvironmentalViolationsSection formData={formData} setFormData={setFormData} />

             {/* Question 25: Hazardous Material Releases */}
            <HazardousReleasesSection formData={formData} setFormData={setFormData} />

            {/* Question 26: Environmental Legal Proceedings */}
            <EnvironmentalProceedingsSection formData={formData} setFormData={setFormData} />

            {/* Question 27: Business Connections */}
            <BusinessConnectionsSection formData={formData} setFormData={setFormData} />

            {/* Question 28: Financial Statements to Institutions */}
            <FinancialStatementsSection formData={formData} setFormData={setFormData} />

        </div>
    );
}