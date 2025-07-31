'use client'; 

import { User } from '@supabase/supabase-js';
import Link from 'next/link';

type ApplicationHeaderProps = {
  // পরে আমরা আসল ইউজার অবজেক্ট পাস করব
  user: { name?: string; avatar_url?: string };
};

export default function ApplicationHeader({ user }: ApplicationHeaderProps) {
  // এই ফাংশনগুলো পরে বাস্তবায়ন করা হবে
  const goBack = () => window.history.back();
  const openManualApplication = () => alert('Manual Application modal will open here.');
  const saveProgress = () => alert('Progress will be saved here.');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={goBack} className="mr-4 text-gray-500 hover:text-law-blue">
              {/* Font Awesome আইকন ব্যবহারের জন্য আপনার প্রজেক্টে তা সেটআপ থাকতে হবে */}
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
            <h1 className="text-xl font-bold text-law-blue">Cohen & Cohen P.C.</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={openManualApplication} className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
              <i className="fa-solid fa-download mr-2"></i>
              Manual Application
            </button>
            <button onClick={saveProgress} className="flex items-center px-3 py-2 text-sm font-medium text-law-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <i className="fa-solid fa-save mr-2"></i>
              Save Progress
            </button>
            <div className="flex items-center space-x-2">
              <img src={user.avatar_url || 'https://placehold.co/32x32'} alt="Client Avatar" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">{user.name || 'Guest'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}