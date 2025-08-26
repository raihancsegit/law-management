'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js'

// একটি অ্যাডমিন ক্লায়েন্ট তৈরি করা (প্রয়োজনীয়)
const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
};

const getClientRootPath = (profile: { id: string, first_name: string | null, last_name: string | null }) => {
    const folderName = `${profile.last_name}_${profile.first_name}_${profile.id}`.toLowerCase().replace(/\s+/g, '_');
    return `client-documents/${folderName}`;
};

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



async function deleteClientFolderRecursive(supabaseAdmin: any, rootPath: string) {
    const { data: files, error: listError } = await supabaseAdmin.storage.from('client-files').list(rootPath, {
        limit: 1000 // একটি ফোল্ডারে ১০০০-এর বেশি ফাইল থাকলে পেজিনেশন লাগবে
    });

    if (listError) {
        console.error(`Could not list files in ${rootPath}:`, listError.message);
        // তালিকা পাওয়া না গেলেও ডিলিট করার চেষ্টা চালিয়ে যাওয়া যেতে পারে
    }

    if (files && files.length > 0) {
        const filePathsToDelete = files.flatMap((folder: any) => 
            folder.id === null 
                ? [`${rootPath}/${folder.name}/.placeholder`] // Subfolder placeholder
                : [`${rootPath}/${folder.name}`] // File
        );
        
        // সব সাব-ফোল্ডারের ফাইল তালিকা করা
        for (const folder of files.filter((f:any) => f.id === null)) {
            const {data: subFiles} = await supabaseAdmin.storage.from('client-files').list(`${rootPath}/${folder.name}`);
            if(subFiles && subFiles.length > 0) {
                filePathsToDelete.push(...subFiles.map((sf:any) => `${rootPath}/${folder.name}/${sf.name}`));
            }
        }
        
        console.log("Attempting to delete storage paths:", filePathsToDelete);

        if (filePathsToDelete.length > 0) {
            const { error: removeError } = await supabaseAdmin.storage.from('client-files').remove(filePathsToDelete);
            if (removeError) {
                // একটি non-breaking error হিসেবে লগ করা, যাতে মূল প্রক্রিয়া চলতে পারে
                console.error(`Partial deletion failed in ${rootPath}:`, removeError.message);
            }
        }
    }
}


// === convertClientToLead (শক্তিশালী ফোল্ডার ডিলিটিংসহ আপডেট) ===
export async function convertClientToLead(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  const supabaseAdmin = createAdminClient();

  // ... (অ্যাডমিন চেক) ...

  const { data: clientProfile } = await supabase.from('profiles').select('id, first_name, last_name').eq('id', userId).single();
  if (!clientProfile) return { error: 'Client profile not found.' };
  
  // নতুন helper ফাংশন ব্যবহার করে ফোল্ডার ডিলিট করা
  const rootPath = getClientRootPath(clientProfile);
  await deleteClientFolderRecursive(supabaseAdmin, rootPath);
  
  const { error } = await supabase.from('profiles').update({ role: 'lead' }).eq('id', userId);
  if (error) return { error: 'Could not update user role to lead.' };
  
  revalidatePath('/dashboard/staff');
  return { success: true, message: 'User reverted to lead, and their folder was deleted.' };
}


// === deleteUser (শক্তিশালী ফোল্ডার ডিলিটিংসহ আপডেট) ===
export async function deleteUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  const supabaseAdmin = createAdminClient();

  // ... (অ্যাডমিন চেক) ...
  
  const { data: userProfile } = await supabase.from('profiles').select('id, first_name, last_name, role').eq('id', userId).single();
  
  if (userProfile && userProfile.role === 'client') {
      const rootPath = getClientRootPath(userProfile);
      // নতুন helper ফাংশন ব্যবহার করে ফোল্ডার ডিলিট করা
      await deleteClientFolderRecursive(supabaseAdmin, rootPath);
  }
  
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { error: 'Could not delete user account: ' + error.message };

  revalidatePath('/dashboard/staff');
  return { success: true };
}

export async function saveFinancialsProgress(submissionData: any) {
    const supabase = createServerActionClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated.' };

    const { error } = await supabase
        .from('form_submissions')
        .upsert({
            user_id: user.id,
            form_id: 2, // Financial Questionnaire-এর আইডি
            submission_data: submissionData
        }, { onConflict: 'user_id, form_id' }); // user_id এবং form_id মিলে গেলে আপডেট করবে

    if (error) {
        console.error('Save Financials Error:', error);
        return { error: 'Could not save progress.' };
    }

    revalidatePath('/lead-dashboard/financials');
    return { success: true };
}