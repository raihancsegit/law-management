'use client';
import { ChangeEvent,useEffect ,useState } from 'react';
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Props টাইপ
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

// একটি একক রিয়েল এস্টেট এন্ট্রির জন্য কম্পוננט (চূড়ান্ত সমাধানসহ)
const RealEstateEntry = ({ entry, index, onUpdate, onRemove }: {
    entry: any; index: number;
    onUpdate: (index: number, updatedEntry: any) => void;
    onRemove: (index: number) => void;
}) => {
    
    // একটি জেনেরিক হ্যান্ডলার যা state key এবং event দুটোই গ্রহণ করতে পারে
    const handleEntryChange = (name: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value, type } = e.target;
        let newEntry = { ...entry };

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            const currentTypes = newEntry[name] || [];
            if(checked) {
                newEntry[name] = [...currentTypes, value];
            } else {
                newEntry[name] = currentTypes.filter((t: string) => t !== value);
            }
        } else {
             newEntry[name] = value;
        }
        onUpdate(index, newEntry);
    };

    // রেডিও বাটনের জন্য ডেডিকেটেড হ্যান্ডলার
    const handleRadioChange = (name: string, value: string) => {
        const newEntry = { ...entry, [name]: value };
        onUpdate(index, newEntry);
    }

    return (
        <div className="real-estate-entry p-6 bg-white rounded-lg border border-green-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <TextareaField label="Address and Description of Property" name="address" value={entry.address || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('address', e)} rows={3} placeholder="Enter address and description"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What is the property? (Check all that apply)</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                       {['Single-family home', 'Duplex or multi-unit building', 'Condominium or cooperative', 'Manufactured or mobile home', 'Land', 'Investment property', 'Timeshare', 'Other'].map(type => (
                           <label key={type} className="flex items-center">
                               <input type="checkbox" value={type} checked={Array.isArray(entry.propertyType) && entry.propertyType.includes(type)} onChange={(e) => handleEntryChange('propertyType', e)} className="mr-2"/> {type}
                           </label>
                       ))}
                    </div>
                </div>
                <div>
                    <InputField label="Estimated Value of Property" name="value" type="number" step="0.01" value={entry.value || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('value', e)} />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Owned by</label>
                     <p className="text-xs text-gray-600 mb-3">You, spouse, joint, etc.</p>
                     <div className="space-y-2">
                         <label className="flex items-center text-sm"><input type="radio" name={`owner-${index}`} value="you" checked={entry.owner === 'you'} onChange={() => handleRadioChange('owner', 'you')} className="mr-2"/> You</label>
                         <label className="flex items-center text-sm"><input type="radio" name={`owner-${index}`} value="spouse" checked={entry.owner === 'spouse'} onChange={() => handleRadioChange('owner', 'spouse')} className="mr-2"/> Spouse</label>
                         <label className="flex items-center text-sm"><input type="radio" name={`owner-${index}`} value="joint" checked={entry.owner === 'joint'} onChange={() => handleRadioChange('owner', 'joint')} className="mr-2"/> Joint</label>
                         <label className="flex items-center text-sm"><input type="radio" name={`owner-${index}`} value="other" checked={entry.owner === 'other'} onChange={() => handleRadioChange('owner', 'other')} className="mr-2"/> Other</label>
                     </div>
                </div>
                <div>
                    <InputField label="If not sole owner, % you own" name="ownershipPercentage" type="number" min="0" max="100" value={entry.ownershipPercentage || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('ownershipPercentage', e)} placeholder="e.g., 50"/>
                </div>
                 <div className="md:col-span-2 space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">Mortgages, Loans, and Liens</h4>
                    <TextareaField label="Who issued the loan? (Name and Address)" name="mortgageIssuer" value={entry.mortgageIssuer || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('mortgageIssuer', e)} rows={2} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Amount of the loan" name="mortgageAmount" type="number" step="0.01" value={entry.mortgageAmount || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('mortgageAmount', e)}/>
                        <InputField label="Current interest rate (%)" name="mortgageRate" type="number" step="0.01" value={entry.mortgageRate || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('mortgageRate', e)}/>
                        <InputField label="Monthly payment" name="mortgagePayment" type="number" step="0.01" value={entry.mortgagePayment || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('mortgagePayment', e)}/>
                        <InputField label="How many payments are left?" name="mortgagePaymentLeft" type="number" step="0.01" value={entry.mortgagePaymentLeft || ''} onChange={(e:ChangeEvent<any>) => handleEntryChange('mortgagePaymentLeft', e)}/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Does payment include taxes and/or insurance?</label>
                         <div className="flex space-x-4">
                             <label className="flex items-center text-sm"><input type="radio" name={`paymentIncludes-${index}`} value="no" checked={entry.paymentIncludes === 'no'} onChange={() => handleRadioChange('paymentIncludes', 'no')} className="mr-2"/> No</label>
                             <label className="flex items-center text-sm"><input type="radio" name={`paymentIncludes-${index}`} value="yes" checked={entry.paymentIncludes === 'yes'} onChange={() => handleRadioChange('paymentIncludes', 'yes')} className="mr-2"/> Yes</label>
                         </div>
                    </div>
                </div>
            </div>
            <button type="button" onClick={() => onRemove(index)} className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">
                <i className="fa-solid fa-trash mr-1"></i> Remove This Property
            </button>
        </div>
    );
};


