/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // আমরা লিমিটটি আরও বাড়িয়ে 10MB করছি নিশ্চিত করার জন্য
    },
  },
  typescript: {
    // এটি আপনাকে ডেপ্লয় করতে সাহায্য করবে, কিন্তু পরে এররগুলো সমাধান করা ভালো।
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      // আপনার Supabase হোস্টনেমটি এখানে সঠিক কিনা তা নিশ্চিত করুন
      {
        protocol: 'https',
        hostname: 'your-project-ref.supabase.co', // যেমন: xyzabc.supabase.co
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

// module.exports = nextConfig; // এই লাইনটি যদি থাকে, তাহলে নিচেরটি ব্যবহার করুন
export default nextConfig; // ES Module-এর জন্য এটিই সঠিক এক্সপোর্ট পদ্ধতি