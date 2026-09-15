import React, { useEffect, useState } from 'react';
import { Copy, Gift, Share2, Users, WalletCards, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, getApiErrorMessage } from '../services/api';

interface ReferralDashboard {
  referralCode: string;
  successfulReferrals: number;
  walletBalance: number;
  activeCoupons: number;
}

export const Referrals: React.FC = () => {
  const { language, activeRole, currentUser } = useApp();
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const hi = language === 'hi';
  const text = (english: string, hindi: string) => (hi ? hindi : english);

  useEffect(() => {
    if (!currentUser) return;
    api
      .get('/referral/dashboard')
      .then((response) => setDashboard(response.data))
      .catch((error) => setError(getApiErrorMessage(error, 'Unable to load referral dashboard.')));
  }, [currentUser]);

  const referralCode = dashboard?.referralCode || 'Loading...';
  const shareUrl = `https://jansevaarogyam.in/join/${referralCode}`;

  const copyText = async (value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const steps = [
    {
      step: '01',
      titleEn: 'Share Your Code',
      titleHi: 'अपना कोड शेयर करें',
      descEn: 'Send your unique referral code or invite link to friends & family.',
      descHi: 'अपने दोस्तों और परिवार को अपना यूनिक कोड या लिंक भेजें।'
    },
    {
      step: '02',
      titleEn: 'Friend Books Consultation',
      titleHi: 'मित्र अपॉइंटमेंट बुक करें',
      descEn: 'They book an OPD token or online video consultation at any branch.',
      descHi: 'वे किसी भी शाखा में ओपीडी या वीडियो परामर्श बुक करते हैं।'
    },
    {
      step: '03',
      titleEn: 'Earn Cash & Discount Rewards',
      titleHi: 'कैश और रिवार्ड कमाएं',
      descEn: 'Instant wallet cashback & care coupons credited directly to your profile.',
      descHi: 'तुरंत वॉलेट रिवार्ड और छूट अपने खाते में प्राप्त करें।'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10 font-manrope text-slate-800">
      
      {/* HERO & REWARD HIGHLIGHT BOX */}
      <div className="rounded-3xl bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10 glow-teal">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-5 relative z-10">
          <span className="text-xs font-sora font-extrabold text-emerald-300 uppercase tracking-widest block">
            {text('JANSEVAAROGYAM REWARDS & REFERRALS', 'जनसेवाआरोग्यम रिवार्ड्स एवं रेफरल')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-sora font-extrabold tracking-tight text-white leading-tight">
            {text('Care Shared is Care Rewarded.', 'देखभाल साझा करें, रिवार्ड्स पाएं।')}
          </h1>
          <p className="text-sm sm:text-base text-sky-100/90 font-medium leading-relaxed">
            {text(
              'Invite your family and friends to JansevaArogyam. Earn wallet cashback and special consultation discounts for every successful booking.',
              'अपने परिवार और दोस्तों को जनसेवाआरोग्यम पर आमंत्रित करें और हर सफल बुकिंग पर वॉलेट कैशबैक पाएं।'
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-700 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeRole === 'ADMIN' ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs space-y-3">
          <h2 className="text-xl font-sora font-bold text-slate-900">Referral Management Console</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Referral reward configurations, tracking logs, and coupon disbursements are managed securely through the central admin dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* MAIN DASHBOARD & STATS GRID */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
            
            {/* REFERRAL CODE & LINK CARD */}
            <aside className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-2xs">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-sora font-bold text-slate-900">{text('Your Referral Code', 'आपका रेफरल कोड')}</h2>
                  <p className="text-xs text-slate-500 font-medium">Share code with patients, friends & family</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
                <code className="font-sora font-extrabold text-xl text-[#0F4C81] tracking-wider">{referralCode}</code>
                <button 
                  onClick={() => copyText(referralCode)} 
                  className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer shadow-2xs" 
                  title="Copy referral code"
                >
                  <Copy className="h-4 w-4 text-[#0F4C81]" />
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <button 
                onClick={() => copyText(shareUrl)} 
                className="w-full btn-primary py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Share2 className="h-4 h-4 text-emerald-300" />
                <span>{text('Copy Invite Link', 'इनवाइट लिंक कॉपी करें')}</span>
              </button>

              {copied && (
                <p className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </p>
              )}
            </aside>

            {/* STATS HIGHLIGHT CARDS */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50/80 border border-emerald-100 p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{text('Referrals', 'कुल रेफरल')}</p>
                <p className="text-3xl font-sora font-extrabold text-slate-900">{dashboard?.successfulReferrals ?? 0}</p>
              </div>

              <div className="rounded-3xl bg-amber-50/80 border border-amber-100 p-6 space-y-3 shadow-2xs hover:border-amber-300 transition">
                <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                  <WalletCards className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{text('Wallet Balance', 'वॉलेट बैलेंस')}</p>
                <p className="text-3xl font-sora font-extrabold text-slate-900">₹{dashboard?.walletBalance ?? 0}</p>
              </div>

              <div className="rounded-3xl bg-sky-50/80 border border-sky-100 p-6 space-y-3 shadow-2xs hover:border-sky-300 transition">
                <div className="w-11 h-11 rounded-2xl bg-sky-100/80 text-[#0F4C81] flex items-center justify-center">
                  <Gift className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{text('Active Coupons', 'सक्रिय कूपन')}</p>
                <p className="text-3xl font-sora font-extrabold text-slate-900">{dashboard?.activeCoupons ?? 0}</p>
              </div>
            </div>

          </div>

          {/* HOW IT WORKS 3-STEP FLOW */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8">
            <div className="text-center space-y-2.5 max-w-xl mx-auto">
              <span className="text-xs font-sora font-extrabold text-[#0F4C81] uppercase tracking-widest block">
                {text('How It Works', 'यह कैसे काम करता है')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-sora font-extrabold text-slate-900">
                {text('3 Simple Steps to Earn Rewards', 'रिवार्ड्स कमाने के 3 आसान चरण')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {text('Helping your loved ones access quality healthcare gets rewarded instantly.', 'अपने प्रियजनों को गुणवत्तापूर्ण स्वास्थ्य सेवा से जोड़ने पर तुरंत रिवार्ड्स प्राप्त करें।')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((st) => (
                <div key={st.step} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-[#0F4C81] hover:bg-white hover:shadow-md transition duration-200">
                  <span className="text-3xl font-sora font-extrabold text-sky-300 group-hover:text-[#0F4C81] transition-colors block">{st.step}</span>
                  <h3 className="font-sora font-bold text-base text-slate-900">{hi ? st.titleHi : st.titleEn}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{hi ? st.descHi : st.descEn}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
};


