'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleSignOut } from '@/app/actions/authActions';

// User টাইপে role property যোগ করা হয়েছে
type User = {
  name: string;
  avatar_url: string | null;
  role: 'lead' | 'client' | 'attorney' | 'admin'; // ভূমিকার টাইপ
  role_display: string;
};

// NavItem কম্পোনেন্ট (অপরিবর্তিত)
const NavItem = ({ href, icon, label, pathname }: {
  href: string,
  icon: string,
  label: string,
  pathname: string
}) => {
  const isActive = pathname === href; // startsWith ব্যবহার করলে সাব-রুটও অ্যাক্টিভ দেখাবে

  return (
    <li>
      <Link href={href}>
        <div className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 ${isActive ? 'bg-law-blue text-white' : 'text-gray-700'
          }`}>
          <i className={`${icon} mr-3 w-5 text-center ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  // ভূমিকা অনুযায়ী মেনু আইটেমগুলো সংজ্ঞায়িত করা
  const leadMenu = [
    { href: "/lead-dashboard", icon: "fa-solid fa-home", label: "Dashboard" },
    { href: "/lead-dashboard/consultation", icon: "fa-solid fa-calendar", label: "Schedule Consultation" },
    { href: "/lead-dashboard/resources", icon: "fa-solid fa-book", label: "Resources" },
  ];

  const clientMenu = [
    { href: "/lead-dashboard", icon: "fa-solid fa-home", label: "Dashboard" },
    { href: "/lead-dashboard/documents", icon: "fa-solid fa-folder-open", label: "My Documents" },
    { href: "/lead-dashboard/financials", icon: "fa-solid fa-clipboard-list", label: "Financial Questionnaire" },
    { href: "/lead-dashboard/messages", icon: "fa-solid fa-comments", label: "Secure Messages" },
    { href: "/lead-dashboard/settings", icon: "fa-solid fa-cog", label: "Settings" },
  ];

  // ব্যবহারকারীর ভূমিকা অনুযায়ী সঠিক মেনুটি বেছে নেওয়া
  const menuItems = user.role === 'client' ? clientMenu : leadMenu;

  const commonMenuItems = [
    { href: "/lead-dashboard/help", icon: "fa-solid fa-question-circle", label: "Help Centre" },
    { href: "/lead-dashboard/contact", icon: "fa-solid fa-phone", label: "Contact Us" },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-law-blue">Cohen & Cohen P.C.</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </ul>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <ul className="space-y-2">
            {commonMenuItems.map(item => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
            <li>
              <form action={handleSignOut}>
                <input type="hidden" name="redirectTo" value="/login" />
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