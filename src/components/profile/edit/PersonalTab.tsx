'use client';
import Image from 'next/image';

export default function PersonalTab({ profile, setProfile }: { profile: any, setProfile: (p: any) => void }) {
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random&color=fff`;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div id="personal-section" className="profile-section">
            <div className="space-y-6">
                {/* Profile Photo Section */}
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

                {/* Personal Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input type="text" name="first_name" value={profile.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input type="text" name="last_name" value={profile.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" value={profile.email || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" name="phone_number" value={profile.phone_number || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input type="text" name="job_title" value={profile.job_title || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select name="department" value={profile.department || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue">
                            <option value="">Select Department</option>
                            <option value="Administration">Administration</option>
                            <option value="Legal">Legal</option>
                            <option value="Client Services">Client Services</option>
                        </select>
                    </div>
                </div>

                {/* Bio Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea name="bio" rows={4} value={profile.bio || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" placeholder="Tell us about yourself..."></textarea>
                </div>
            </div>
        </div>
    );
}