// VehicleEntry (চূড়ান্ত সমাধানসহ)
const VehicleEntry = ({ entry, index, onUpdate, onRemove }: {
    entry: any; index: number;
    onUpdate: (index: number, updatedEntry: any) => void;
    onRemove: (index: number) => void;
}) => {
    
    // hasVehicle এবং অন্যান্য কন্ডিশনাল UI state সরাসরি entry থেকে আসছে
    const hasVehicle = entry.hasVehicle === 'yes';

    // একটি মাত্র handleChange ফাংশন যা সব ধরনের ইনপুট হ্যান্ডেল করবে
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const updatedEntry = { ...entry };

        if (type === 'checkbox') {
            // Checkbox logic can be added here if needed
        } else if (type === 'radio') {
            updatedEntry[name] = value;
        } else {
            updatedEntry[name] = value;
        }
        onUpdate(index, updatedEntry);
    };

    const handleRadioChange = (name: string, value: string) => {
        onUpdate(index, { ...entry, [name]: value });
    };

    return (
        <div className="vehicle-entry mb-6 p-4 bg-white rounded-lg border border-blue-300">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Vehicle #{index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you own this type of property?</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center text-sm">
                            <input type="radio" name="hasVehicle" value="no" checked={entry.hasVehicle === 'no'} onChange={(e) => handleRadioChange('hasVehicle', 'no')} className="mr-2"/> No
                        </label>
                        <label className="flex items-center text-sm">
                            <input type="radio" name="hasVehicle" value="yes" checked={entry.hasVehicle === 'yes'} onChange={(e) => handleRadioChange('hasVehicle', 'yes')} className="mr-2"/> Yes
                        </label>
                    </div>
                </div>
                
                {hasVehicle && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InputField label="Type of Vehicle" name="type" value={entry.type || ''} onChange={handleChange} placeholder="Car, Truck, SUV, etc."/>
                        <InputField label="Year" name="year" type="number" min="1900" max="2030" value={entry.year || ''} onChange={handleChange}/>
                        <InputField label="Make" name="make" value={entry.make || ''} onChange={handleChange} />
                        <InputField label="Model" name="model" value={entry.model || ''} onChange={handleChange} />
                        <InputField label="Mileage" name="mileage" type="number" value={entry.mileage || ''} onChange={handleChange} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Value of Property</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input type="number" name="value" value={entry.value || ''} onChange={handleChange} step="0.01" className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Owned by</label>
                            <div className="space-y-1">
                                <label className="flex items-center text-sm"><input type="radio" name={`vehicleOwner-${index}`} value="you" checked={entry.owner === 'you'} onChange={() => handleRadioChange('owner', 'you')} className="mr-2"/> You</label>
                                <label className="flex items-center text-sm"><input type="radio" name={`vehicleOwner-${index}`} value="spouse" checked={entry.owner === 'spouse'} onChange={() => handleRadioChange('owner', 'spouse')} className="mr-2"/> Spouse</label>
                                <label className="flex items-center text-sm"><input type="radio" name={`vehicleOwner-${index}`} value="joint" checked={entry.owner === 'joint'} onChange={() => handleRadioChange('owner', 'joint')} className="mr-2"/> Joint</label>
                                <label className="flex items-center text-sm"><input type="radio" name={`vehicleOwner-${index}`} value="other" checked={entry.owner === 'other'} onChange={() => handleRadioChange('owner', 'other')} className="mr-2"/> Other</label>
                            </div>
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                           <TextareaField label="Other Information" name="otherInfo" value={entry.otherInfo || ''} onChange={handleChange} rows={2} />
                        </div>
                    </div>
                )}
            </div>
             <button type="button" onClick={() => onRemove(index)} className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">
                <i className="fa-solid fa-trash mr-1"></i> Remove Vehicle
             </button>
        </div>
    );
};

