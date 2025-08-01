'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ফাংশন ১: প্রতিটি ধাপে ডেটা সেভ করার জন্য (Next বাটন ক্লিক করলে)
export async function handleSaveProgress(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();

  // এই ফাংশনটি শুধুমাত্র লগইন করা ব্যবহারকারীদের জন্য কাজ করবে
  if (!user) {
    // যদি ব্যবহারকারী লগইন করা না থাকে, তাহলে কোনো অ্যাকশন নেওয়া হবে না
    // কারণ এটি শুধুমাত্র "Next" বাটনের জন্য, যা লগইন করার পর দেখা যাবে
    return { error: 'User not authenticated' };
  }

  const submissionData = Object.fromEntries(formData.entries());
  const currentStep = formData.get('current_step')?.toString();

  // upsert ব্যবহার করে ডেটা ইনসার্ট বা আপডেট করা হবে
  const { error } = await supabase
    .from('form_submissions')
    .upsert({
      user_id: user.id,
      form_id: 1, // 'Bankruptcy Application' ফর্মের আইডি
      submission_data: submissionData,
      status: 'in_progress', // স্ট্যাটাস 'in_progress' থাকবে
      current_step: currentStep ? parseInt(currentStep, 10) : 1,
    }, { onConflict: 'user_id, form_id' }); // user_id এবং form_id মিলে গেলে পুরনো রো আপডেট হবে

  if (error) {
    console.error('Save progress error:', error.message);
    return { error: 'Could not save your progress.' };
  }

  return { success: true, message: 'Progress saved.' };
}


// ফাংশন ২: চূড়ান্তভাবে অ্যাপ্লিকেশন জমা দেওয়ার জন্য
export async function handleSubmitApplication(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ফর্ম থেকে রেজিস্ট্রেশনের জন্য প্রয়োজনীয় ডেটা নেওয়া হচ্ছে
  const email = formData.get('email')?.toString();
  const password =formData.get('password')?.toString();
  const firstName = formData.get('first_name_primary')?.toString();
  const lastName = formData.get('last_name_primary')?.toString();

  if (!email || !password || !firstName || !lastName) {
    return redirect('/start-application?error=Core_information_(name, email, password)_is_missing.');
  }

  // ১. নতুন ব্যবহারকারীর জন্য অ্যাকাউন্ট তৈরি করা
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (signUpError) {
    return redirect(`/start-application?error=${encodeURIComponent(signUpError.message)}`);
  }

  if (!user) {
    return redirect('/start-application?error=An_unknown_error_occurred_during_signup.');
  }

  // ২. ফর্মের সমস্ত ডেটা একটি JSON অবজেক্টে পরিণত করা
  const submissionData = Object.fromEntries(formData.entries());

  // ৩. `form_submissions` টেবিলে চূড়ান্ত ডেটা সেভ করা
  const { error: submissionError } = await supabase
    .from('form_submissions')
    .upsert({
      form_id: 1, // 'Bankruptcy Application' ফর্মের আইডি
      user_id: user.id,
      submission_data: submissionData,
      status: 'submitted', // চূড়ান্ত স্ট্যাটাস 'submitted'
      current_step: 4, // শেষ ধাপ
    }, { onConflict: 'user_id, form_id' });

  if (submissionError) {
    console.error('Final submission error:', submissionError);
    // একটি এজ কেস: ইউজার তৈরি হয়েছে কিন্তু ডেটা সেভ হয়নি।
    // প্রোডাকশনে এখানে ইউজারকে ডিলিট করার লজিক যোগ করা যেতে পারে।
    return redirect(`/start-application?error=Could_not_save_your_application_data.`);
  }

  // ৪. সফল হলে, ব্যবহারকারীকে ইমেইল চেক করার পেজে পাঠানো
  return redirect('/check-email');
}



// একটি নতুন ফিল্ড তৈরি করার অ্যাকশন
export async function createFormField(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const rawData = {
    form_id: formData.get('form_id'),
    step: formData.get('step'),
    field_order: formData.get('field_order'),
    label: formData.get('label'),
    field_type: formData.get('field_type'),
    placeholder: formData.get('placeholder'),
    is_required: formData.get('is_required') === 'on',
    options: formData.get('options') ? JSON.parse(formData.get('options') as string) : null,
  };

  const { error } = await supabase.from('form_fields').insert(rawData);

  if (error) {
    return { error: 'Could not create field: ' + error.message };
  }

  revalidatePath(`/dashboard/forms/${rawData.form_id}`);
  return { success: true };
}

// একটি ফিল্ড আপডেট করার অ্যাকশন
export async function updateFormField(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const fieldId = formData.get('field_id');
  const formId = formData.get('form_id');
  
  const rawData = {
    step: formData.get('step'),
    field_order: formData.get('field_order'),
    label: formData.get('label'),
    field_type: formData.get('field_type'),
    placeholder: formData.get('placeholder'),
    is_required: formData.get('is_required') === 'on',
    options: formData.get('options') ? JSON.parse(formData.get('options') as string) : null,
  };

  const { error } = await supabase.from('form_fields').update(rawData).eq('id', fieldId);

  if (error) {
    return { error: 'Could not update field: ' + error.message };
  }

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

// একটি ফিল্ড ডিলিট করার অ্যাকশন
export async function deleteFormField(fieldId: number, formId: number) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.from('form_fields').delete().eq('id', fieldId);

  if (error) {
    return { error: 'Could not delete field: ' + error.message };
  }

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}