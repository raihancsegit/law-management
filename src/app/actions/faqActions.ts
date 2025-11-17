'use server'; // <-- নিশ্চিত করুন এটি ফাইলের প্রথম লাইনে আছে

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Define a type for FAQ data (এটি ঐচ্ছিক, কিন্তু ভালো অভ্যাস)
type FaqData = {
    id?: number;
    question: string;
    answer: string;
    category: string;
    type: 'client' | 'lead';
};

// === নিশ্চিত করুন এই ফাংশনটি 'export' করা হয়েছে ===
export async function createFaq(formData: FormData) {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const faqData: FaqData = {
        question: formData.get('question') as string,
        answer: formData.get('answer') as string,
        category: formData.get('category') as string,
        type: formData.get('type') as 'client' | 'lead',
    };

    const { error } = await supabase.from('faqs').insert({ ...faqData, user_id: user.id });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/faq');
    return { success: true };
}

// Update an existing FAQ
export async function updateFaq(formData: FormData) {
    const supabase = createServerActionClient({ cookies });
    const id = Number(formData.get('id'));
    if (!id) return { error: 'FAQ ID is missing.' };

    const faqData: FaqData = {
        question: formData.get('question') as string,
        answer: formData.get('answer') as string,
        category: formData.get('category') as string,
        type: formData.get('type') as 'client' | 'lead',
    };

    const { error } = await supabase.from('faqs').update(faqData).eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/faq');
    return { success: true };
}

// Delete an FAQ
export async function deleteFaq(id: number) {
    const supabase = createServerActionClient({ cookies });
    const { error } = await supabase.from('faqs').delete().eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/faq');
    return { success: true };
}