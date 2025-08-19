'use client';
import Link from 'next/link';

export default function HomeHeader() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                           <i className="fa-solid fa-scale-balanced text-law-blue text-2xl mr-3"></i>
                           <h1 className="text-xl font-bold text-gray-800">Cohen & Cohen P.C.</h1>
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-2">
                        <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                            Client Login
                        </Link>
                        <Link href="/admin/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                            Staff Login
                        </Link>
                        <Link href="/start-application" className="px-4 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg shadow-sm">
                           Start Application
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}