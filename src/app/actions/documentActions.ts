'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function uploadClientFile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // অ্যাডমিন কিনা, তা চেক করা
  const { data: uploaderProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isUploaderAdmin = uploaderProfile?.role === 'admin';

  const file = formData.get('file') as File;
  const folderName = formData.get('folderName') as string;
  const clientRootPath = formData.get('clientRootPath') as string;
  let ownerId = formData.get('ownerId')?.toString(); // অ্যাডমিনের জন্য

  // ফিক্স: যদি আপলোডার অ্যাডমিন না হয়, অথবা অ্যাডমিন হওয়া সত্ত্বেও ownerId না পাঠানো হয়,
  // তাহলে ownerId হিসেবে বর্তমানে লগইন করা ইউজারের আইডি ব্যবহার করা হবে।
  if (!isUploaderAdmin || !ownerId) {
      ownerId = user.id;
  }

  // নিরাপত্তা চেক: যদি আপলোডার অ্যাডমিন না হয়, তাহলে সে শুধুমাত্র নিজের জন্য আপলোড করতে পারবে।
  if (!isUploaderAdmin && user.id !== ownerId) {
      return { error: 'Permission denied. You can only upload files for yourself.' };
  }

  if (!file || !folderName || !clientRootPath || !ownerId) {
    return { error: 'Missing required data for file upload.' };
  }
  
  const filePath = `${clientRootPath}/${folderName}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage.from('client-files').upload(filePath, file);
  if (uploadError) return { error: `Storage Error: ${uploadError.message}` };

  const { data: newFile, error: dbError } = await supabase
    .from('client_files')
    .insert({
      owner_id: ownerId,
      folder_name: folderName,
      file_name: file.name,
      storage_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('client-files').remove([filePath]);
    return { error: `Database Error: ${dbError.message}` };
  }

  revalidatePath('/lead-dashboard/documents');
  revalidatePath(`/dashboard/users/${ownerId}/documents`);
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

export async function createSignedUrl(storagePath: string, options?: { download: boolean }) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  
  // RLS পলিসি চেক করার জন্য ইউজারের তথ্য নেওয়া হচ্ছে
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  
  const { data, error } = await supabase.storage
    .from('client-files')
    .createSignedUrl(storagePath, 60, { // URLটি ৬০ সেকেন্ডের জন্য বৈধ থাকবে
      download: options?.download || false // download:true হলে ফাইলটি ডাউনলোড হবে, false হলে ব্রাউজারে দেখাবে
    });

  if (error) {
    console.error('Error creating signed URL:', error);
    return { error: 'Could not create a link for this file.' };
  }

  return { success: true, url: data.signedUrl };
}