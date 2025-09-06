'use client';

import { useState, ChangeEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveFinancialsProgress } from '@/app/actions/userActions';

// সেকশন কম্পונન્ટগুলোকে ইম্পোর্ট করা
import Section1 from '@/components/financials/Section1';
import Section2 from '@/components/financials/Section2'; 
import Section3 from '@/components/financials/Section3';
import Section4 from '@/components/financials/Section4';
import Section5 from '@/components/financials/Section5';
import Section6 from '@/components/financials/Section6';
import Section7 from '@/components/financials/Section7';
// import Section2 from '@/components/financials/Section2'; // ভবিষ্যতের জন্য

type Props = {
    sectionNumber: number;
    initialData: any;
};

export default function QuestionnaireSectionClient({ sectionNumber, initialData }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData || {});
    const [isSaving, setIsSaving] = useState(false);
    
    // handleChange এখন অনেক সরল, কারণ কন্ডিশনাল state এখানে নেই
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSsnChange = (e: ChangeEvent<HTMLInputElement>, part: number) => {
        const ssnParts = formData.socialSecurityNumber ? formData.socialSecurityNumber.split('-') : ['', '', ''];
        ssnParts[part - 1] = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, socialSecurityNumber: ssnParts.join('-') });
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

    // useMemo ব্যবহার করে শুধুমাত্র sectionNumber পরিবর্তন হলেই sections অবজেক্টটি নতুন করে তৈরি হবে
    const sections = useMemo(() => ({
        1: <Section1 formData={formData} handleChange={handleChange} handleSsnChange={handleSsnChange} />,
        2: <Section2 formData={formData} setFormData={setFormData} />,
        3: <Section3 formData={formData} setFormData={setFormData} />,
        4: <Section4 formData={formData} setFormData={setFormData} />,
        5: <Section5 formData={formData} setFormData={setFormData} />,
        6: <Section6 formData={formData} setFormData={setFormData} />,
        7: <Section7 formData={formData} setFormData={setFormData} />
    }), [formData]); // formData-এর উপর নির্ভর করে, যাতে চাইল্ড কম্পוננט রি-রেন্ডার হয়

    const CurrentSectionComponent = sections[sectionNumber as keyof typeof sections] || <div>Section Not Implemented Yet.</div>;
    const sectionTitles: {[key:number]: string} = { 1: "Personal Information", 2: "Employment & Income" };

    return (
        
                
                    <form onSubmit={(e) => e.preventDefault()}>
                        {CurrentSectionComponent}
                       <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200">
                            <Link href="/lead-dashboard/financials" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                                <i className="fa-solid fa-arrow-left mr-2"></i>
                                Back to Overview
                            </Link>
                            
                            <div className="flex space-x-3">
                                <button 
                                    type="button" 
                                    onClick={() => handleSaveProgress(false)} 
                                    disabled={isSaving}
                                    className="px-6 py-2 border border-law-blue text-law-blue rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                {isSaving ? (
                                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                                ) : (
                                        <><i className="fa-solid fa-save mr-2"></i>Save Progress</>
                                )}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => handleSaveProgress(true)} 
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                {isSaving ? 'Saving...' : `Continue to Section ${sectionNumber + 1}`}
                                <i className="fa-solid fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </form>
           
    );
}