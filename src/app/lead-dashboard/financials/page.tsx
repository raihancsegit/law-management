import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// একটি সেকশন কার্ডের জন্য Helper Component (কোনো পরিবর্তন নেই)
const SectionCard = ({ section, status }: {
  section: { number: number; title: string; description: string; link: string; };
  status: 'Complete' | 'In Progress' | 'Pending';
}) => {
  const statusConfig: { [key: string]: { icon: string; bg: string; text: string; } } = {
    Complete: { icon: 'fa-check', bg: 'bg-green-100', text: 'text-green-800' },
    'In Progress': { icon: 'fa-clock', bg: 'bg-amber-100', text: 'text-amber-800' },
    Pending: { icon: 'fa-circle-pause', bg: 'bg-gray-100', text: 'text-gray-600' },
  };
  const current = statusConfig[status];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${current.bg} mr-3`}>
            <i className={`fa-solid ${current.icon} text-${current.text.split('-')[1]}-600 text-sm`}></i>
          </div>
          <h5 className="text-md font-medium text-gray-900">{`Section ${section.number}: ${section.title}`}</h5>
        </div>
        <span className={`text-xs ${current.bg} ${current.text} px-2 py-1 rounded-full`}>{status}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{section.description}</p>
      <Link href={section.link} className="text-law-blue hover:text-blue-800 text-sm font-medium">
        {status === 'Complete' ? 'View/Edit Details' : 'Start/Continue Section'}
      </Link>
    </div>
  );
};

// ==========================================================
// নতুন যুক্ত করা হয়েছে: সেকশন পূরণের শর্তাবলী
// ==========================================================
// এখানে প্রতিটি সেকশনের জন্য আবশ্যক 필্ডগুলোর তালিকা দিন।
// এই 필্ডের নামগুলো আপনার فرم 컴포নেন্টের ইনপুট 필্ডের 'name' অ্যাট্রিবিউটের সাথে মিলতে হবে।
const sectionRequiredFields: { [key: number]: string[] } = {
    1: ['fullName', 'email', 'dateOfBirth', 'currentAddress', 'city', 'state', 'zipCode', 'ssn1', 'ssn2', 'ssn3'],
    2: ['employerName', 'jobTitle', 'incomeAmount', 'payFrequency'], // উদাহরণস্বরূপ 필্ড
    3: ['primaryResidenceValue', 'vehicle1Make', 'vehicle1Year'], // উদাহরণস্বরূপ 필্ড
    4: ['rentOrMortgage', 'utilities', 'foodExpenses'], // উদাহরণস্বরূপ 필্ড
    5: ['creditCard1Balance', 'studentLoanBalance'], // উদাহরণস্বরূপ 필্ড
    6: ['bankruptcyLast8Years', 'relatedBankruptcyCases'], // উদাহরণস্বরূপ 필্ড
    7: ['lawsuitsPending', 'coDebtors'], // উদাহরণস্বরূপ 필্ড
};

// মূল পেজ কম্পোনেন্ট
export default async function FinancialsPage() {
    const supabase = createServerComponentClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    // Financial Questionnaire (form_id=2)-এর জন্য সাবমিশন ডেটা আনা হচ্ছে
    const { data: submission } = await supabase
        .from('form_submissions')
        .select('submission_data, current_step')
        .eq('user_id', user.id)
        .eq('form_id', 2)
        .maybeSingle();
        
    const submissionData = submission?.submission_data || {};
    
    const sections = [
        { number: 1, title: 'Personal Information', description: 'Basic personal and contact information', link: '/lead-dashboard/financials/1' },
        { number: 2, title: 'Employment & Income', description: 'Current and past employment, income sources', link: '/lead-dashboard/financials/2' },
        { number: 3, title: 'Assets & Property', description: 'Real estate, vehicles, personal property, investments', link: '/lead-dashboard/financials/3' },
        { number: 4, title: 'Monthly Expenses', description: 'Housing, utilities, food, transportation, and other expenses', link: '/lead-dashboard/financials/4' },
        { number: 5, title: 'Debts & Liabilities', description: 'Credit cards, loans, and other debts', link: '/lead-dashboard/financials/5' },
        { number: 6, title: 'Financial History', description: 'Previous bankruptcy filings and financial transactions', link: '/lead-dashboard/financials/6' },
        { number: 7, title: 'Legal & Additional Information', description: 'Legal matters, pending lawsuits, and additional disclosures', link: '/lead-dashboard/financials/7' }
    ];

    // ==========================================================
    // পরিবর্তন করা হয়েছে: ডাইনামিক স্ট্যাটাস এবং অগ্রগতি গণনা
    // ==========================================================
    const getSectionStatus = (sectionNumber: number, data: any): 'Complete' | 'In Progress' | 'Pending' => {
        const requiredFields = sectionRequiredFields[sectionNumber];
        
        // যদি কোনো আবশ্যক ফিল্ড ডিফাইন করা না থাকে, তাহলে পেন্ডিং ধরা হবে
        if (!requiredFields || requiredFields.length === 0) {
            return 'Pending';
        }

        const filledFields = requiredFields.filter(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
        
        if (filledFields.length === requiredFields.length) {
            return 'Complete';
        }
        if (filledFields.length > 0) {
            return 'In Progress';
        }
        return 'Pending';
    };
    
    // প্রতিটি সেকশনের জন্য স্ট্যাটাস গণনা
    let completedSectionsCount = 0;
    const sectionsWithStatus = sections.map(section => {
        const status = getSectionStatus(section.number, submissionData);
        if (status === 'Complete') {
            completedSectionsCount++;
        }
        return { ...section, status };
    });

    // সামগ্রিক অগ্রগতি গণনা
    const overallProgress = sections.length > 0 
        ? Math.round((completedSectionsCount / sections.length) * 100) 
        : 0;

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Financial Questionnaire</h3>
                    <p className="text-gray-500">Complete this comprehensive form to help us prepare your bankruptcy case.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Progress Overview</h4>
                        {/* ডাইনামিক অগ্রগতি এখানে দেখানো হচ্ছে */}
                        <span className="text-sm text-gray-500">{overallProgress}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        {/* ప్రోగ్రెస్ বারের প্রস্থ ডাইনামিকভাবে সেট করা হচ্ছে */}
                        <div className="bg-law-blue h-2 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* স্ট্যাটাস সহ সেকশনগুলো রেন্ডার করা হচ্ছে */}
                    {sectionsWithStatus.map(section => (
                        <SectionCard
                            key={section.number}
                            section={section}
                            status={section.status}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}