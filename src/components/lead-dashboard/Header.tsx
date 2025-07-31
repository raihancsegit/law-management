'use client';
import { usePathname } from 'next/navigation';

type User = {
  name: string;
  avatar_url: string | null;
};

const getPageTitle = (pathname: string) => {
    const titles: { [key: string]: string } = {
        '/lead-dashboard': 'Dashboard',
        '/lead-dashboard/consultation': 'Schedule Consultation',
        '/lead-dashboard/resources': 'Resources',
        '/lead-dashboard/help': 'Help Centre',
        '/lead-dashboard/contact': 'Contact Us',
    };
    return titles[pathname] || 'Dashboard';
};

export default function Header({ user }: { user: User }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{pageTitle}</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <i className="fa-solid fa-bell text-gray-600"></i>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <img src={user.avatar_url || 'https://placehold.co/32x32'} alt="Avatar" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}