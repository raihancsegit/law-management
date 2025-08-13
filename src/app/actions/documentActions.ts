'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type FolderData = {
  folderName: string;
  description: string;
  icon: string;
  isRequired: boolean;
};

// এই ফাংশনটি আপনার কোড থেকে নেওয়া (ডিবাগিং লগসহ)
export async function createCustomFolder(folderData: any) {
  console.log('--- Action: createCustomFolder started ---');
  console.log('Received Folder Data:', folderData);

  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Authentication Error:', userError?.message || 'User not found.');
    return { error: 'Authentication required. Please log in again.' };
  }
  
  console.log('Authenticated User ID:', user.id);

  const trimmedFolderName = folderData.folderName?.trim();
  if (!trimmedFolderName || trimmedFolderName.length < 3) {
    const errorMsg = 'Folder name must be at least 3 characters long.';
    console.error('Validation Error:', errorMsg);
    return { error: errorMsg };
  }

  const newRecord = {
    owner_id: user.id,
    folder_name: trimmedFolderName,
    description: folderData.description,
    icon: folderData.icon,
    is_required: folderData.isRequired,
  };
  
  console.log('Attempting to insert into client_custom_folders:', newRecord);

  const { data: newFolder, error } = await supabase
    .from('client_custom_folders')
    .insert(newRecord)
    .select()
    .single();

  if (error) {
    console.error('!!! Supabase Insert Error:', error);
    console.error('Error Details:', { code: error.code, message: error.message, details: error.details, hint: error.hint });
    if (error.code === '23505') {
      return { error: `A folder with the name "${trimmedFolderName}" already exists.` };
    }
    return { error: `Database Error: ${error.message}` };
  }
  
  if (!newFolder) {
      console.error('Insert was successful but no data was returned.');
      return { error: 'Folder created, but could not be retrieved.' };
  }

  console.log('--- Insert Successful! ---');
  console.log('Returned new folder:', newFolder);

  revalidatePath('/lead-dashboard/documents');
  return { success: true, data: newFolder };
}

// এই ফাংশনটি আপনার কোড থেকে নেওয়া (অপরিবর্তিত)
export async function uploadClientFile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { data: uploaderProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isUploaderAdmin = uploaderProfile?.role === 'admin';

  const file = formData.get('file') as File;
  const folderName = formData.get('folderName') as string;
  const clientRootPath = formData.get('clientRootPath') as string;
  let ownerId = formData.get('ownerId')?.toString();

  if (!isUploaderAdmin || !ownerId) {
      ownerId = user.id;
  }

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
    .from('client_files').insert({
      owner_id: ownerId, folder_name: folderName, file_name: file.name, storage_path: filePath,
      file_size: file.size, mime_type: file.type, uploaded_by: user.id,
    }).select().single();

  if (dbError) {
    await supabase.storage.from('client-files').remove([filePath]);
    return { error: `Database Error: ${dbError.message}` };
  }

  revalidatePath('/lead-dashboard/documents');
  revalidatePath(`/dashboard/users/${ownerId}/documents`);
  return { success: true, data: newFile };
}

// এই ফাংশনটি আপনার কোড থেকে নেওয়া (অপরিবর্তিত)
export async function deleteClientFile(fileId: number, storagePath: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data: fileToDelete } = await supabase.from('client_files').select('owner_id').eq('id', fileId).single();
  if (!fileToDelete) return { error: 'File not found or permission denied.' };
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (user.id !== fileToDelete.owner_id && adminProfile?.role !== 'admin') {
      return { error: 'You do not have permission to delete this file.' };
  }
  
  const { error: storageError } = await supabase.storage.from('client-files').remove([storagePath]);
  if (storageError) return { error: 'Could not delete file from storage.' };
  
  const { error: dbError } = await supabase.from('client_files').delete().eq('id', fileId);
  if (dbError) return { error: 'Could not delete file record from database.' };
  
  revalidatePath('/lead-dashboard/documents');
  revalidatePath(`/dashboard/users/${fileToDelete.owner_id}/documents`);
  return { success: true, fileId };
}

// এই ফাংশনটি আপনার কোড থেকে নেওয়া (অপরিবর্তিত)
export async function createSignedUrl(storagePath: string, options?: { download: boolean }) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  
  const { data, error } = await supabase.storage.from('client-files').createSignedUrl(storagePath, 60, { download: options?.download || false });
  if (error) return { error: 'Could not create a link for this file.' };

  return { success: true, url: data.signedUrl };
}

export async function deleteCustomFolder(folderId: number) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // ধাপ ১: ব্যবহারকারী লগইন করা আছে কিনা নিশ্চিত করা
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  // ধাপ ২: ফোল্ডারটি খুঁজে বের করা এবং মালিকানা যাচাই করা
  const { data: folderToDelete, error: fetchError } = await supabase
      .from("client_custom_folders")
      .select('id, owner_id, folder_name')
      .eq("id", folderId)
      .single();

  if (fetchError || !folderToDelete) return { error: "Folder not found." };
  
  const { data: uploaderProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  // নিরাপত্তা চেক: শুধুমাত্র ফোল্ডারের মালিক অথবা অ্যাডমিন ডিলিট করতে পারবে
  if (user.id !== folderToDelete.owner_id && uploaderProfile?.role !== 'admin') {
    return { error: "Permission denied. You do not own this folder." };
  }
  
  // ধাপ ৩: ঐ ফোল্ডারের ভেতরে থাকা সমস্ত ফাইলের তালিকা স্টোরেজ থেকে আনা
  const clientFolderName = `${(await supabase.from('profiles').select('last_name, first_name, id').eq('id', user.id).single()).data?.last_name}_${(await supabase.from('profiles').select('last_name, first_name, id').eq('id', user.id).single()).data?.first_name}_${user.id}`.toLowerCase().replace(/\s+/g, '_');
  const folderPath = `client-documents/${clientFolderName}/${folderToDelete.folder_name}`;
  
  const { data: filesInFolder, error: listError } = await supabase.storage.from('client-files').list(folderPath);

  if (listError) console.error("Could not list files to delete, but proceeding to delete folder record.");

  if (filesInFolder && filesInFolder.length > 0) {
      const filePathsToDelete = filesInFolder.map(file => `${folderPath}/${file.name}`);
      // ধাপ ৩.ক: স্টোরেজ থেকে ফাইলগুলো ডিলিট করা
      await supabase.storage.from('client-files').remove(filePathsToDelete);
      // ধাপ ৩.খ: ডাটাবেস থেকে ফাইলের রেকর্ডগুলো ডিলিট করা
      await supabase.from('client_files').delete().eq('owner_id', user.id).eq('folder_name', folderToDelete.folder_name);
  }
  
  // ধাপ ৪: ডাটাবেস থেকে কাস্টম ফোল্ডারের রেকর্ড ডিলিট করা
  const { error } = await supabase.from("client_custom_folders").delete().eq("id", folderId);
  if (error) return { error: 'Could not delete folder from database.' };
  
  revalidatePath('/lead-dashboard/documents');
  revalidatePath(`/dashboard/users/${folderToDelete.owner_id}`);
  return { success: true };
}