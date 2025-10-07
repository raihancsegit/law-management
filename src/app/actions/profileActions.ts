'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// সার্ভার অ্যাকশন এখন FormData গ্রহণ করবে
export async function updateAdminProfile(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'User not authenticated' };

  const updates: { [key: string]: any } = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone_number: formData.get('phone_number') as string,
    job_title: formData.get('job_title') as string,
    department: formData.get('department') as string,
    bio: formData.get('bio') as string,
  };
  
  const avatarFile = formData.get('avatar_file') as File | null;
  const avatarAction = formData.get('avatar_action') as string;

  // যদি একটি নতুন ফাইল আপলোড করা হয়
  if (avatarFile && avatarFile.size > 0) {
    // === মূল ফিক্স এখানে: filePath থেকে 'avatars/' সরিয়ে দেওয়া হয়েছে ===
    const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars') // বাকেটের নাম এখানে বলা আছে
      .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true, // যদি একই নামে ফাইল থাকে, তাহলে overwrite করবে
      });
      
    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      return { error: `Failed to upload new avatar: ${uploadError.message}` };
    }
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    updates.avatar_url = publicUrl;
  } 
  // যদি "Remove" বাটন ক্লিক করা হয়
  else if (avatarAction === 'remove') {
    // এখানে আপনি চাইলে পুরোনো ছবিটি স্টোরেজ থেকে ডিলিট করার লজিক যোগ করতে পারেন
    updates.avatar_url = null;
  }

  // ডেটাবেসে প্রোফাইল আপডেট করা
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Profile Update Error:', error);
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/profile');
  return { success: true };
}

// পাসওয়ার্ড পরিবর্তন করার জন্য
export async function changeAdminPassword(formData: FormData) {
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;
  
  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }
  
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const supabase = createServerActionClient({ cookies });
  
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}