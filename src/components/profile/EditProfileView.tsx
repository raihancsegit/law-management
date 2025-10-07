'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function EditProfileView({ profile, setProfile, setViewMode }: any) {
    const [activeTab, setActiveTab] = useState('personal');
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random&color=fff`;

    const handleSave = () => {
        alert('Saving changes...');
        setViewMode('view');
    };

    const navLinks = [
        { id: 'personal', label: 'Personal Information', icon: 'fa-user' },
        { id: 'account', label: 'Account Settings', icon: 'fa-cog' },
        { id: 'security', label: 'Security Settings', icon: 'fa-shield-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
        { id: 'preferences', label: 'System Preferences', icon: 'fa-sliders-h' },
        { id: 'activity', label: 'Activity Log', icon: 'fa-history' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                    {activeTab === 'personal' && (
                        <div id="personal-section" className="profile-section">
                             {/* ... আপনার Personal Section-এর HTML এখানে আসবে ... */}
                        </div>
                    )}
                    {activeTab === 'account' && (
                        <div id="account-section" className="profile-section">
                            {/* ... আপনার Account Section-এর HTML এখানে আসবে ... */}
                        </div>
                    )}
                    {/* ... অন্যান্য ট্যাবের জন্য ... */}

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button onClick={() => setViewMode('view')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Reset Changes</button>
                        <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}