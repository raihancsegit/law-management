'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleSignOut } from '@/app/actions/authActions';

type User = {
  name: string;
  avatar_url: string | null;
  role_display: string;
};

// NavItem এখন 'pathname' props হিসেবে গ্রহণ করবে
const NavItem = ({ href, icon, label, pathname }: { 
  href: string, 
  icon: string, 
  label: string, 
  pathname: string 
}) => {
  const isActive = pathname === href;

  return (
    <li>
      <Link href={href}>
        <div className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
            isActive ? 'bg-law-blue text-white' : 'text-gray-700'
        }`}>
          <i className={`${icon} mr-3 w-5 text-center ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
};

// মূল Sidebar কম্পোনেন্ট
export default function Sidebar({ user }: { user: User }) {
  // usePathname হুকটিকে এখানে, অর্থাৎ মূল ক্লায়েন্ট কম্পোনেন্টে কল করা হচ্ছে
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-law-blue">Cohen & Cohen P.C.</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* pathname ভ্যালুটি props হিসেবে পাস করা হচ্ছে */}
          <NavItem href="/lead-dashboard" icon="fa-solid fa-home" label="Dashboard" pathname={pathname} />
          <NavItem href="/lead-dashboard/consultation" icon="fa-solid fa-calendar" label="Schedule Consultation" pathname={pathname} />
          <NavItem href="/lead-dashboard/resources" icon="fa-solid fa-book" label="Resources" pathname={pathname} />
        </ul>
        
        <div className="border-t border-gray-200 mt-6 pt-6">
          <ul className="space-y-2">
            <NavItem href="/lead-dashboard/help" icon="fa-solid fa-question-circle" label="Help Centre" pathname={pathname} />
            <NavItem href="/lead-dashboard/contact" icon="fa-solid fa-phone" label="Contact Us" pathname={pathname} />
            <li>
              <form action={handleSignOut}>
                <button type="submit" className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                  <i className="fa-solid fa-sign-out-alt mr-3 text-red-500 w-5 text-center"></i>
                  <span>Sign Out</span>
                </button>
              </form>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <img src={user.avatar_url || 'https://placehold.co/40x40'} alt="Avatar" className="w-8 h-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role_display}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}