'use client';
import { useState } from 'react';
import ViewProfile from '@/components/profile/view/ViewProfile';
import EditProfileView from '@/components/profile/edit/EditProfileView';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';

export default function ProfilePageClient({ initialProfile }: { initialProfile: any }) {
  const [viewMode, setViewMode] = useState('view');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  if (viewMode === 'edit') {
    return (
        <EditProfileView 
            profile={profile}
            setProfile={setProfile}
            setViewMode={setViewMode}
            initialProfile={initialProfile} // <-- এই প্রপটি যোগ করা হয়েছে
        />
    );
  }

  return (
    <>
      <ViewProfile 
        profile={profile} 
        setViewMode={setViewMode} 
        setIsPasswordModalOpen={setIsPasswordModalOpen} 
      />
      {isPasswordModalOpen && (
        <ChangePasswordModal setIsPasswordModalOpen={setIsPasswordModalOpen} />
      )}
    </>
  );
}