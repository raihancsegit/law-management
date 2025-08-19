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

const StatCard = ({ title, value, icon, bg, text }: any) => (
  <div className={`bg-white rounded-lg border-gray-200 shadow-sm border p-6 text-center ${bg}`}>
      <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
        <i className={`fa-solid ${icon} ${text} text-xl`}></i>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

const WorkflowStep = ({ step, title, status, description, buttonText, buttonLink, inProgressValue, isLocked = false }: any) => {
    const statusStyles: { [key:string]: any } = {
        Completed: { icon: 'fa-check', bg: 'bg-green-100', text: 'text-green-800' },
        'In Progress': { icon: 'fa-clock', bg: 'bg-amber-100', text: 'text-amber-800' },
        Ready: { icon: step, bg: 'bg-blue-100', text: 'text-law-blue' },
        Locked: { icon: 'fa-lock', bg: 'bg-gray-100', text: 'text-gray-400' },
    };
    const currentStatus = statusStyles[status];

    return (
        <div className={`bg-white border-gray-200 rounded-lg shadow-sm border overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
            <div className="p-6">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${currentStatus.bg}`}>
                       <i className={`fa-solid ${currentStatus.icon} text-xl ${status === 'Ready' ? 'hidden' : ''}`}></i>
                       {status === 'Ready' && <span className={`font-bold text-lg ${currentStatus.text}`}>{step}</span>}
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentStatus.bg} ${currentStatus.text}`}>{status}</span>
                        </div>
                        <p className="text-gray-500 mb-4">{description}</p>
                        {!isLocked && buttonText && (
                             <Link href={buttonLink} className="inline-flex items-center px-4 py-2 bg-law-blue text-white rounded-lg">
                                <i className="fa-solid fa-arrow-right mr-2"></i> {buttonText}
                            </Link>
                        )}
                        {inProgressValue && (
                             <p className="text-sm text-law-blue font-medium mt-2">{inProgressValue}</p>
                        )}
                        {isLocked && <p className="text-sm italic text-gray-500">Complete previous steps to unlock.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


// === নতুন ক্লায়েন্ট ড্যাশবোর্ড কম্পোনেন্ট ===
const ClientDashboard = ({ profile }: { profile: any }) => (
    <div id="dashboard-section" className="p-6">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {profile.first_name}!</h3>
                <p className="text-gray-500">Complete your bankruptcy case in 4 simple steps</p>
            </div>

            {/* Step-by-Step Workflow */}
            <div className="space-y-6">
                <WorkflowStep step="1" title="Critical Information & Rules" status="Completed" description="..." buttonText="View Detailed Information" buttonLink="#" />
                <WorkflowStep step="2" title="Upload Required Documents" status="In Progress" description="..." buttonText="Continue Upload" buttonLink="/lead-dashboard/documents" inProgressValue="8 of 12 uploaded"/>
                <WorkflowStep step="3" title="Complete Financial Questionnaire" status="Ready" description="..." buttonText="Continue Questionnaire" buttonLink="/lead-dashboard/financials" inProgressValue="2 of 7 sections completed"/>
                <WorkflowStep step="4" title="Review & Submit Case" status="Locked" description="..." isLocked={true} />
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Case Status" value="Active & Ready" icon="fa-gavel" bg="bg-green-100" text="text-green-600" />
                <StatCard title="Next Appointment" value="Jan 28, 2025" icon="fa-calendar" bg="bg-blue-100" text="text-law-blue" />
                <StatCard title="New Messages" value="3 Unread" icon="fa-envelope" bg="bg-purple-100" text="text-purple-600" />
            </div>
        </div>
    </div>
);

// --- মূল পেজ কম্পোনেন্ট ---
export default async function LeadDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`*, form_submissions (status, current_step)`) // `*` দিয়ে সব কলাম আনা হচ্ছে
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Dashboard error:', error.message);
    return <div>Error loading dashboard.</div>;
  }

  if (!profile) {
    return redirect('/login?error=profile_not_found');
  }

  // --- ভূমিকা-ভিত্তিক রেন্ডারিং ---
  if (profile.role === 'client') {
    return <ClientDashboard profile={profile} />;
  }
  
  // --- লিডদের জন্য আপনার বিদ্যমান লজিক ---
  const submission = Array.isArray(profile.form_submissions) ? profile.form_submissions[0] : null;
  const applicationStatus = submission?.status || 'initial';
  const progress = submission ? Math.round((submission.current_step / 4) * 100) : 0;
  
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
    <div className="section-content p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard, {profile.first_name || 'User'}!</h3>
          <p className="text-gray-500">Manage your bankruptcy case with Cohen & Cohen P.C.</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}