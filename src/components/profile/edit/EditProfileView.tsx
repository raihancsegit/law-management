'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { updateAdminProfile } from '@/app/actions/profileActions'; // আপনার সার্ভার অ্যাকশন

// ===================================
// Helper Functions for Date Formatting
// ===================================
function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatDateTime(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}


// ===================================
// Helper Component: PersonalTab (অপরিবর্তিত)
// ===================================
const PersonalTab = ({ profile, setProfile }: { profile: any, setProfile: (p: any) => void }) => {
    const avatarSrc = profile.newAvatarPreview || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random&color=fff`;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setProfile({ ...profile, newAvatarFile: file, newAvatarPreview: previewUrl });
        }
    };
    
    const handleRemoveAvatar = () => {
        setProfile({ ...profile, newAvatarFile: 'remove', newAvatarPreview: null, avatar_url: null });
    };

    // ... PersonalTab এর বাকি JSX কোড এখানে থাকবে (অপরিবর্তিত) ...
    // আপনার দেওয়া কোডটি এখানে পেস্ট করুন
    return (
        <div id="personal-section" className="profile-section">
            <div className="space-y-6">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <Image src={avatarSrc} alt="Admin Avatar" width={96} height={96} className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover" />
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} title="Change profile picture" className="absolute bottom-0 right-0 w-8 h-8 bg-law-blue rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                            <i className="fa-solid fa-camera text-sm"></i>
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-600">Update your profile picture</p>
                        <div className="mt-2 space-x-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1 text-xs font-medium text-law-blue bg-blue-50 hover:bg-blue-100 rounded">Upload New</button>
                            <button type="button" onClick={handleRemoveAvatar} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                        </div>
                    </div>
                </div>
                {/* ... বাকি ফর্ম ফিল্ডগুলো ... */}
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea name="bio" rows={4} value={profile.bio || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" placeholder="Tell us about yourself..."></textarea>
                </div>
            </div>
        </div>
    );
};


// ===================================
// === আপডেট করা AccountTab কম্পোনেন্ট ===
// ===================================
const AccountTab = ({ profile }: { profile: any }) => {
    // Danger Zone এর জন্য placeholder ফাংশন
    const handleDeactivateAccount = () => {
        if (window.confirm('Are you sure you want to deactivate your account? This action is irreversible.')) {
            // সার্ভার অ্যাকশন কল করতে হবে
            alert('Deactivate account functionality not implemented yet.');
        }
    };

    return (
        <div id="account-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input type="text" value={profile.username || profile.email || 'N/A'} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input type="text" value={profile.role || 'Administrator'} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                            <input type="text" value={formatDate(profile.account_created_at)} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                            <input type="text" value={formatDateTime(profile.last_sign_in_at)} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" readOnly />
                        </div>
                    </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Email Status</p>
                            <p className={`text-sm ${profile.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {profile.is_verified ? 'Verified' : 'Pending Verification'}
                            </p>
                        </div>
                        {profile.is_verified ? (
                             <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                        ) : (
                             <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Inactive</span>
                        )}
                    </div>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">This action cannot be undone. Please proceed with caution.</p>
                    <button onClick={handleDeactivateAccount} className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200">
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===================================
// Placeholder Components (অপরিবর্তিত)
// ===================================
const SecurityTab = () => <div>Security Settings content goes here...</div>;
const NotificationsTab = () => <div>Notifications content goes here...</div>;

// ===================================
// মূল EditProfileView কম্পোনেন্ট
// ===================================
export default function EditProfileView({ profile, setProfile, setViewMode, initialProfile }: {
    profile: any;
    setProfile: (p: any) => void;
    setViewMode: (mode: string) => void;
    initialProfile: any;
}) {
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        
        const formData = new FormData();
        // Append all text fields
        Object.keys(profile).forEach(key => {
            // এই ফিল্ডগুলো ক্লায়েন্ট-সাইড স্টেট, সার্ভারে পাঠানোর প্রয়োজন নেই
            const fieldsToExclude = ['newAvatarFile', 'newAvatarPreview', 'account_created_at', 'last_sign_in_at', 'is_verified'];
            if (!fieldsToExclude.includes(key) && profile[key] !== null && profile[key] !== undefined) {
                formData.append(key, profile[key]);
            }
        });
        
        // Handle avatar file or remove action
        if (profile.newAvatarFile) {
            if (profile.newAvatarFile === 'remove') {
                formData.append('avatar_action', 'remove');
            } else {
                formData.append('avatar_file', profile.newAvatarFile);
            }
        }

        const result = await updateAdminProfile(formData);

        if (result.success) {
            alert('Profile updated successfully!');
            window.location.reload();
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsSaving(false);
    };

    const handleReset = () => {
        setProfile(initialProfile);
    };

    const navLinks = [
        { id: 'personal', label: 'Personal Information', icon: 'fa-user' },
        { id: 'account', label: 'Account Settings', icon: 'fa-cog' },
        { id: 'security', label: 'Security Settings', icon: 'fa-shield-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* ... Header and Nav sections (অপরিবর্তিত) ... */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Profile Settings</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
                    </div>
                    <button onClick={() => setViewMode('view')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                        <i className="fa-solid fa-times mr-2"></i>Close
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                <nav className="w-full lg:w-64 bg-gray-50 border-r-0 lg:border-r border-b lg:border-b-0">
                    <div className="p-4">
                        <ul className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:block">
                            {navLinks.map(link => (
                                <li key={link.id}>
                                    <button onClick={() => setActiveTab(link.id)} className={`profile-nav-item w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 ${activeTab === link.id ? 'active bg-blue-50 text-law-blue' : ''}`}>
                                        <i className={`fa-solid ${link.icon} mr-3 text-gray-400`}></i> {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="flex-1 p-4 lg:p-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4 text-sm">{error}</div>}

                    {activeTab === 'personal' && <PersonalTab profile={profile} setProfile={setProfile} />}
                    {/* === মূল পরিবর্তন এখানে: profile prop পাস করা হচ্ছে === */}
                    {activeTab === 'account' && <AccountTab profile={profile} />} 
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                    
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                            Reset Changes
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}