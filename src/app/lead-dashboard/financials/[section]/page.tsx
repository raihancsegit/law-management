import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QuestionnaireSectionClient from './QuestionnaireSectionClient'; // আমরা এটি তৈরি করব

export const revalidate = 0;

export default async function FinancialsSectionPage({ params }: {
    params: { section: string }
}) {
    const sectionNumber = parseInt(params.section, 10);
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');

    // form_id=2 (Financial Questionnaire)-এর জন্য সাবমিশন ডেটা আনা হচ্ছে
    const { data: submission } = await supabase
        .from('form_submissions')
        .select('submission_data')
        .eq('user_id', user.id)
        .eq('form_id', 2)
        .maybeSingle();

    const initialData = submission?.submission_data || {};

    const sectionTitles = {
        1: "Part A. Name and Address",
        // ... অন্যান্য সেকশনের টাইটেল
    };
    
    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-8 border-gray-200">
                    <QuestionnaireSectionClient
                        sectionNumber={sectionNumber}
                        initialData={initialData}
                        sectionTitle={sectionTitles[sectionNumber as keyof typeof sectionTitles]}
                    />
                </div>
            </div>
        </div>
    );
}