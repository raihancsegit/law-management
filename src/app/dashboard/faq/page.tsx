// app/dashboard/faq/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FaqClient from './FaqClient'; // We will create this next

export const revalidate = 0;

export default async function FaqManagementPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/login');

    const { data: faqs, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching FAQs:", error);
        // Handle error state if needed
    }

    return (
        <section className="p-6">
            <FaqClient initialFaqs={faqs || []} />
        </section>
    );
}