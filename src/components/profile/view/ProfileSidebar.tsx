'use client';
import Image from 'next/image';

export default function ProfileSidebar({ profile, setViewMode, setIsPasswordModalOpen }: any) {
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random&color=fff`;

    return (
        <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                    <Image src={avatarSrc} alt="Admin Avatar" width={96} height={96} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-200" />
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">{profile.first_name} {profile.last_name}</h3>
                    <p className="text-sm text-gray-600">Managing Partner</p>
                    <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
                    <div className="mt-4 space-y-2">
                        <button onClick={() => setViewMode('edit')} className="w-full px-4 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg transition-colors duration-200">
                            <i className="fa-solid fa-edit mr-2"></i>Edit Profile
                        </button>
                        <button onClick={() => setIsPasswordModalOpen(true)} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                            <i className="fa-solid fa-key mr-2"></i>Change Password
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Stats</h4>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Login Sessions</span>
                        <span className="text-sm font-medium text-gray-900">2 Active</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Login</span>
                        <span className="text-sm font-medium text-gray-900">Today, 9:45 AM</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Created</span>
                        <span className="text-sm font-medium text-gray-900">Jan 15, 2023</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role</span>
                        <span className="px-2 py-1 text-xs font-medium bg-law-gold text-white rounded-full capitalize">{profile.role}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}