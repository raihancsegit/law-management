'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Folder টাইপ (এটি একটি কমন টাইপ ফাইলে রাখা ভালো)
type Folder = {
  id: string;
  name: string;
  children: Folder[];
};

export async function convertLeadToClient(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ধাপ ১: ব্যবহারকারীর প্রোফাইল এবং ফোল্ডার টেমপ্লেট আনা
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', userId)
    .single();

  const { data: template } = await supabase
    .from('folder_templates')
    .select('structure')
    .eq('id', 1) // ডিফল্ট টেমপ্লেট
    .single();

  if (!profile || !template) {
    return { error: 'User or folder template not found.' };
  }

  // ধাপ ২: ক্লায়েন্টের জন্য একটি ইউনিক রুট ফোল্ডার পাথ তৈরি করা
  const clientFolderName = `${profile.last_name}_${profile.first_name}_${profile.id}`.toLowerCase().replace(/\s+/g, '_');
  const rootPath = `client-documents/${clientFolderName}`;

  // ধাপ ৩: টেমপ্লেট অনুযায়ী Supabase Storage-এ ফোল্ডার তৈরি করা
  const predefinedFolders: Folder[] = template.structure;
  const folderCreationPromises = predefinedFolders.map(folder => 
    supabase.storage
      .from('client-files') // আপনার স্টোরেজ বাকেটের নাম
      .upload(`${rootPath}/${folder.name}/.placeholder`, '') // ফোল্ডার তৈরির জন্য একটি খালি ফাইল
  );

  try {
    const results = await Promise.all(folderCreationPromises);
    // এরর চেক করা
    for (const result of results) {
        if (result.error) throw result.error;
    }
  } catch (storageError: any) {
    console.error('Error creating folders in storage:', storageError.message);
    return { error: 'Could not create client folders in storage. ' + storageError.message };
  }
  
  // ধাপ ৪: ব্যবহারকারীর ভূমিকা 'client' হিসেবে আপডেট করা
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'client' })
    .eq('id', userId);

  if (updateError) {
    return { error: 'Could not update user role.' };
  }

  revalidatePath('/dashboard/users');
  revalidatePath(`/dashboard/users/${userId}`);
  return { success: true, message: 'User converted to client successfully.' };
}