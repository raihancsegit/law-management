// /app/lead-dashboard/settings/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientSettings from './ClientSettings'; // ক্লায়েন্ট কম্পোনেন্ট

export const revalidate = 0;

export default async function SettingsPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        return <div>Error loading profile. Please try again later.</div>;
    }

    // ইমেল ঠিকানাটি user অবজেক্ট থেকে নেওয়া ভালো
    const userProfile = { ...profile, email: user.email };

    return (
        <div className="p-6">
            <ClientSettings initialProfile={userProfile} />
        </div>
    );
}