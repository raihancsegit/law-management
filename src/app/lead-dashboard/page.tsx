import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Helper Component for Info Cards
const InfoCard = ({ href, icon, iconBg, title, text, buttonText }: {
  href: string;
  icon: string;
  iconBg: string;
  title: string;
  text: string;
  buttonText: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center mb-4">
      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${iconBg}`}>
        <i className={icon}></i>
      </div>
      <h4 className="ml-3 text-lg font-medium text-gray-900">{title}</h4>
    </div>
    <p className="text-gray-500 text-sm mb-3">{text}</p>
    <Link href={href} className="text-law-blue hover:text-blue-800 text-sm font-medium">
      {buttonText}
    </Link>
  </div>
);

// Initial State Component - যখন কোনো অ্যাপ্লিকেশন শুরু হয়নি
const InitialState = () => (
  <section id="initial-state-section" className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-law-blue/10 mb-6">
          <i className="fa-solid fa-file-contract text-2xl text-law-blue"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Bankruptcy Application</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Ready to take the next step toward financial freedom? Our experienced attorneys are here to guide you.
        </p>
        <Link href="/start-application" className="inline-flex items-center px-8 py-3 text-base font-medium rounded-lg text-white bg-law-blue hover:bg-blue-800">
          <i className="fa-solid fa-play mr-2"></i>
          Start Bankruptcy Application
        </Link>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InfoCard
        href="/lead-dashboard/contact"
        icon="fa-solid fa-phone text-law-gold"
        iconBg="bg-law-gold/10"
        title="Contact Us"
        text="Need assistance? Our team is here to help."
        buttonText="Call (555) 123-4567"
      />
      <InfoCard
        href="/lead-dashboard/resources"
        icon="fa-solid fa-book text-green-600"
        iconBg="bg-green-100"
        title="Resources"
        text="Learn more about the bankruptcy process."
        buttonText="View Resources"
      />
      <InfoCard
        href="/lead-dashboard/help"
        icon="fa-solid fa-question-circle text-purple-600"
        iconBg="bg-purple-100"
        title="FAQ"
        text="Find answers to common questions."
        buttonText="View FAQ"
      />
    </div>
  </section>
);

// In Progress State Component - যখন অ্যাপ্লিকেশন চলছে
const InProgressState = ({ progress }: { progress: number }) => (
  <section id="in-progress-state-section" className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 flex-shrink-0">
          <i className="fa-solid fa-clock text-amber-600 text-xl"></i>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Application in Progress</h3>
          <p className="text-gray-600 mb-6">
            Your bankruptcy application is currently being reviewed by our legal team.
          </p>
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-law-blue h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mb-6">Progress: {progress}% Complete</p>
          <Link href="/application/form/1" className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg text-white bg-law-blue hover:bg-blue-800">
            <i className="fa-solid fa-arrow-right mr-2"></i>
            Continue Application
          </Link>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h4>
      <p className="text-sm text-gray-500">No new updates.</p>
    </div>
  </section>
);

// Submitted State Component - যখন অ্যাপ্লিকেশন জমা দেওয়া হয়ে গেছে
const SubmittedState = () => (
  <section id="submitted-state-section" className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <i className="fa-solid fa-check text-2xl text-green-600"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Application Received</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We have received your application. Our team will review it and contact you within 48 hours.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <i className="fa-solid fa-info-circle mr-2"></i>
            If you don't hear from us within 48 hours, please contact our office.
          </p>
        </div>
        <Link href="/lead-dashboard/contact" className="inline-flex items-center px-6 py-2 border border-law-blue text-sm font-medium rounded-lg text-law-blue bg-white hover:bg-gray-50">
          <i className="fa-solid fa-phone mr-2"></i>
          Contact Us
        </Link>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">What Happens Next?</h4>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-law-blue text-white text-xs font-medium">1</div>
          <p className="text-sm text-gray-500">Our attorneys will review your application and documents</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-law-blue text-white text-xs font-medium">2</div>
          <p className="text-sm text-gray-500">We'll contact you to discuss your case and next steps</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-law-blue text-white text-xs font-medium">3</div>
          <p className="text-sm text-gray-500">We'll guide you through the bankruptcy filing process</p>
        </div>
      </div>
    </div>
  </section>
);


// --- মূল পেজ কম্পোনেন্ট ---
export default async function LeadDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // ব্যবহারকারীর প্রোফাইল এবং অ্যাপ্লিকেশন স্ট্যাটাস আনা
  const { data: leadData, error } = await supabase
    .from('profiles')
    .select(`
      first_name,
      form_submissions (
        status,
        current_step
      )
    `)
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 মানে কোনো রো পাওয়া যায়নি, যা একটি বৈধ সিনারিও
    console.error('Lead dashboard error:', error.message);
    return <div>Error loading dashboard. Please try again.</div>;
  }
  
  const submission = leadData && Array.isArray(leadData.form_submissions) ? leadData.form_submissions[0] : null;
  const applicationStatus = submission?.status || 'initial';
  const progress = submission ? Math.round((submission.current_step / 4) * 100) : 0; // মোট ৪ ধাপ

  const renderContent = () => {
    switch (applicationStatus) {
      case 'in_progress':
        return <InProgressState progress={progress} />;
      case 'submitted':
        return <SubmittedState />;
      case 'initial':
      default:
        return <InitialState />;
    }
  };

  return (
    <div id="dashboard-section" className="section-content p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard, {leadData?.first_name || 'User'}!
          </h3>
          <p className="text-gray-500">
            Manage your bankruptcy case with Cohen & Cohen P.C.
          </p>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}