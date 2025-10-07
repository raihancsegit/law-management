'use client';
import Image from 'next/image';

export default function PersonalSection({ profile, setProfile }: any) {
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random&color=fff`;

    return (
        <div id="personal-section" className="profile-section">
            <div className="space-y-6">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <Image src={avatarSrc} alt="Admin Avatar" width={96} height={96} className="w-24 h-24 rounded-full border-4 border-gray-200" />
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-law-blue rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                            <i className="fa-solid fa-camera text-sm"></i>
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-600">Update your profile picture</p>
                        <div className="mt-2 space-x-2">
                            <button className="px-3 py-1 text-xs font-medium text-law-blue bg-blue-50 hover:bg-blue-100 rounded">Upload New</button>
                            <button className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input type="text" value={profile.first_name || ''} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full form-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input type="text" value={profile.last_name || ''} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full form-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" value={profile.email || ''} className="w-full form-input bg-gray-100" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" value={profile.phone_number || ''} onChange={(e) => setProfile({...profile, phone_number: e.target.value})} className="w-full form-input" />
                    </div>
                </div>
            </div>
        </div>
    );
}