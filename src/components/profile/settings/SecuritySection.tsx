'use client';
export default function SecuritySection({ profile, setProfile }: any) {
    return (
        <div id="security-section" className="profile-section">
            <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" name="new_password" className="w-full form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" name="confirm_password" className="w-full form-input" />
                        </div>
                        <button className="btn-primary">Update Password</button>
                    </div>
                </div>
                {/* ... Two-Factor Authentication এবং Active Sessions-এর UI ... */}
            </div>
        </div>
    );
}