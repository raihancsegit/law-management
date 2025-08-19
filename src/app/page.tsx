import Link from 'next/link';
import HomeLayout from './HomeLayout'; // নতুন লেআউট ইম্পোর্ট

// Helper Component for info cards
const InfoCard = ({ icon, title, text, buttonText, buttonLink }: any) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${icon.bg}`}>
              <i className={`fa-solid ${icon.name} ${icon.color}`}></i>
          </div>
          <h4 className="ml-3 text-lg font-medium text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-500 text-sm mb-3">{text}</p>
      <Link href={buttonLink} className="text-law-blue hover:text-blue-800 text-sm font-medium">
          {buttonText}
      </Link>
  </div>
);

export default function HomePage() {
  return (
    <HomeLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-12 mt-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to the Cohen & Cohen P.C.
                </h3>
                <p className="text-gray-600">
                    Manage your bankruptcy case with Cohen & Cohen P.C.
                </p>
            </div>

            <section className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-12 mb-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-law-blue/10 mb-6">
                            <i className="fa-solid fa-file-contract text-3xl text-law-blue"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            Begin Your Journey to Financial Freedom
                        </h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Ready to take the next step? Our experienced attorneys are here to guide you through the bankruptcy process with compassion and expertise. Start your confidential online application today.
                        </p>
                        <Link href="/start-application" className="inline-flex items-center px-8 py-3 text-base font-medium rounded-lg text-white bg-law-blue hover:bg-blue-800 shadow">
                            <i className="fa-solid fa-play mr-2"></i>
                            Start Bankruptcy Application
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard 
                        icon={{ name: 'fa-phone', bg: 'bg-law-gold/10', color: 'text-law-gold'}}
                        title="Contact Us"
                        text="Need assistance? Our team is here to help."
                        buttonText="Get in Touch"
                        buttonLink="/contact"
                    />
                    <InfoCard 
                        icon={{ name: 'fa-book', bg: 'bg-green-100', color: 'text-green-600'}}
                        title="Resources"
                        text="Learn more about the bankruptcy process."
                        buttonText="View Resources"
                        buttonLink="/resources"
                    />
                    <InfoCard 
                        icon={{ name: 'fa-question-circle', bg: 'bg-purple-100', color: 'text-purple-600'}}
                        title="FAQ"
                        text="Find answers to common questions."
                        buttonText="View FAQ"
                        buttonLink="/faq"
                    />
                </div>
            </section>
        </div>
      </div>
    </HomeLayout>
  );
}