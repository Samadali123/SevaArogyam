import { ArrowLeft, Lock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-black text-[#0F4C81] bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-slate-800">
          
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-2 bg-sky-100 text-[#0F4C81] text-xs font-black px-3.5 py-1 rounded-full uppercase">
              <Lock className="w-4 h-4 text-[#0F4C81]" />
              <span>DATA PROTECTION & CONFIDENTIALITY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Last Updated: January 2026 • Compliant with Digital Personal Data Protection (DPDP) Standards.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed font-normal">
            
            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">1. Information We Collect</h3>
              <p className="text-slate-600">
                We collect personal and medical details necessary for healthcare delivery, including patient name, mobile number, age, gender, medical history, consultation records, and digital prescriptions.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">2. How Patient Data is Protected</h3>
              <p className="text-slate-600">
                All electronic health records (EHR) and digital prescriptions are encrypted and stored in secure cloud infrastructure compliant with healthcare security standards. Data access is strictly restricted to treating doctors and authorized desk staff.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">3. Data Sharing & Third Parties</h3>
              <p className="text-slate-600">
                SEVASADAN does not sell, rent, or trade patient personal health data. Information is shared only with verified diagnostic labs, pharmacy partners, or payment gateways (Razorpay/Cashfree) explicitly required to complete your medical service.
              </p>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
};
