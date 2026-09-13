import { ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TermsConditionsProps {
  onBack?: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
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
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>LEGAL TERMS & CLINICAL POLICIES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Terms and Conditions
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Last Updated: January 2026 • Compliant with National Health Authority (NHA) & Medical Practice Guidelines.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed font-normal">
            
            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">1. Acceptance of Terms</h3>
              <p className="text-slate-600">
                By accessing SEVASADAN Health Care Network portals, booking physical OPD tokens, or utilizing our virtual telemedicine platform, you agree to comply with and be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">2. Physical OPD Token Booking</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>OPD tokens generated online represent estimated queue positions and are subject to emergency triage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Patients are advised to report to the selected clinic desk (Sarangpur, Shujalpur, or Rajgarh) 15 minutes prior to their estimated slot.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">3. Video Consultation & Tele-OPD</h3>
              <p className="text-slate-600">
                Telemedicine services are provided in strict compliance with the Telemedicine Practice Guidelines 2020. Video consultations are intended for non-emergency medical evaluations and follow-ups. In emergency situations, patients must immediately visit the nearest emergency room.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">4. Payments & Refund Policy</h3>
              <p className="text-slate-600">
                Online consultation fees collected via Razorpay or Cashfree are refundable if a cancellation request is submitted at least 2 hours before the scheduled appointment time.
              </p>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
};
