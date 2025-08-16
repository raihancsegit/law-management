'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// একটি অ্যাডমিন ক্লায়েন্ট তৈরি করা, যা Service Role Key ব্যবহার করবে
const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // খুবই গুরুত্বপূর্ণ: এটি service_role কী
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
};

// --- অ্যাকশন ১: একজন স্টাফ মেম্বারকে স্থায়ীভাবে ডিলিট করা ---
export async function deleteStaffUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // নিশ্চিত করা যে কাজটি একজন অ্যাডমিনই করছে
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication failed.' };

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Permission denied.' };
  
  // অ্যাডমিন যেন নিজেকে ডিলিট করতে না পারে
  if (user.id === userId) return { error: "You cannot delete your own account." };

  const supabaseAdmin = createAdminClient();

  // Supabase Admin API ব্যবহার করে auth.users থেকে ইউজার ডিলিট করা
  // profiles টেবিল থেকে রো স্বয়ংক্রিয়ভাবে ডিলিট হয়ে যাবে ON DELETE CASCADE-এর কারণে
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting staff user:', error);
    return { error: 'Could not delete user: ' + error.message };
  }

  revalidatePath('/dashboard/staff');
  return { success: true };
}


// --- অ্যাকশন ২: একজন স্টাফ মেম্বারকে ডিঅ্যাক্টিভেট/অ্যাক্টিভেট করা ---
// আমরা profiles টেবিলে is_approved ফ্ল্যাগ ব্যবহার করব
export async function toggleStaffStatus(userId: string, currentStatus: boolean) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // নিশ্চিত করা যে কাজটি একজন অ্যাডমিনই করছে
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication failed.' };
  
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Permission denied.' };

  // অ্যাডমিন যেন নিজেকে ডিঅ্যাক্টিভেট করতে না পারে
  if (user.id === userId) return { error: "You cannot deactivate your own account." };
  
  const newStatus = !currentStatus;

  // profiles টেবিলে is_approved ফ্ল্যাগ আপডেট করা
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: newStatus })
    .eq('id', userId);
    
  if (error) {
    console.error('Error toggling staff status:', error);
    return { error: 'Could not update user status: ' + error.message };
  }

  revalidatePath('/dashboard/staff');
  return { success: true, newStatus };
}


export async function deleteUser(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  // অ্যাডমিন কিনা তা নিশ্চিত করা
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication failed.' };
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Permission denied.' };

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { error: 'Could not delete user: ' + error.message };
  }

  revalidatePath('/dashboard/staff');
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication failed.' };
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Permission denied.' };
  
  const newStatus = !currentStatus;
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_approved: newStatus })
    .eq('id', userId)
    .select('is_approved')
    .single();
    
  if (error) {
    return { error: 'Could not update user status: ' + error.message };
  }

  revalidatePath('/dashboard/staff');
  return { success: true, newStatus: data.is_approved };
}