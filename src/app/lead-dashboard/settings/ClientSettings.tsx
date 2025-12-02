'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { updateClientProfile, updateClientNotificationPrefs, changeClientPassword } from '@/app/actions/clientActions';
import { useRouter } from 'next/navigation';
import { getFullActivityLog } from '@/app/actions/profileActions';

// ===================================
// Helper Components & Functions
// ===================================

const ToastMessage = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
    <div className={`p-3 rounded-md mb-6 text-sm ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {message}
    </div>
);

// === মূল ফিক্স: parseUserAgent ফাংশনটিকে টপ-লেভেলে আনা হয়েছে ===
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

// Change Password Modal Component
const ChangePasswordModal = ({ setIsOpen, onResult }: { setIsOpen: (isOpen: boolean) => void, onResult: (result: any) => void }) => {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form action={(formData) => {
                    startTransition(async () => {
                        const result = await changeClientPassword(formData);
                        onResult(result);
                        if (result.success) setIsOpen(false);
                    });
                }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input type="password" name="new_password" required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input type="password" name="confirm_password" required className="w-full p-2 border rounded" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-law-blue text-white rounded disabled:opacity-50">
                            {isPending ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Login Activity Modal Component
const LoginActivityModal = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getFullActivityLog().then(result => {
            if (result.activities) {
                setActivities(result.activities.filter(a => a.action === 'USER_LOGIN'));
            }
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Login Activity</h3>
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? <p>Loading activity...</p> : (
                        <ul className="space-y-2">
                            {activities.map(act => {
                                // এখন parseUserAgent ফাংশনটি সঠিকভাবে পাওয়া যাবে
                                const { device, browser } = parseUserAgent(act.metadata?.user_agent);
                                return (
                                    <li key={act.id} className="p-3 bg-gray-50 rounded-md text-sm">
                                        <p><strong>Device:</strong> {device} - {browser}</p>
                                        <p><strong>IP:</strong> {act.metadata?.ip_address}</p>
                                        <p className="text-xs text-gray-500"><strong>Time:</strong> {new Date(act.created_at).toLocaleString()}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

// ===================================
// Main ClientSettings Component
// ===================================
export default function ClientSettings({ initialProfile }: { initialProfile: any }) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialProfile);
    const [prefs, setPrefs] = useState(initialProfile.client_preferences || {});
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const [isProfilePending, startProfileTransition] = useTransition();
    const [isPrefsPending, startPrefsTransition] = useTransition();

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePrefsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrefs({ ...prefs, [e.target.name]: e.target.checked });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {message && <ToastMessage message={message.text} type={message.type} />}

            {isPasswordModalOpen && <ChangePasswordModal
                setIsOpen={setIsPasswordModalOpen}
                onResult={(result) => setMessage({ text: result.message || result.error, type: result.success ? 'success' : 'error' })}
            />}
            {isActivityModalOpen && <LoginActivityModal setIsOpen={setIsActivityModalOpen} />}

            <section id="profile-settings" className="mb-8">
                <form action={(formData) => {
                    startProfileTransition(async () => {
                        const result = await updateClientProfile(formData);
                        if (result.success) {
                            setMessage({ text: result.message!, type: 'success' });
                            setAvatarPreview(null);
                            router.refresh();
                        } else {
                            setMessage({ text: result.error!, type: 'error' });
                        }
                    });
                }}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <i className="fa-solid fa-user mr-3 text-law-blue"></i>
                                Profile Information
                            </h2>
                            <p className="text-sm text-law-gray mt-1">Update your personal information and contact details</p>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="relative">
                                    <img
                                        src={avatarPreview || profile.avatar_url || 'https://placehold.co/80x80'}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <input
                                        type="file"
                                        name="avatar_file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/png, image/jpeg, image/gif"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-law-blue text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                                    >
                                        <i className="fa-solid fa-camera text-xs"></i>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{profile.first_name || ''} {profile.last_name || ''}</h3>
                                    <p className="text-law-gray">Client since {formatDate(profile.created_at)}</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-law-blue hover:text-blue-800 font-medium">Change profile photo</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" name="first_name" value={profile.first_name || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" name="last_name" value={profile.last_name || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input type="email" value={profile.email || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input type="tel" name="phone_number" value={profile.phone_number || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea name="address" rows={3} value={profile.address || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue" placeholder="Enter your full address"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button type="submit" disabled={isProfilePending} className="px-6 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50">
                                    {isProfilePending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            <section id="security-settings" className="mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center"><i className="fa-solid fa-shield-halved mr-3 text-law-blue"></i>Security & Privacy</h2>
                        <p className="text-sm text-law-gray mt-1">Manage your password and security preferences</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div><h3 className="font-medium text-gray-900">Password</h3></div>
                                <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 text-law-blue border border-law-blue rounded-lg hover:bg-law-blue hover:text-white transition-colors font-medium">Change Password</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div><h3 className="font-medium text-gray-900">Login Activity</h3><p className="text-sm text-law-gray">View recent login history</p></div>
                                <button type="button" onClick={() => setIsActivityModalOpen(true)} className="px-4 py-2 text-law-blue border border-law-blue rounded-lg hover:bg-law-blue hover:text-white transition-colors font-medium">View Activity</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="notification-settings" className="mb-8">
                <form action={(formData) => {
                    startPrefsTransition(async () => {
                        const result = await updateClientNotificationPrefs(formData);
                        if (result.success) {
                            setMessage({ text: result.message!, type: 'success' });
                            router.refresh();
                        } else {
                            setMessage({ text: result.error!, type: 'error' });
                        }
                    });
                }}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <i className="fa-solid fa-bell mr-3 text-law-blue"></i>
                                Notification Preferences
                            </h2>
                            <p className="text-sm text-law-gray mt-1">Choose how you want to be notified about updates</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div><h3 className="font-medium text-gray-900">Email Notifications</h3><p className="text-sm text-law-gray">Receive updates about your case via email</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="notify_email" checked={!!prefs.notify_email} onChange={handlePrefsChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-law-blue"></div></label>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div><h3 className="font-medium text-gray-900">SMS Notifications</h3><p className="text-sm text-law-gray">Get important alerts via text message</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="notify_sms" checked={!!prefs.notify_sms} onChange={handlePrefsChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-law-blue"></div></label>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div><h3 className="font-medium text-gray-900">Document Updates</h3><p className="text-sm text-law-gray">Notify when new documents are available</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="notify_document" checked={!!prefs.notify_document} onChange={handlePrefsChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-law-blue"></div></label>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div><h3 className="font-medium text-gray-900">Appointment Reminders</h3><p className="text-sm text-law-gray">Receive reminders before scheduled meetings</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="notify_appointment" checked={!!prefs.notify_appointment} onChange={handlePrefsChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-law-blue"></div></label>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div><h3 className="font-medium text-gray-900">Marketing Communications</h3><p className="text-sm text-law-gray">Receive newsletters and firm updates</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="notify_marketing" checked={!!prefs.notify_marketing} onChange={handlePrefsChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-law-blue"></div></label>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button type="submit" disabled={isPrefsPending} className="px-6 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50">
                                    {isPrefsPending ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            <section id="support-section" className="mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="fa-solid fa-life-ring mr-3 text-law-blue"></i>
                            Support &amp; Help
                        </h2>
                        <p className="text-sm text-law-gray mt-1">Get help and contact our support team</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <h3 className="font-medium">Call Support</h3>
                                <p className="text-sm text-law-gray">(555) 987-6543</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <h3 className="font-medium">Email Support</h3>
                                <p className="text-sm text-law-gray">support@cohenlaw.com</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <h3 className="font-medium">Help Center</h3>
                                <p className="text-sm text-law-gray">Browse FAQs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}