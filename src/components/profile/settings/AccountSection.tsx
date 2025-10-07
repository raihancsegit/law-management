'use client';

// Props টাইপ (ঐচ্ছিক কিন্তু ভালো অভ্যাস)
type AccountSectionProps = {
    profile: {
        username?: string;
        role?: string;
        created_at?: string;
        // last_login_at?: string; // এই ডেটাটি আপনার 'profiles' টেবিলে থাকতে হবে
    };
    setProfile: (profile: any) => void;
};

export default function AccountSection({ profile, setProfile }: AccountSectionProps) {
    // জাভাস্ক্রিপ্ট Date অবজেক্টকে একটি পাঠযোগ্য ফরম্যাটে রূপান্তর করার জন্য
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div id="account-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input 
                                type="text" 
                                name="username"
                                value={profile.username || ''} 
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input 
                                type="text" 
                                value={profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''} 
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" 
                                readOnly 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                            <input 
                                type="text" 
                                value={formatDate(profile.created_at)} 
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" 
                                readOnly 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                            <input 
                                type="text" 
                                // value={formatDate(profile.last_login_at)} // আপনার ডেটাবেস থেকে এই তথ্য আসতে হবে
                                value="Today at 9:45 AM" // আপাতত হার্ডকোড করা
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" 
                                readOnly 
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Account Status</p>
                            <p className="text-sm text-green-600">Active & Verified</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">These actions cannot be undone. Please proceed with caution.</p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => alert('Reset Settings clicked')}
                            className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                            Reset All Settings to Default
                        </button>
                        <button 
                            onClick={() => alert('Deactivate Account clicked')}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                        >
                            Deactivate Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}