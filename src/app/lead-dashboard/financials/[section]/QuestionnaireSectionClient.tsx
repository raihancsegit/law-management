'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveFinancialsProgress } from '@/app/actions/userActions';

type Props = {
    sectionNumber: number;
    initialData: any;
    sectionTitle: string;
};

// Input Field Helper Component
const InputField = ({ label, name, value, onChange, required=false, type='text', ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && '*'}</label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange}
            required={required} 
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue" 
            {...props} 
        />
    </div>
);

// Select Field Helper Component
const SelectField = ({ label, name, value, onChange, required=false, children }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && '*'}</label>
        <select 
            name={name} 
            value={value || ''} 
            onChange={onChange}
            required={required} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue"
        >
            {children}
        </select>
    </div>
);

// Radio Group Helper Component
const RadioGroup = ({ label, name, value, onChange, options }: any) => (
     <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-4">
            {options.map((option: string) => (
                <label key={option} className="flex items-center">
                    <input type="radio" name={name} value={option.toLowerCase()} checked={value === option.toLowerCase()} onChange={onChange} className="mr-2 text-law-blue focus:ring-law-blue" />
                    {option}
                </label>
            ))}
        </div>
    </div>
);


export default function QuestionnaireSectionClient({ sectionNumber, initialData, sectionTitle }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData || {});
    const [isSaving, setIsSaving] = useState(false);

    // Conditional UI state
    const [showOtherNames, setShowOtherNames] = useState(initialData?.otherNames === 'yes');
    const [showBusinessNames, setShowBusinessNames] = useState(initialData?.businessNames === 'yes');
    const [showPreviousAddress, setShowPreviousAddress] = useState(initialData?.lived180Days === 'no' || initialData?.lived730Days === 'no');

    const [showBankruptcyLast8Details, setShowBankruptcyLast8Details] = useState(initialData?.bankruptcyLast8Years === 'yes');
    const [showDismissalDate, setShowDismissalDate] = useState(initialData?.bankruptcyDismissed === 'yes');
    const [showRelatedBankruptcyDetails, setShowRelatedBankruptcyDetails] = useState(initialData?.relatedBankruptcyCases === 'yes');

     const [showEvictionDetails, setShowEvictionDetails] = useState(initialData?.evictionPending === 'yes');

      // === নতুন পরিবর্তন: Part E-এর জন্য state যোগ ===
    const [showBusinessDetails, setShowBusinessDetails] = useState(initialData?.soleProprietor === 'yes');
    
    // === নতুন পরিবর্তন: Part F-এর জন্য state যোগ ===
    const [showHazardousPropertyDetails, setShowHazardousPropertyDetails] = useState(initialData?.hazardousProperty === 'yes');

    // form ডেটা পরিবর্তন হ্যান্ডেল করার ফাংশন
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let newFormData = { ...formData };
        
        if (type === 'radio') {
            newFormData[name] = value;
            if (name === 'otherNames') setShowOtherNames(value === 'yes');
            if (name === 'businessNames') setShowBusinessNames(value === 'yes');
            if (name === 'lived180Days' || name === 'lived730Days') {
                // `value` ব্যবহার করা হচ্ছে, কারণ state অ্যাসিঙ্ক্রোনাস
                const lived180 = name === 'lived180Days' ? value : newFormData.lived180Days;
                const lived730 = name === 'lived730Days' ? value : newFormData.lived730Days;
                setShowPreviousAddress(lived180 === 'no' || lived730 === 'no');
            }
             // === নতুন পরিবর্তন: Part C-এর radio বাটনಗಳ জন্য লজিক যোগ ===
            if (name === 'bankruptcyLast8Years') setShowBankruptcyLast8Details(value === 'yes');
            if (name === 'bankruptcyDismissed') setShowDismissalDate(value === 'yes');
            if (name === 'relatedBankruptcyCases') setShowRelatedBankruptcyDetails(value === 'yes');
            // === নতুন পরিবর্তন: Part D-এর radio বাটনের জন্য লজিক যোগ ===
            if (name === 'evictionPending') setShowEvictionDetails(value === 'yes');

             // === নতুন পরিবর্তন: Part E-এর radio বাটনের জন্য লজিক যোগ ===
             if (name === 'soleProprietor') setShowBusinessDetails(value === 'yes'); 

              // === নতুন পরিবর্তন: Part F-এর radio বাটনের জন্য লজিক যোগ ===
            if (name === 'hazardousProperty') setShowHazardousPropertyDetails(value === 'yes');
        } else {
            newFormData[name] = value;
        }
        
        setFormData(newFormData);
    };
    
    const handleSaveProgress = async (shouldNavigate: boolean = false) => {
        setIsSaving(true);
        const result = await saveFinancialsProgress(formData);
        setIsSaving(false);

        if (result.error) {
            alert(`Error saving progress: ${result.error}`);
        } else {
            if (shouldNavigate) {
                const nextSection = sectionNumber + 1;
                // মোট ৭টি সেকশন আছে ধরে নিচ্ছি
                if (nextSection <= 7) { 
                    router.push(`/lead-dashboard/financials/${nextSection}`);
                } else {
                    alert('Congratulations! You have completed the questionnaire.');
                    router.push('/lead-dashboard/financials');
                }
            } else {
                alert('Progress saved successfully!');
            }
        }
    };
    
    // Social Security Number parts হ্যান্ডেল করা
    const ssnParts = formData.socialSecurityNumber ? formData.socialSecurityNumber.split('-') : ['', '', ''];
    const handleSsnChange = (e: ChangeEvent<HTMLInputElement>, part: number) => {
        const newSsnParts = [...ssnParts];
        newSsnParts[part - 1] = e.target.value.replace(/\D/g, ''); // শুধু সংখ্যা রাখা হচ্ছে
        setFormData({ ...formData, socialSecurityNumber: newSsnParts.join('-') });
    };

    return (
        <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    Please provide accurate personal information. All fields marked with (*) are required.
                </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                {/* === Section 1: Personal Information === */}
               {sectionNumber === 1 && (
                <div>
                    <div id="partA" className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h2 className="text-xl font-semibold ... mb-6"><i className="fa-solid fa-user mr-2 text-law-blue"></i>Part A. Name and Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <RadioGroup label="Have you used other names..." name="otherNames" value={formData.otherNames} onChange={handleChange} options={['No', 'Yes']} />
                            {formData.otherNames === 'yes' && <div className="md:col-span-2"><textarea className="bg-white w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-law-blue" name="otherNamesDetail" value={formData.otherNamesDetail || ''} onChange={handleChange} rows={3} placeholder="List names..."></textarea></div>}
                            <RadioGroup label="Have you used business names..." name="businessNames" value={formData.businessNames} onChange={handleChange} options={['No', 'Yes']} />
                            {formData.businessNames === 'yes' && <div className="md:col-span-2"><textarea className="bg-white w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-law-blue" name="businessNamesDetail" value={formData.businessNamesDetail || ''} onChange={handleChange} rows={3} placeholder="List names..."></textarea></div>}
                            <InputField label="Home Phone" name="homePhone" type="tel" value={formData.homePhone} onChange={handleChange} />
                            <InputField label="Work Phone" name="workPhone" type="tel" value={formData.workPhone} onChange={handleChange} />
                            <InputField label="Cell Phone" name="cellPhone" type="tel" value={formData.cellPhone} onChange={handleChange} />
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Social Security Number *</label>
                            <div className="flex space-x-2">
                                <input 
                                    type="text" 
                                    name="ssn1" 
                                    value={formData.ssn1 || ''} 
                                    onChange={handleChange} 
                                    maxLength={3} 
                                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue text-center" 
                                    placeholder="XXX" 
                                    required 
                                />
                                <span className="self-center">-</span>
                                <input 
                                    type="text" 
                                    name="ssn2" 
                                    value={formData.ssn2 || ''} 
                                    onChange={handleChange} 
                                    maxLength={2} 
                                    className="w-12 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue text-center" 
                                    placeholder="XX" 
                                    required 
                                />
                                <span className="self-center">-</span>
                                <input 
                                    type="text" 
                                    name="ssn3" 
                                    value={formData.ssn3 || ''} 
                                    onChange={handleChange} 
                                    maxLength={4} 
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue text-center" 
                                    placeholder="XXXX" 
                                    required 
                                />
                            </div>
                        </div>
                            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                            <InputField label="Driver's License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
                            <InputField label="License Expiration Date" name="licenseExpiration" type="date" value={formData.licenseExpiration} onChange={handleChange} />
                            <SelectField label="License State" name="licenseState" value={formData.licenseState} onChange={handleChange}><option value="">Select State</option><option value="CO">Colorado</option></SelectField>
                            <div className="md:col-span-2"><InputField label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} required /></div>
                            <InputField label="City" name="city" value={formData.city} onChange={handleChange} required />
                            <SelectField label="State" name="state" value={formData.state} onChange={handleChange} required><option value="">Select State</option><option value="CO">Colorado</option></SelectField>
                            <InputField label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                            <InputField label="County" name="county" value={formData.county} onChange={handleChange} />
                            <RadioGroup label="Lived at this address for at least 180 days?" name="lived180Days" value={formData.lived180Days} onChange={handleChange} options={['No', 'Yes']} />
                            <RadioGroup label="Lived at this address for at least 2 years?" name="lived730Days" value={formData.lived730Days} onChange={handleChange} options={['No', 'Yes']} />
                            {(formData.lived180Days === 'no' || formData.lived730Days === 'no') && <div className="md:col-span-2"><h4>Previous Address</h4>...</div>}
                            <RadioGroup label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={['Never Married', 'Married','Married and living together','Widowed','Divorced']} />
                        </div>
                    </div>

                     <div id="partC" className="mb-12">
                        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-gavel mr-2 text-law-blue"></i>Part C. Prior and/or Pending Bankruptcy Cases</h2>
                            <div className="space-y-6">
                                <RadioGroup label="Filed bankruptcy in last 8 years?" name="bankruptcyLast8Years" value={formData.bankruptcyLast8Years} onChange={handleChange} options={['No', 'Yes']} />

                                {showBankruptcyLast8Details && (
                                    <div id="bankruptcyLast8Details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <InputField label="District and State of filing" name="bankruptcyDistrict" value={formData.bankruptcyDistrict} onChange={handleChange} placeholder="District and State"/>
                                        </div>
                                        <InputField label="Case Number" name="bankruptcyCaseNumber" value={formData.bankruptcyCaseNumber} onChange={handleChange} />
                                        <InputField label="Date Filed" name="bankruptcyDateFiled" type="date" value={formData.bankruptcyDateFiled} onChange={handleChange} />
                                        <InputField label="Date Discharged" name="bankruptcyDateDischarged" type="date" value={formData.bankruptcyDateDischarged} onChange={handleChange} />
                                        <RadioGroup label="Was the case dismissed?" name="bankruptcyDismissed" value={formData.bankruptcyDismissed} onChange={handleChange} options={['No', 'Yes']} />
                                        
                                        {showDismissalDate && (
                                            <div>
                                                <InputField label="Dismissal Date" name="bankruptcyDismissalDate" type="date" value={formData.bankruptcyDismissalDate} onChange={handleChange}/>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <RadioGroup label="Any related bankruptcy cases pending?" name="relatedBankruptcyCases" value={formData.relatedBankruptcyCases} onChange={handleChange} options={['No', 'Yes']} />
                                
                                {showRelatedBankruptcyDetails && (
                                    <div id="relatedBankruptcyDetails" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Name of debtor" name="relatedDebtorName" value={formData.relatedDebtorName} onChange={handleChange}/>
                                        <InputField label="Relationship to you" name="relatedDebtorRelationship" value={formData.relatedDebtorRelationship} onChange={handleChange}/>
                                        <InputField label="Case Number" name="relatedCaseNumber" value={formData.relatedCaseNumber} onChange={handleChange}/>
                                        <InputField label="Date Filed" name="relatedDateFiled" type="date" value={formData.relatedDateFiled} onChange={handleChange}/>
                                        <InputField label="District (If known)" name="relatedDistrict" value={formData.relatedDistrict} onChange={handleChange}/>
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>

                     <div id="partD" className="mb-12">
                        <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-home mr-2 text-law-blue"></i>Part D. Debtors Who Reside as Tenants of Residential Property</h2>
                            <div className="space-y-6">
                                <RadioGroup label="Do you have an eviction pending against you?" name="evictionPending" value={formData.evictionPending} onChange={handleChange} options={['No', 'Yes']} />
                                
                                {showEvictionDetails && (
                                    <div id="evictionDetails">
                                        <h4 className="text-md font-medium text-gray-800 mb-4">Landlord's Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputField label="Landlord's Name" name="landlordName" value={formData.landlordName} onChange={handleChange}/>
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputField label="Landlord's Address" name="landlordAddress" value={formData.landlordAddress} onChange={handleChange} placeholder="Street Address"/>
                                            </div>
                                            <InputField label="City" name="landlordCity" value={formData.landlordCity} onChange={handleChange}/>
                                            <InputField label="State" name="landlordState" value={formData.landlordState} onChange={handleChange}/>
                                            <InputField label="ZIP Code" name="landlordZip" value={formData.landlordZip} onChange={handleChange}/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div id="partE" className="mb-12">
                        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>Part E. Business Owned as a Sole Proprietor</h2>
                            <div className="space-y-6">
                                <RadioGroup label="Are you the sole proprietor of a business?" name="soleProprietor" value={formData.soleProprietor} onChange={handleChange} options={['No', 'Yes']} />
                                
                                {showBusinessDetails && (
                                    <div id="businessDetails">
                                        <h4 className="text-md font-medium text-gray-800 mb-4">Business Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputField label="Name of business" name="businessName" value={formData.businessName} onChange={handleChange}/>
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputField label="Business Address" name="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="Street Address"/>
                                            </div>
                                            <InputField label="City" name="businessCity" value={formData.businessCity} onChange={handleChange}/>
                                            <InputField label="State" name="businessState" value={formData.businessState} onChange={handleChange}/>
                                            <InputField label="ZIP Code" name="businessZip" value={formData.businessZip} onChange={handleChange}/>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Description of business</label>
                                                <textarea name="businessDescription" value={formData.businessDescription || ''} onChange={handleChange} rows={3} className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-law-blue" placeholder="Please describe the nature of your business..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                     <div id="partF" className="mb-12">
                        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-exclamation-triangle mr-2 text-law-blue"></i>Part F. Hazardous Property or Property That Needs Immediate Attention</h2>
                            <div className="space-y-6">
                                <RadioGroup label="Do you own property that needs immediate attention or poses a threat?" name="hazardousProperty" value={formData.hazardousProperty} onChange={handleChange} options={['No', 'Yes']} />
                                
                                {showHazardousPropertyDetails && (
                                    <div id="hazardousPropertyDetails" className="space-y-4">
                                        <div>
                                            <label className="block text-sm ...">If yes, please describe the hazard:</label>
                                            <textarea name="hazardDescription" value={formData.hazardDescription || ''} onChange={handleChange} rows={3} className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-law-blue"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm ...">If immediate attention is needed, why?</label>
                                            <textarea name="immediateAttentionReason" value={formData.immediateAttentionReason || ''} onChange={handleChange} rows={3} className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue focus:border-law-blue"></textarea>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputField label="Where is the property? Address:" name="hazardousPropertyAddress" value={formData.hazardousPropertyAddress} onChange={handleChange} placeholder="Street Address"/>
                                            </div>
                                            <InputField label="City" name="hazardousPropertyCity" value={formData.hazardousPropertyCity} onChange={handleChange}/>
                                            <InputField label="State" name="hazardousPropertyState" value={formData.hazardousPropertyState} onChange={handleChange}/>
                                            <InputField label="ZIP Code" name="hazardousPropertyZip" value={formData.hazardousPropertyZip} onChange={handleChange}/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="priorBankruptcyFilings" className="mb-12">
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-file-alt mr-2 text-law-blue"></i>Prior Bankruptcy Filings</h2>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                                <p className="text-sm text-amber-800">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    * If you do not know, we may be able to look it up, but please advise, this is important.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Case No." name="priorCaseNo1" value={formData.priorCaseNo1} onChange={handleChange}/>
                                    <InputField label="Date" name="priorCaseDate1" type="date" value={formData.priorCaseDate1} onChange={handleChange}/>
                                    <InputField label="Case No." name="priorCaseNo2" value={formData.priorCaseNo2} onChange={handleChange}/>
                                    <InputField label="Date" name="priorCaseDate2" type="date" value={formData.priorCaseDate2} onChange={handleChange}/>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                )}
                
                {/* অন্যান্য সেকশনের জন্য: {sectionNumber === 2 && (...)} */}
                
                <div className="flex justify-between pt-6 mt-8 border-t">
                    <Link href="/lead-dashboard/financials" className="px-6 py-2 border rounded-lg">Back to Overview</Link>
                    <div className="flex space-x-3">
                        <button type="button" onClick={() => handleSaveProgress(false)} disabled={isSaving} className="px-6 py-2 border rounded-lg">{isSaving ? 'Saving...' : 'Save Progress'}</button>
                         <button type="button" onClick={() => handleSaveProgress(true)} disabled={isSaving} className="px-6 py-2 bg-law-blue text-white rounded-lg">
                           {isSaving ? 'Saving...' : `Continue to Section ${sectionNumber + 1}`}
                         </button>
                    </div>
                </div>
            </form>
        </div>
    );
}