'use client';
import { useState, useRef,useEffect,useMemo  } from 'react';
import Image from 'next/image';
import { updateAdminProfile } from '@/app/actions/profileActions'; // আপনার সার্ভার অ্যাকশন
import { 
    changeAdminPassword, 
    getUserSessions, 
    revokeUserSession,
    getFullActivityLog 
} from '@/app/actions/profileActions';
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
const SecurityTab = () => {
    // পাসওয়ার্ড পরিবর্তনের জন্য State
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const passwordFormRef = useRef<HTMLFormElement>(null);

    // সেশন ম্যানেজমেন্টের জন্য State
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null); // এরর মেসেজ দেখানোর জন্য State

    // পাসওয়ার্ড আপডেট হ্যান্ডলার
    const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsUpdatingPassword(true);
        setPasswordMessage(null);

        const formData = new FormData(event.currentTarget);
        const result = await changeAdminPassword(formData);

        if (result.success) {
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            passwordFormRef.current?.reset();
        } else {
            setPasswordMessage({ type: 'error', text: result.error || 'Failed to update password.' });
        }

        setIsUpdatingPassword(false);
    };
    
    // 컴포넌트 লোড হওয়ার পর সেশন আনার জন্য useEffect
    useEffect(() => {
        async function loadSessions() {
            setIsLoadingSessions(true);
            setSessionError(null); // প্রতিটি লোডের আগে এরর রিসেট করুন
            try {
                const result = await getUserSessions();
                if (result.sessions) {
                    const sortedSessions = result.sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setSessions(sortedSessions);
                } else {
                    console.error("Failed to load sessions:", result.error);
                    setSessionError(result.error || "Could not load sessions.");
                }
            } catch (error) {
                console.error("A client-side error occurred while fetching sessions:", error);
                setSessionError("A client-side error occurred. Please check the console.");
            } finally {
                setIsLoadingSessions(false); // সফল হোক বা ব্যর্থ, লোডিং স্টেট বন্ধ করুন
            }
        }
        loadSessions();
    }, []); // খালি dependency array মানে এটি শুধু একবার রান করবে

    // সেশন বাতিল করার হ্যান্ডলার
    const handleRevokeSession = async (sessionId: string) => {
        if (confirm('Are you sure you want to revoke this session? This will log the user out of that device.')) {
            const result = await revokeUserSession(sessionId);
            if (result.success) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                alert('Session revoked successfully.');
            } else {
                alert(`Failed to revoke session: ${result.error}`);
            }
        }
    };
    
    // User Agent থেকে ডিভাইস এবং ব্রাউজার বের করার একটি helper ফাংশন
    const parseUserAgent = (ua: string) => {
        if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
        let browser = 'Browser';
        if (ua.includes('Edg/')) browser = 'Edge'; else if (ua.includes('Chrome/')) browser = 'Chrome'; else if (ua.includes('Safari/')) browser = 'Safari'; else if (ua.includes('Firefox/')) browser = 'Firefox';
        let device = 'Device';
        if (/iPhone|iPad|iPod/.test(ua)) device = 'iOS Device'; else if (/Android/.test(ua)) device = 'Android Device'; else if (/Windows NT/.test(ua)) device = 'Windows PC'; else if (/Macintosh/.test(ua)) device = 'Mac';
        return { device, browser };
    };

    return (
        <div id="security-section" className="profile-section">
            <div className="space-y-6">
                {/* Change Password Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form ref={passwordFormRef} onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" name="new_password" required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" name="confirm_password" required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                        </div>
                        {passwordMessage && (
                            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {passwordMessage.text}
                            </div>
                        )}
                        <button type="submit" disabled={isUpdatingPassword} className="px-4 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg disabled:opacity-50">
                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Two-Factor Authentication (UI Only) */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">This feature is not yet available.</p>
                </div>

                {/* Active Sessions Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    
                    {isLoadingSessions && (
                        <p className="text-sm text-gray-500">Loading active sessions...</p>
                    )}

                    {!isLoadingSessions && sessionError && (
                        <p className="text-sm text-red-600">
                            <strong>Error:</strong> {sessionError}
                        </p>
                    )}

                    {!isLoadingSessions && !sessionError && (
                        sessions.length > 0 ? (
                            <div className="space-y-3">
                                {sessions.map((session, index) => {
                                    const { device, browser } = parseUserAgent(session.user_agent);
                                    const isCurrent = index === 0;
                                    return (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <i className={`fa-solid ${device.includes('PC') || device.includes('Mac') ? 'fa-desktop' : 'fa-mobile-alt'} text-gray-400 w-4 text-center`}></i>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{`${device} - ${browser}`}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {isCurrent ? 'Current session' : `Last active: ${new Date(session.created_at).toLocaleDateString()}`}
                                                        {' • IP: '}{session.ip}
                                                    </p>
                                                </div>
                                            </div>
                                            {isCurrent ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Current</span>
                                            ) : (
                                                <button onClick={() => handleRevokeSession(session.id)} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded">
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No other active sessions found.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};


// ===================================
// === NotificationsTab (সম্পূর্ণ এবং ডাইনামিক) ===
// ===================================
const NotificationsTab = ({ profile, setProfile }: { profile: any, setProfile: (p: any) => void }) => {
    // profile.preferences না থাকলে একটি খালি অবজেক্ট ব্যবহার করুন
    const prefs = profile.preferences || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isChecked = (e.target as HTMLInputElement).checked;
        
        setProfile({
            ...profile,
            preferences: {
                ...prefs,
                [name]: type === 'checkbox' ? isChecked : value,
            },
        });
    };

    return (
        <div id="notifications-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">New Client Registrations</p><p className="text-sm text-gray-600">Get notified when new clients register</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="email_new_client" checked={!!prefs.email_new_client} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Form Submissions</p><p className="text-sm text-gray-600">Get notified when clients submit forms</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="email_form_submission" checked={!!prefs.email_form_submission} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Document Uploads</p><p className="text-sm text-gray-600">Get notified when clients upload documents</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="email_document_upload" checked={!!prefs.email_document_upload} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">System Updates</p><p className="text-sm text-gray-600">Get notified about system maintenance and updates</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="email_system_update" checked={!!prefs.email_system_update} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Browser Notifications</p><p className="text-sm text-gray-600">Show notifications in your browser</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="push_browser" checked={!!prefs.push_browser} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Sound Notifications</p><p className="text-sm text-gray-600">Play sound for important notifications</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="push_sound" checked={!!prefs.push_sound} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input type="time" name="schedule_start_time" value={prefs.schedule_start_time || '09:00'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input type="time" name="schedule_end_time" value={prefs.schedule_end_time || '18:00'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Notifications will only be sent during these hours</p>
                </div>
            </div>
        </div>
    );
};
// ===================================
// === PreferencesTab (সম্পূর্ণ এবং ডাইনামিক) ===
// ===================================
const PreferencesTab = ({ profile, setProfile }: { profile: any, setProfile: (p: any) => void }) => {
    const prefs = profile.preferences || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isChecked = (e.target as HTMLInputElement).checked;
        
        setProfile({
            ...profile,
            preferences: {
                ...prefs,
                [name]: type === 'checkbox' ? isChecked : value,
            },
        });
    };

    return (
        <div id="preferences-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select name="display_theme" value={prefs.display_theme || 'Light'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="Light">Light Theme</option>
                                <option value="Dark">Dark Theme</option>
                                <option value="Auto">Auto (System)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select name="display_language" value={prefs.display_language || 'en-US'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="en-US">English (US)</option>
                                <option value="en-UK">English (UK)</option>
                                <option value="es-ES">Spanish</option>
                                <option value="fr-FR">French</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                            <select name="display_timezone" value={prefs.display_timezone || 'ET'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="ET">Eastern Time (ET)</option>
                                <option value="CT">Central Time (CT)</option>
                                <option value="MT">Mountain Time (MT)</option>
                                <option value="PT">Pacific Time (PT)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                            <select name="display_date_format" value={prefs.display_date_format || 'MM/DD/YYYY'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                                <option>YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Behavior</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Auto-save Forms</p><p className="text-sm text-gray-600">Automatically save form progress</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="behavior_autosave" checked={!!prefs.behavior_autosave} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-gray-900">Confirm Deletions</p><p className="text-sm text-gray-600">Show confirmation dialog before deleting items</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="behavior_confirm_delete" checked={!!prefs.behavior_confirm_delete} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                            <select name="behavior_session_timeout" value={prefs.behavior_session_timeout || '30 minutes'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option>15 minutes</option>
                                <option>30 minutes</option>
                                <option>1 hour</option>
                                <option>2 hours</option>
                                <option>Never</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">This feature is not yet available.</p>
                </div>
            </div>
        </div>
    );
};

// === নতুন ActivityLogTab কম্পোনেন্ট ===
// ===================================
const ActivityLogTab = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadLog() {
            setIsLoading(true);
            const result = await getFullActivityLog();
            if (result.activities) {
                setActivities(result.activities);
            } else {
                setError(result.error || "Failed to load activity log.");
            }
            setIsLoading(false);
        }
        loadLog();
    }, []);

    // শুধুমাত্র লগইন অ্যাক্টিভিটিগুলো ফিল্টার করার জন্য useMemo ব্যবহার করা হচ্ছে
    const loginHistory = useMemo(() => 
        activities.filter(activity => activity.action === 'USER_LOGIN'), 
    [activities]);

    const ActivityIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'USER_LOGIN':
            return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-sign-in-alt text-green-600 text-sm"></i></div>;
        case 'PROFILE_UPDATE':
        case 'PREFERENCES_UPDATE': // আপনি চাইলে প্রেফারেন্স আপডেটের জন্য আলাদা আইকন দিতে পারেন
            return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-user-edit text-blue-600 text-sm"></i></div>;
        case 'PASSWORD_CHANGE':
            return <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-key text-orange-600 text-sm"></i></div>;
        // আপনি ভবিষ্যতে আরো অ্যাকশন যোগ করতে পারেন
        // case 'FORM_CREATED':
        //     return <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-file-lines text-purple-600 text-sm"></i></div>;
        default:
            return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-history text-gray-600 text-sm"></i></div>;
    }
};


// ===================================
// Helper: User Agent Parser
// ===================================
const parseUserAgent = (ua: string | null) => {
    if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
    
    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Safari/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    
    let device = 'Device';
    if (/iPhone|iPad|iPod/.test(ua)) device = 'iOS Device';
    else if (/Android/.test(ua)) device = 'Android Device';
    else if (/Windows NT/.test(ua)) device = 'Windows PC';
    else if (/Macintosh/.test(ua)) device = 'Mac';
    
    return { device, browser };
};


// ===================================
// Helper: Relative Time Formatter
// ===================================
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (diffInSeconds < secondsInMinute) {
        return "just now";
    }
    if (diffInSeconds < secondsInHour) {
        const minutes = Math.floor(diffInSeconds / secondsInMinute);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < secondsInDay) {
        const hours = Math.floor(diffInSeconds / secondsInHour);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < secondsInDay * 2) {
        return 'Yesterday';
    }
    if (diffInSeconds < secondsInDay * 7) {
        const days = Math.floor(diffInSeconds / secondsInDay);
        return `${days} days ago`;
    }
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};


// ===================================
// Helper: Activity Description Generator
// ===================================
const getActivityDescription = (activity: any) => {
    if (activity.action === 'USER_LOGIN' && activity.metadata?.user_agent) {
        const { device, browser } = parseUserAgent(activity.metadata.user_agent);
        return `Logged in from ${device} using ${browser}`;
    }
    // ডাটাবেসে সংরক্ষিত ডিফল্ট ডেসক্রিপশনটি ব্যবহার করুন
    return activity.description;
};
    return (
        <div id="activity-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {isLoading && <p className="text-sm text-gray-500">Loading activity...</p>}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {!isLoading && !error && activities.length === 0 && <p className="text-sm text-gray-500">No activity found.</p>}
                        
                        {/* সাম্প্রতিক ৫টি অ্যাক্টিভিটি দেখানো হচ্ছে */}
                        {!isLoading && !error && activities.slice(0, 5).map(activity => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <ActivityIcon action={activity.action} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{getActivityDescription(activity)}</p>
                                    <p className="text-xs text-gray-600">
                                        {formatRelativeTime(activity.created_at)}
                                        {activity.metadata?.ip_address && ` • IP: ${activity.metadata.ip_address}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Login History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Date & Time</th>
                                    <th className="text-left py-2 font-medium">Device</th>
                                    <th className="text-left py-2 font-medium">IP Address</th>
                                    <th className="text-left py-2 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading && <tr><td colSpan={4} className="py-2 text-center text-gray-500">Loading history...</td></tr>}
                                {!isLoading && loginHistory.map(log => {
                                    const { device, browser } = parseUserAgent(log.metadata?.user_agent);
                                    return (
                                        <tr key={log.id}>
                                            <td className="py-2">{formatDateTime(log.created_at)}</td>
                                            <td className="py-2 text-gray-600">{`${device} - ${browser}`}</td>
                                            <td className="py-2 text-gray-600">{log.metadata?.ip_address || 'N/A'}</td>
                                            <td className="py-2"><span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Success</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
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
        
        Object.keys(profile).forEach(key => {
            const fieldsToExclude = ['preferences', 'newAvatarFile', 'newAvatarPreview', 'account_created_at', 'last_sign_in_at', 'is_verified'];
            if (!fieldsToExclude.includes(key) && profile[key] !== null && profile[key] !== undefined) {
                formData.append(key, profile[key]);
            }
        });

        if (profile.preferences) {
            Object.keys(profile.preferences).forEach(prefKey => {
                const value = profile.preferences[prefKey];
                if (typeof value === 'boolean') {
                    formData.append(prefKey, value ? 'on' : '');
                } else if (value !== null && value !== undefined) {
                    formData.append(prefKey, value);
                }
            });
        }
        
        if (profile.newAvatarFile) {
            if (profile.newAvatarFile === 'remove') {
                formData.append('avatar_action', 'remove');
            } else {
                formData.append('avatar_file', profile.newAvatarFile);
            }
        }

        const result = await updateAdminProfile(formData);

        if (result.success) {
            alert('Profile and settings updated successfully!');
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
        { id: 'preferences', label: 'Preferences', icon: 'fa-sliders-h' },
        { id: 'activity', label: 'Activity Log', icon: 'fa-history' },
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
                    {activeTab === 'notifications' && <NotificationsTab profile={profile} setProfile={setProfile} />}
                    {activeTab === 'preferences' && <PreferencesTab profile={profile} setProfile={setProfile} />}
                     {activeTab === 'activity' && <ActivityLogTab />} 
                     {(activeTab !== 'activity' && activeTab !== 'security' && activeTab !== 'account') && (
                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                                Reset Changes
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}