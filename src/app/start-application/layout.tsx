import ApplicationHeader from '@/components/application/ApplicationHeader';

// যেহেতু এই পেজটি পাবলিক, তাই কোনো সেশন চেক করার দরকার নেই
export default function StartApplicationLayout({ children }: { children: React.ReactNode }) {
  // একটি ডামি গেস্ট ইউজার অবজেক্ট
  const guestUser = { name: 'Guest', avatar_url: 'https://placehold.co/32x32' };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* এখানে আমরা guestUser পাস করছি */}
      <ApplicationHeader user={guestUser} />
      {children}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 text-center">
          <p className="text-sm text-gray-500">© 2024 Cohen & Cohen P.C. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}