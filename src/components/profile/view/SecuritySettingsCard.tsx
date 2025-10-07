'use client';
export default function SecuritySettingsCard() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h4>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Disabled</span>
                        <button className="px-3 py-1 text-xs font-medium text-law-blue bg-blue-50 hover:bg-blue-100 rounded">Enable</button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                        <p className="text-sm text-gray-600">Manage your login sessions</p>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium text-law-blue bg-blue-50 hover:bg-blue-100 rounded">View Sessions (2)</button>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Login Notifications</p>
                        <p className="text-sm text-gray-600">Get notified of new logins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-law-blue"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}