import React from 'react';
import HomeHeader from '@/components/layout/HomeHeader';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <HomeHeader />
            <main>
                {children}
            </main>
        </div>
    );
}