'use client';
import { ChangeEvent, useEffect } from 'react';
import { InputField, TextareaField } from '@/components/forms/FormControls';

// Main component props type
type SectionProps = {
    formData: any;
    setFormData: (data: any) => void;
};

// মূল Section4 কম্পোনেন্ট
export default function Section4({ formData, setFormData }: SectionProps) {
    const leases = formData.leases || [];
    const hasLeases = formData.hasLeases === 'yes';

    // --- সমাধান: useEffect হুকের ডিফল্ট অবস্থা পরিবর্তন করা হয়েছে ---
    useEffect(() => {
        // কম্পোনেন্ট প্রথমবার লোড হওয়ার সময় এই অবস্থাটি সেট হবে
        if (formData.hasLeases === undefined) {
            // ডিফল্টভাবে 'yes' সেট করুন এবং টেবিল দেখানোর জন্য একটি খালি সারি যোগ করুন
            setFormData({
                ...formData,
                hasLeases: 'yes',
                leases: [{ id: Date.now(), description: '', party: '', expires: '' }]
            });
        }
    }, []);

    // Yes/No রেডিও বাটনের অবস্থা পরিবর্তন করার জন্য
    const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value === 'yes' && leases.length === 0) {
            setFormData({
                ...formData,
                hasLeases: 'yes',
                leases: [{ id: Date.now(), description: '', party: '', expires: '' }]
            });
        } else if (value === 'no') {
            setFormData({ ...formData, hasLeases: 'no', leases: [] });
        } else {
            setFormData({ ...formData, hasLeases: value });
        }
    };

    // টেবিলের কোনো একটি সারির ইনপুট ফিল্ড পরিবর্তন করার জন্য
    const handleLeaseChange = (index: number, fieldName: string, value: string) => {
        const updatedLeases = [...leases];
        updatedLeases[index] = { ...updatedLeases[index], [fieldName]: value };
        setFormData({ ...formData, leases: updatedLeases });
    };

    // নতুন একটি খালি সারি যোগ করার জন্য
    const addLeaseRow = (description: string = '') => {
        const newLease = { id: Date.now(), description, party: '', expires: '' };
        setFormData({ ...formData, leases: [...leases, newLease] });
    };

    // একটি নির্দিষ্ট সারি মুছে ফেলার জন্য
    const removeLeaseRow = (indexToRemove: number) => {
        const updatedLeases = leases.filter((_: any, index: number) => index !== indexToRemove);
        setFormData({ ...formData, leases: updatedLeases });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <i className="fa-solid fa-info-circle mr-2"></i>
                        List below any leases or contracts that are still current and to which you are a party. Include residential, car and business leases, and service or business contracts.
                    </p>
                </div>
            </div>

            <div id="leasesContractsSection" className="mb-8">
                <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        <i className="fa-solid fa-file-contract mr-2 text-law-blue"></i>
                        Unexpired Leases and Contracts
                    </h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any unexpired leases or contracts?</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="hasLeases" value="no" checked={formData.hasLeases === 'no'} onChange={handleRadioChange} className="mr-2" />
                                No
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="hasLeases" value="yes" checked={formData.hasLeases === 'yes'} onChange={handleRadioChange} className="mr-2" />
                                Yes
                            </label>
                        </div>
                    </div>
                
                    {hasLeases && (
                        <div id="leasesTableContainer" className="space-y-6">
                            {/* Main Leases and Contracts Table */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Description of Lease or Contract</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Name and Address of Other Party</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Date Contract Expires</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {leases.map((lease: any, index: number) => (
                                                <tr key={lease.id || index}>
                                                    <td className="px-6 py-4">
                                                        <TextareaField name="description" value={lease.description} onChange={(e) => handleLeaseChange(index, 'description', e.target.value)} rows={3} placeholder="e.g., Apartment rental, Car lease" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <TextareaField name="party" value={lease.party} onChange={(e) => handleLeaseChange(index, 'party', e.target.value)} rows={3} placeholder="Name and full address of the other party" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <InputField name="expires" value={lease.expires} onChange={(e) => handleLeaseChange(index, 'expires', e.target.value)} type="date" />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button type="button" onClick={() => removeLeaseRow(index)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200" title="Remove this entry">
                                                            <i className="fa-solid fa-trash text-sm"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Add New Entry Button */}
                            <div className="flex justify-center">
                                <button type="button" onClick={() => addLeaseRow()} className="px-6 py-3 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 flex items-center">
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Add New Lease or Contract
                                </button>
                            </div>
                            
                            {/* Category Quick Add Section */}
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <i className="fa-solid fa-bolt mr-2 text-law-blue"></i>
                                    Quick Add by Category
                                </h3>
                                <p className="text-sm text-blue-800 mb-4">Select a category to quickly add a pre-formatted entry.</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <button type="button" onClick={() => addLeaseRow('Residential Lease: ')} className="category-btn px-4 py-2 border border-green-500 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm">
                                        <i className="fa-solid fa-home mr-1"></i> Residential
                                    </button>
                                    <button type="button" onClick={() => addLeaseRow('Vehicle Lease: ')} className="category-btn px-4 py-2 border border-blue-500 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm">
                                        <i className="fa-solid fa-car mr-1"></i> Vehicle
                                    </button>
                                    <button type="button" onClick={() => addLeaseRow('Business Lease/Contract: ')} className="category-btn px-4 py-2 border border-purple-500 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm">
                                        <i className="fa-solid fa-building mr-1"></i> Business
                                    </button>
                                    <button type="button" onClick={() => addLeaseRow('Service Contract: ')} className="category-btn px-4 py-2 border border-yellow-500 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200 text-sm">
                                        <i className="fa-solid fa-handshake mr-1"></i> Service
                                    </button>
                                    <button type="button" onClick={() => addLeaseRow('Other Contract: ')} className="category-btn px-4 py-2 border border-gray-500 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm">
                                        <i className="fa-solid fa-file-alt mr-1"></i> Other
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}