const PropertyItem = ({ title, name, formData, handleChange, children = null, borderColorClass = 'border-gray-300' }: {
    title: string;
    name: string;
    formData: any;
    handleChange: (name: string, value: string | boolean, type?: string) => void;
    children?: React.ReactNode;
    borderColorClass?: string;
}) => {
    const hasProperty = formData[`has_${name}`] === 'yes';

    const onInputChange = (e: ChangeEvent<any>) => {
        handleChange(e.target.name, e.target.value);
    };
    
    const onRadioChange = (value: string) => {
        handleChange(`has_${name}`, value);
    };

    const onOwnerRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleChange(e.target.name, e.target.value);
    }

    return (
        <div className={`property-item p-4 bg-white rounded-lg border ${borderColorClass}`}>
            <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
            {children && <p className="text-sm text-gray-600 mb-4">{children}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you own this type of property?</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center text-sm">
                            <input type="radio" name={`has_${name}`} value="no" checked={formData[`has_${name}`] !== 'yes'} onChange={() => onRadioChange('no')} />
                            <span className="ml-2">No</span>
                        </label>
                        <label className="flex items-center text-sm">
                            <input type="radio" name={`has_${name}`} value="yes" checked={formData[`has_${name}`] === 'yes'} onChange={() => onRadioChange('yes')} />
                            <span className="ml-2">Yes</span>
                        </label>
                    </div>
                </div>
                {hasProperty && (
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <TextareaField label="Description" name={`${name}_description`} value={formData[`${name}_description`] || ''} onChange={onInputChange} rows={2} />
                            </div>
                            <div>
                                <InputField label="Value of Property" name={`${name}_value`} type="number" step="0.01" value={formData[`${name}_value`] || ''} onChange={onInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Owned by</label>
                                <p className="text-xs text-gray-600 mb-3">You, your spouse, both you and your spouse, etc.</p>
                                <div className="space-y-1">
                                    <label className="flex items-center text-sm"><input type="radio" name={`${name}_owner`} value="you" checked={formData[`${name}_owner`] === 'you'} onChange={onOwnerRadioChange} className='mr-2'/> You</label>
                                    <label className="flex items-center text-sm"><input type="radio" name={`${name}_owner`} value="spouse" checked={formData[`${name}_owner`] === 'spouse'} onChange={onOwnerRadioChange} className='mr-2'/> Spouse</label>
                                    <label className="flex items-center text-sm"><input type="radio" name={`${name}_owner`} value="joint" checked={formData[`${name}_owner`] === 'joint'} onChange={onOwnerRadioChange} className='mr-2'/> Joint</label>
                                    <label className="flex items-center text-sm"><input type="radio" name={`${name}_owner`} value="other" checked={formData[`${name}_owner`] === 'other'} onChange={onOwnerRadioChange} className='mr-2'/> Other</label>
                                </div>
                                {formData[`${name}_owner`] === 'other' && (
                                     <div className="mt-3">
                                        <InputField label="Specify other owner" name={`${name}_owner_other`} value={formData[`${name}_owner_other`] || ''} onChange={onInputChange} placeholder="Specify other owner"/>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Part D এর জন্য মাল্টি-এন্ট্রি কম্পোনেন্ট
const MultiEntryFinancialAccount = ({ title, name, itemNoun, formData, setFormData,itemBorderColorClass = 'border-yellow-300' }) => {
    const hasProperty = formData[`has_${name}`] === 'yes';
    const entries = formData[name] || [];

    const handleRadioChange = (value: string) => {
        setFormData({ ...formData, [`has_${name}`]: value });
    };

    const handleEntryChange = (index: number, fieldName: string, value: any) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [fieldName]: value };
        setFormData({ ...formData, [name]: updatedEntries });
    };

    const addEntry = () => {
        const newEntries = [...entries, { id: Date.now() }];
        setFormData({ ...formData, [name]: newEntries });
    };

    const removeEntry = (index: number) => {
        const updatedEntries = entries.filter((_, i) => i !== index);
        setFormData({ ...formData, [name]: updatedEntries });
    };
    
    return (
        <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any {itemNoun.toLowerCase()}s?</label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name={`has_${name}`} value="no" checked={!hasProperty} onChange={() => handleRadioChange('no')} className="mr-2" /> No
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name={`has_${name}`} value="yes" checked={hasProperty} onChange={() => handleRadioChange('yes')} className="mr-2" /> Yes
                    </label>
                </div>
            </div>
            {hasProperty && (
                <div className="mt-4 space-y-4">
                    {entries.map((entry, index) => (
                        <div key={entry.id || index} className={`p-4 bg-white rounded-lg border ${itemBorderColorClass}`}>
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="text-md font-medium text-gray-800">{itemNoun} #{index + 1}</h4>
                                <button type="button" onClick={() => removeEntry(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <TextareaField label="Description (name, bank, acc no.)" name="description" value={entry.description || ''} onChange={e => handleEntryChange(index, 'description', e.target.value)} rows={3}/>
                                </div>
                                <div>
                                    <InputField label="Value of Property" name="value" type="number" step="0.01" value={entry.value || ''} onChange={e => handleEntryChange(index, 'value', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owned by</label>
                                    <div className="space-y-1">
                                        {['you', 'spouse', 'joint', 'other'].map(ownerType => (
                                            <label key={ownerType} className="flex items-center">
                                                <input type="radio" name={`owner-${name}-${index}`} value={ownerType} checked={entry.owner === ownerType} onChange={() => handleEntryChange(index, 'owner', ownerType)} className="mr-2" /> {ownerType.charAt(0).toUpperCase() + ownerType.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                    {entry.owner === 'other' && (
                                        <div className="mt-3">
                                            <InputField label="Specify other owner" name="ownerOther" value={entry.ownerOther || ''} onChange={e => handleEntryChange(index, 'ownerOther', e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addEntry} className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors duration-200">
                        <i className="fa-solid fa-plus mr-2"></i> Add Another {itemNoun}
                    </button>
                </div>
            )}
        </div>
    );
};


// === মূল Section2 কম্পোনেন্ট ===
export default function Section2({ formData, setFormData }: SectionProps) {
    const realEstate = formData.realEstate || [];
    const [vehicles, setVehicles] = useState(formData.vehicles || [{ id: Date.now(), hasVehicle: 'no' }]);

     useEffect(() => {
        setFormData({ ...formData, vehicles });
    }, [vehicles]);
    
    const handleUpdateEntry = (index: number, updatedEntry: any) => {
        const updatedEntries = [...realEstate];
        updatedEntries[index] = updatedEntry;
        setFormData({ ...formData, realEstate: updatedEntries });
    };

    const handleAddEntry = () => {
        const newEntries = [...realEstate, { id: Date.now() }];
        setFormData({ ...formData, realEstate: newEntries });
    };
    
    const handleRemoveEntry = (indexToRemove: number) => {
        setFormData({ ...formData, realEstate: realEstate.filter((_: any, index: number) => index !== indexToRemove) });
    };
    
    const handleNoRealEstateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setFormData({ ...formData, noRealEstate: true, realEstate: [] });
        } else {
            setFormData({ ...formData, noRealEstate: false, realEstate: realEstate.length === 0 ? [{ id: Date.now() }] : realEstate });
        }
    };

     const handleUpdateVehicle = (index: number, updatedEntry: any) => {
        const updatedVehicles = [...vehicles];
        updatedVehicles[index] = updatedEntry;
        setVehicles(updatedVehicles);
    };

    const handleAddVehicle = () => setVehicles([...vehicles, { id: Date.now(), hasVehicle: 'no' }]);
    const handleRemoveVehicle = (index: number) => setVehicles(vehicles.filter((_:any, i:number) => i !== index));

    const handleNoVehicles = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, noVehicles: e.target.checked, vehicles: e.target.checked ? [] : (vehicles.length === 0 ? [{id: Date.now()}] : vehicles) });
    };


     const handleFormChange = (name: string, value: string | boolean) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const personalProperties = [
        { name: 'householdGoods', title: 'Household Goods and Furnishings' },
        { name: 'electronics', title: 'Electronics' },
        { name: 'collectibles', title: 'Collectibles of value' },
        { name: 'sportsEquipment', title: 'Sports, photo, exercise, and other hobby equipment' },
        { name: 'firearms', title: 'Firearms, ammunition, and related equipment' },
        { name: 'clothing', title: 'Clothing' },
        { name: 'jewelry', title: 'Jewelry' },
        { name: 'pets', title: 'Pets/non-farm animals' },
        { name: 'healthAids', title: 'Health aids and all other household items not listed' }
    ];

    const financialProperties = [
        { name: 'cash', title: 'Cash (spare change/money in your purse or wallet, cash not in accounts)' },
        { name: 'bonds', title: 'Bonds, mutual funds, and publicly traded stocks' },
        { name: 'nonPublicStocks', title: 'Non-publicly traded stocks and interests in businesses', children: 'Corporations, LLCs, partnerships, and joint ventures (list % of ownership)' },
        { name: 'governmentBonds', title: 'Government and corporate bonds and instruments', children: 'Including U.S. Savings Bonds' },
        { name: 'retirement1', title: 'Retirement, pension, or profit-sharing plan #1', children: 'IRA, 401(k), 403(b), etc. (list type and where held)'},
        { name: 'retirement2', title: 'Retirement, pension, or profit-sharing plan #2' },
        { name: 'retirement3', title: 'Retirement, pension, or profit-sharing plan #3' },
        { name: 'securityDeposits', title: 'Security deposits', children: 'Typically with landlord or utility (list holder)' },
        { name: 'prepayments', title: 'Prepayments', children: 'Prepaid rent, layaway, gift cards, etc.' },
        { name: 'annuities', title: 'Annuities', children: 'List company' },
        { name: 'educationAccounts', title: 'Education accounts', children: 'Education IRA, Sec. 529 or Sec. 530 account, state tuition plan' },
        { name: 'trusts', title: 'Trusts, life estates, future, and equitable interests', children: 'In property or assets' },
        { name: 'intellectualProperty', title: 'Intellectual property', children: 'Patents, copyrights, trademarks, etc.' },
        { name: 'licenses', title: 'Licenses, franchises, and other general intangibles' },
        { name: 'taxRefunds', title: 'Tax refunds owed to you', children: 'List years due' },
        { name: 'alimony', title: 'Alimony and child support' },
        { name: 'otherAmountsOwed', title: 'Other amounts someone owes you', children: 'Unpaid wages, disability benefits, sick pay, etc.' },
        { name: 'insuranceCashValue', title: 'Cash value of insurance policies', children: 'Whole or universal life, HSA, etc. (list company and beneficiary)' },
        { name: 'inheritances', title: 'Inheritances, estate distributions, and death benefits' },
        { name: 'personalInjury', title: 'Personal injury claims or awards' },
        { name: 'lawsuits', title: 'Lawsuits or claims against anyone for anything' },
        { name: 'otherClaims', title: 'All other claims or rights to sue someone' },
    ];

    const businessProperties = [
        { name: 'accountsReceivable', title: 'Accounts receivable or commissions earned', children: 'List' },
        { name: 'officeEquipment', title: 'Office equipment, furnishings, and supplies', children: 'List' },
        { name: 'machineryEquipment', title: 'Machinery, fixtures, equipment, business supplies, and tools of your trade', children: 'List' },
        { name: 'businessInventory', title: 'Business inventory', children: 'List' },
        { name: 'partnershipInterests', title: 'Interests in partnerships or joint ventures', children: 'Name and type of business, % interest' },
        { name: 'customerLists', title: 'Customer and mailing lists' },
        { name: 'otherBusinessProperty', title: 'Other business-related property not already listed' },
    ];

     const farmProperties = [
        { name: 'farmAnimals', title: 'Farm animals (livestock, poultry, farm-raised fish, etc.)' },
        { name: 'crops', title: 'Crops (growing or harvested)' },
        { name: 'farmEquipment', title: 'Farm and commercial fishing equipment, implements, machinery, fixtures, and tools of trade (list)' },
        { name: 'farmSupplies', title: 'Farm and commercial fishing supplies, chemicals, and feed (list)' },
    ];


    return (
        <div>
             <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <i className="fa-solid fa-info-circle mr-2"></i> Separately list assets in each category. List an asset only once.
                    </p>
                </div>
            </div>

            {/* Part A */}
            <div className="mb-12 p-6 bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    <i className="fa-solid fa-home mr-2 text-law-blue"></i>Part A. Residence, Building, Land, Other Real Estate
                </h2>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input type="checkbox" name="noRealEstate" checked={formData.noRealEstate || false} onChange={handleNoRealEstateChange} className="mr-2 h-4 w-4 rounded" />
                        <span className="text-sm font-medium text-gray-700">I do not own any real estate property</span>
                    </label>
                </div>
                {!formData.noRealEstate && (
                    <div className="space-y-6">
                        {realEstate.map((entry: any, index: number) => (
                            <RealEstateEntry key={entry.id || index} index={index} entry={entry} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry}/>
                        ))}
                        <button type="button" onClick={handleAddEntry} className="mt-4 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium">
                            <i className="fa-solid fa-plus mr-2"></i> Add Another Property
                        </button>
                    </div>
                )}
            </div>

            {/* Part B */}
            <div id="vehicles-section" className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-car mr-2 text-law-blue"></i>Part B. Cars, Vans, Trucks, etc.</h2>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input type="checkbox" name="noVehicles" checked={formData.noVehicles || false} onChange={handleNoVehicles} />
                        <span className="ml-2 text-sm">I do not own any vehicles</span>
                    </label>
                </div>
                {!formData.noVehicles && (
                     <div className="space-y-6">
                        {vehicles.map((entry: any, index: number) => (
                         <VehicleEntry key={entry.id || index} index={index} entry={entry} onUpdate={handleUpdateVehicle} onRemove={handleRemoveVehicle} />
                    ))}
                        <div className="flex justify-center">
                            <button type="button" onClick={handleAddVehicle} className="px-6 py-3 bg-law-blue text-white rounded-lg">
                                <i className="fa-solid fa-plus mr-2"></i> Add Another Vehicle
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Part C */}
            <div id="partC" className="mb-12 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-box mr-2 text-law-blue"></i>Part C. Personal and Household Items</h2>
                <div className="space-y-6">
                     {personalProperties.map(prop => (
                        <PropertyItem key={prop.name} title={prop.title} name={prop.name} formData={formData} handleChange={handleFormChange} />
                    ))}
                </div>
            </div>

            {/* Part D: Financial Assets (নতুন সেকশন) */}
            <div id="partD" className="mb-12">
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        <i className="fa-solid fa-money-bill mr-2 text-law-blue"></i> Part D. Financial Assets
                    </h2>
                    <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <i className="fa-solid fa-info-circle mr-2"></i> Make sure you also provide us with bank information for any account that you hold jointly (spouse, parent, child, etc...). If the money is not yours INDICATE in the description section.
                        </p>
                    </div>
                    <div className="space-y-6">
                        {/* Multi-entry items */}
                        <MultiEntryFinancialAccount title="Checking Accounts" name="checkingAccounts" itemNoun="Checking Account" formData={formData} setFormData={setFormData} />
                        <MultiEntryFinancialAccount title="Savings Accounts" name="savingsAccounts" itemNoun="Savings Account" formData={formData} setFormData={setFormData} />
                        <MultiEntryFinancialAccount title="Other Financial Accounts" name="otherFinancialAccounts" itemNoun="Other Financial Account" formData={formData} setFormData={setFormData} />
                        
                        {/* Single-entry items */}
                        {financialProperties.map(prop => (
                            <PropertyItem key={prop.name} title={prop.title} name={prop.name} formData={formData} handleChange={handleFormChange}>
                                {prop.children}
                            </PropertyItem>
                        ))}

                         <MultiEntryFinancialAccount title="Any other financial asset not listed" name="otherUnlistedAssets" itemNoun="Other Financial Asset" formData={formData} setFormData={setFormData} />
                    </div>
                </div>
            </div>

            <div id="partE" className="mb-12">
                <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        <i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>
                        Part E. Business-Related Assets
                    </h2>
                    <div className="space-y-6">
                        {businessProperties.map(prop => (
                            <PropertyItem
                                key={prop.name}
                                title={prop.title}
                                name={prop.name}
                                formData={formData}
                                handleChange={handleFormChange}
                                borderColorClass="border-orange-300" // নতুন prop ব্যবহার করা হয়েছে
                            >
                                {prop.children}
                            </PropertyItem>
                        ))}
                    </div>
                </div>
            </div>

             <div id="partF" className="mb-12">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        <i className="fa-solid fa-tractor mr-2 text-law-blue"></i>
                        Part F. Farm and Commercial Fishing-Related Property
                    </h2>
                    <div className="space-y-6">
                        {farmProperties.map(prop => (
                            <PropertyItem
                                key={prop.name}
                                title={prop.title}
                                name={prop.name}
                                formData={formData}
                                handleChange={handleFormChange}
                                borderColorClass="border-green-300" //borderColorClass prop ব্যবহার করা হয়েছে
                            >
                                {prop.children}
                            </PropertyItem>
                        ))}
                    </div>
                </div>
            </div>

             {/* Part G: Miscellaneous (নতুন সেকশন) */}
            <div id="partG" className="mb-12">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        <i className="fa-solid fa-ellipsis-h mr-2 text-law-blue"></i>
                        Part G. Miscellaneous
                    </h2>
                    
                    <MultiEntryFinancialAccount
                        title="All other property of any kind not previously listed"
                        name="otherMiscellaneousProperty" // formData তে এই নামে ডেটা সেভ হবে
                        itemNoun="Other Property"
                        formData={formData}
                        setFormData={setFormData}
                        itemBorderColorClass="border-gray-300" // নতুন prop ব্যবহার করে বর্ডারের রঙ পরিবর্তন করা হয়েছে
                    />
                </div>
            </div>
        </div>
    );
}