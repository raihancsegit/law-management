'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * ক্লায়েন্টের জন্য একটি ফাইল আপলোড করে এবং ডাটাবেসে তার রেকর্ড তৈরি করে।
 * owner_id এবং uploaded_by সরাসরি সেশন থেকে নেওয়া হয় নিরাপত্তার জন্য।
 */
export async function uploadClientFile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  
  // ধাপ ১: সার্ভার থেকে সরাসরি বর্তমানে লগইন করা ইউজারকে পাওয়া
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to upload files.' };
  }

  const file = formData.get('file') as File;
  const folderName = formData.get('folderName') as string;
  const clientRootPath = formData.get('clientRootPath') as string;
  // const ownerId = formData.get('ownerId') as string; // <<--- এই লাইনটি আর নেই, কারণ এটি অনিরাপদ ছিল

  if (!file || !folderName || !clientRootPath) {
    return { error: 'Missing required data for file upload.' };
  }
  
  const filePath = `${clientRootPath}/${folderName}/${Date.now()}_${file.name}`;

  // Supabase Storage-এ ফাইল আপলোড
  const { error: uploadError } = await supabase.storage
    .from('client-files')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Storage Upload Error:', uploadError);
    return { error: uploadError.message };
  }

  // client_files টেবিলে মেটাডেটা সেভ করা
  const { data: newFile, error: dbError } = await supabase
    .from('client_files')
    .insert({
      owner_id: user.id, // ফিক্স: ক্লায়েন্ট থেকে না নিয়ে সরাসরি সেশন থেকে user.id ব্যবহার করা হচ্ছে
      folder_name: folderName,
      file_name: file.name,
      storage_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id, // আপলোডারও লগইন করা ইউজার
    })
    .select()
    .single();

  if (dbError) {
    console.error('DB Insert Error:', dbError);
    await supabase.storage.from('client-files').remove([filePath]);
    return { error: dbError.message };
  }

  revalidatePath('/lead-dashboard/documents');
  revalidatePath(`/dashboard/users/${user.id}/documents`);
  return { success: true, data: newFile };
}


/**
 * স্টোরেজ এবং ডাটাবেস উভয় জায়গা থেকে একটি ফাইল ডিলিট করে।
 */
export async function deleteClientFile(fileId: number, storagePath: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data: fileToDelete, error: fetchError } = await supabase
    .from('client_files')
    .select('owner_id')
    .eq('id', fileId)
    .single();

  if (fetchError || !fileToDelete) {
      return { error: 'File not found or you do not have permission.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

  if (user?.id !== fileToDelete.owner_id && adminProfile?.role !== 'admin') {
      return { error: 'You do not have permission to delete this file.' };
  }

  const { error: storageError } = await supabase.storage
    .from('client-files')
    .remove([storagePath]);

  if (storageError) {
    console.error('Storage Delete Error:', storageError);
    return { error: 'Could not delete file from storage.' };
  }

  const { error: dbError } = await supabase
    .from('client_files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    console.error('DB Delete Error:', dbError);
    return { error: 'Could not delete file record from database.' };
  }

  revalidatePath('/lead-dashboard/documents');
  if (fileToDelete) {
    revalidatePath(`/dashboard/users/${fileToDelete.owner_id}/documents`);
  }
  return { success: true, fileId: fileId };
}