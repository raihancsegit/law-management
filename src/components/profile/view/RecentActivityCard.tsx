'use client';
export default function RecentActivityCard() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-sign-in-alt text-green-600 text-sm"></i></div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Logged in from Windows PC</p>
                        <p className="text-xs text-gray-600">Today at 9:45 AM</p>
                    </div>
                </div>
                {/* ... অন্যান্য অ্যাক্টিভিটি আইটেম ... */}
            </div>
            <div className="mt-4">
                <button className="text-sm font-medium text-law-blue hover:text-blue-700">View Full Activity Log →</button>
            </div>
        </div>
    );
}