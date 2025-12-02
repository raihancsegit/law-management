'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Action to update client's personal profile information including avatar
export async function updateClientProfile(formData: FormData) {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const profileUpdates: { [key: string]: any } = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        phone_number: formData.get('phone_number') as string,
        address: formData.get('address') as string,
    };

    // Handle avatar file upload
    const avatarFile = formData.get('avatar_file') as File | null;

    if (avatarFile && avatarFile.size > 0) {
        // Create a unique file path
        const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars') // Make sure you have a bucket named 'avatars'
            .upload(filePath, avatarFile, {
                upsert: true,
            });

        if (uploadError) {
            console.error('Avatar Upload Error:', uploadError);
            return { error: `Failed to upload new avatar: ${uploadError.message}` };
        }

        // Get the public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        // Add the URL to the database update object
        profileUpdates.avatar_url = publicUrl;
    }

    // Update the 'profiles' table in the database
    const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

    if (error) {
        console.error('Client Profile DB Update Error:', error);
        return { error: error.message };
    }

    // Revalidate the path to show updated data
    revalidatePath('/lead-dashboard/settings');
    return { success: true, message: "Profile information saved successfully." };
}

// Action to update client's notification preferences
export async function updateClientNotificationPrefs(formData: FormData) {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const clientPreferences = {
        notify_email: formData.get('notify_email') === 'on',
        notify_sms: formData.get('notify_sms') === 'on',
        notify_document: formData.get('notify_document') === 'on',
        notify_appointment: formData.get('notify_appointment') === 'on',
        notify_marketing: formData.get('notify_marketing') === 'on',
    };

    // Update the 'client_preferences' column in the 'profiles' table
    const { error } = await supabase
        .from('profiles')
        .update({ client_preferences: clientPreferences })
        .eq('id', user.id);

    if (error) {
        console.error('Client Notification Prefs DB Update Error:', error);
        return { error: error.message };
    }

    revalidatePath('/lead-dashboard/settings');
    return { success: true, message: "Notification preferences saved successfully." };
}

export async function changeClientPassword(formData: FormData) {
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
    return { success: true, message: "Password updated successfully." };
}