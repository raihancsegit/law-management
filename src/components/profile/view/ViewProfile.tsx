'use client';
import ProfileSidebar from './ProfileSidebar';
import PersonalInfoCard from './PersonalInfoCard';
import SecuritySettingsCard from './SecuritySettingsCard';
import RecentActivityCard from './RecentActivityCard';

export default function ViewProfile({ profile, setProfile, setViewMode, setIsPasswordModalOpen }: any) {
  return (
    <section id="admin-profile-section" className="section-content">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <ProfileSidebar 
          profile={profile} 
          setViewMode={setViewMode} 
          setIsPasswordModalOpen={setIsPasswordModalOpen} 
        />
        
        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          <PersonalInfoCard 
            profile={profile} 
            setProfile={setProfile} 
          />
          <SecuritySettingsCard />
          <RecentActivityCard />
        </div>
      </div>
    </section>
  );
}