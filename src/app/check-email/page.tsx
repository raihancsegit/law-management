import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We have sent a confirmation link to your email address. Please click the link to verify your account and continue your application.
        </p>
        <Link href="/" className="text-law-blue hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}