'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

async function createActivityLog(action: string, description: string) {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        description
    });
}

// সার্ভার অ্যাকশন এখন FormData গ্রহণ করবে
export async function updateAdminProfile(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'User not authenticated' };

  // টপ-লেভেল প্রোফাইল ফিল্ডগুলো আলাদা করুন
  const updates: { [key: string]: any } = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone_number: formData.get('phone_number') as string,
    job_title: formData.get('job_title') as string,
    department: formData.get('department') as string,
    bio: formData.get('bio') as string,
  };

  // === নতুন কোড: প্রেফারেন্স অবজেক্ট তৈরি করা ===
  const preferences: { [key: string]: any } = {
    // Notifications
    email_new_client: formData.get('email_new_client') === 'on',
    email_form_submission: formData.get('email_form_submission') === 'on',
    email_document_upload: formData.get('email_document_upload') === 'on',
    email_system_update: formData.get('email_system_update') === 'on',
    push_browser: formData.get('push_browser') === 'on',
    push_sound: formData.get('push_sound') === 'on',
    schedule_start_time: formData.get('schedule_start_time'),
    schedule_end_time: formData.get('schedule_end_time'),
    // Preferences
    display_theme: formData.get('display_theme'),
    display_language: formData.get('display_language'),
    display_timezone: formData.get('display_timezone'),
    display_date_format: formData.get('display_date_format'),
    behavior_autosave: formData.get('behavior_autosave') === 'on',
    behavior_confirm_delete: formData.get('behavior_confirm_delete') === 'on',
    behavior_session_timeout: formData.get('behavior_session_timeout'),
  };
  
  // updates অবজেক্টে preferences যোগ করুন
  updates.preferences = preferences;
  
  // ... (আপনার অ্যাভাটার আপলোডের লজিক অপরিবর্তিত থাকবে) ...
  const avatarFile = formData.get('avatar_file') as File | null;
  const avatarAction = formData.get('avatar_action') as string;
  if (avatarFile && avatarFile.size > 0) {
    const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
    if (uploadError) return { error: `Failed to upload avatar: ${uploadError.message}` };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    updates.avatar_url = publicUrl;
  } else if (avatarAction === 'remove') {
    updates.avatar_url = null;
  }

  // ডেটাবেসে প্রোফাইল এবং প্রেফারেন্স একসাথে আপডেট করুন
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Profile Update Error:', error);
    return { error: error.message };
  }
  
  // সফল হলে লগ তৈরি করুন (যদি আপনার অ্যাক্টিভিটি লগ সিস্টেম থাকে)
   await createActivityLog('PREFERENCES_UPDATE', 'Updated notification and system preferences.');
  
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

   await createActivityLog('PASSWORD_CHANGE', 'Changed account password.');

  return { success: true };
}

export async function getUserSessions() {
  console.log("--- getUserSessions: Initiated (DB Function Method) ---");
  try {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'User not authenticated' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // অ্যাডমিন ক্লায়েন্ট তৈরি করা হচ্ছে RPC কল করার জন্য
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    console.log(`Calling RPC 'get_user_sessions' for user: ${user.id}`);

    // listUserSessions-এর পরিবর্তে ডাটাবেস ফাংশন (RPC) কল করা হচ্ছে
    const { data, error } = await supabaseAdmin.rpc('get_user_sessions', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error calling get_user_sessions RPC:', error);
      return { error: "Failed to fetch sessions from the database." };
    }

    console.log(`Success: Fetched ${data.length} sessions via RPC.`);
    return { sessions: data };

  } catch (e: any) {
    console.error("FATAL Error in getUserSessions:", e);
    return { error: e.message || "An unknown server error occurred." };
  }
}


// =============================================================
// revokeUserSession: সেশন ডিলিট করার জন্য চূড়ান্ত সংস্করণ
// =============================================================
export async function revokeUserSession(sessionId: string) {
    console.log("--- revokeUserSession: Initiated (Delete Method for Older Schema) ---");
    try {
        const supabase = createServerActionClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'User not authenticated' };
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        console.log(`Deleting session with ID: ${sessionId}`);

        // পুরোনো স্কিমার জন্য সেশনটি সরাসরি ডিলিট করা হচ্ছে
        const { error } = await supabaseAdmin
            .from('sessions')
            .delete() // <-- মূল লজিক: ডিলিট করা
            .eq('id', sessionId)
            .schema('auth'); // <-- auth স্কিমাতে কাজ করার জন্য এটি জরুরি

        if (error) {
            console.error('Error revoking session via delete:', error);
            return { error: error.message };
        }

        console.log("Session revoked (deleted) successfully.");
        revalidatePath('/dashboard/profile');
        return { success: true };

    } catch (e: any) {
        console.error("FATAL Error in revokeUserSession:", e);
        return { error: e.message || "An unknown server error occurred." };
    }
}

export async function getRecentActivity() {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); // সাম্প্রতিক ৫টি অ্যাক্টিভিটি আনুন

    if (error) {
        console.error("Error fetching activity log:", error);
        return { error: error.message };
    }

    return { activities: data };
}

// app/actions/profileActions.ts

// ... আপনার বিদ্যমান সার্ভার অ্যাকশনগুলোর পরে ...

export async function getFullActivityLog() {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // .limit() ছাড়া ব্যবহারকারীর সমস্ত লগ আনা হচ্ছে
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching full activity log:", error);
        return { error: error.message };
    }

    return { activities: data };
}