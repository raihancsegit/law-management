'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateFolderTemplate(templateId: number, newStructure: any[]) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase
    .from('folder_templates')
    .update({ 
        structure: newStructure,
        updated_at: new Date().toISOString() 
    })
    .eq('id', templateId);

  if (error) {
    console.error('Error updating folder template:', error);
    return { error: error.message };
  }

  // ফোল্ডার পেজের ক্যাশ বাতিল করা হচ্ছে
  revalidatePath('/dashboard/folders');
  return { success: true };
}