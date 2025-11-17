'use client';
import { useState, useEffect } from 'react';
import { getRecentActivity } from '@/app/actions/profileActions'; // আপনার অ্যাকশন ফাইলের সঠিক পাথ দিন

// Helper: User Agent পার্স করার জন্য
const parseUserAgent = (ua: string | null) => {
    if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
    
    // এটি একটি বেসিক পার্সার। আরো ভালো ফলাফলের জন্য ua-parser-js এর মতো লাইব্রেরি ব্যবহার করা যেতে পারে।
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

// Helper component for icons
const ActivityIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'USER_LOGIN':
            return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-sign-in-alt text-green-600 text-sm"></i></div>;
        case 'PROFILE_UPDATE':
            return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-user-edit text-blue-600 text-sm"></i></div>;
        case 'PASSWORD_CHANGE':
            return <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-key text-orange-600 text-sm"></i></div>;
        default:
            return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-history text-gray-600 text-sm"></i></div>;
    }
};

// Helper to format date into relative time
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
    
    // For older dates, show the actual date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};


export default function RecentActivityCard() {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadActivities() {
            setIsLoading(true);
            const result = await getRecentActivity();
            if (result.activities) {
                setActivities(result.activities);
            } else {
                setError(result.error || "Failed to load activities.");
            }
            setIsLoading(false);
        }
        loadActivities();
    }, []);

    // Function to generate a user-friendly description for an activity
    const getActivityDescription = (activity: any) => {
        if (activity.action === 'USER_LOGIN' && activity.metadata?.user_agent) {
            const { device, browser } = parseUserAgent(activity.metadata.user_agent);
            return `Logged in from ${device} using ${browser}`;
        }
        // Fallback to the default description stored in the database
        return activity.description;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3 min-h-[150px]"> {/* Added min-height for better layout during loading */}
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-gray-500">Loading activity...</p>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {!isLoading && !error && activities.length === 0 && (
                     <div className="flex justify-center items-center h-full">
                        <p className="text-sm text-gray-500">No recent activity found.</p>
                    </div>
                )}

                {!isLoading && !error && activities.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <ActivityIcon action={activity.action} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {getActivityDescription(activity)}
                            </p>
                            <p className="text-xs text-gray-600">{formatRelativeTime(activity.created_at)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm font-medium text-law-blue hover:text-blue-700 w-full text-center">
                    View Full Activity Log →
                </button>
            </div>
        </div>
    );
}