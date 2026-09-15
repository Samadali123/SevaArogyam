import React from 'react';
import { 
  Calendar, 
  Download, 
  Video, 
  RefreshCw,
  Gift,
  Copy,
  Share2,
  Users,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../services/api';

interface PatientDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const { appointments, prescriptions, currentUser, openBookingModal, language, rescheduleAppointment, updateAppointmentStatus } = useApp();
  const [reschedulingApptId, setReschedulingApptId] = React.useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleSlot, setRescheduleSlot] = React.useState('');
  const [copiedCode, setCopiedCode] = React.useState(false);

  const rawName = (currentUser as any)?.name;
  const patientName = (rawName && rawName.trim().toLowerCase() !== 'patient') ? rawName : 'Samad';
  const patientPhone = (currentUser as any)?.phone || '9826198261';

  // Filter patient appointments
  const myAppointments = appointments.filter(a => a.patientPhone === patientPhone || a.patientId === currentUser?.id);
  const myPrescriptions = prescriptions.filter(p => p.patientPhone === patientPhone || p.patientId === currentUser?.id);

  const [referralInfo, setReferralInfo] = React.useState<{
    referralCode: string;
    referralCount: number;
    rewardAmount: number;
  }>({
    referralCode: (currentUser as any)?.referralCode || `SEVA-${patientName.toUpperCase().replace(/[^A-Z]/g, '')}-24`,
    referralCount: (currentUser as any)?.referralsCount || (currentUser as any)?.referralCount || 0,
    rewardAmount: (currentUser as any)?.walletBalance || 0,
  });

  React.useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/referral/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY) || ''}` },
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson?.data) {
            setReferralInfo({
              referralCode: resJson.data.referralCode || referralInfo.referralCode,
              referralCount: Number(resJson.data.successfulReferrals || 0),
              rewardAmount: Number(resJson.data.walletBalance || 0),
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch referral stats:', err);
      }
    };
    if (currentUser) {
      fetchReferralStats();
    }
  }, [currentUser]);

  const downloadProtectedPdf = async (endpoint: string, filename: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY) || ''}` },
    });
    if (!response.ok) throw new Error('Unable to download document');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyReferralCode = () => {
    navigator.clipboard?.writeText(referralInfo.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 font-manrope text-slate-800">
      
      {/* Welcome Patient Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] p-8 sm:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/10 glow-teal">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2.5 text-center md:text-left z-10">
          <span className="text-xs font-sora font-extrabold text-emerald-300 uppercase tracking-widest block">
            {language === 'en' ? 'PATIENT PORTAL DASHBOARD' : 'मरीज़ पोर्टल डैशबोर्ड'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-sora font-extrabold tracking-tight text-white">
            {language === 'en' ? 'Welcome back, ' : 'स्वागत है, '}
            <span className="bg-linear-to-r from-emerald-300 via-sky-200 to-teal-200 bg-clip-text text-transparent font-black">
              {patientName}
            </span>
            <span className="inline-block animate-bounce ml-1.5">👋</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-sky-100/90 max-w-xl font-medium leading-relaxed">
            {language === 'en' 
              ? 'Manage your hospital appointment tokens, instant video OPD consultations, medical prescriptions, and care services.' 
              : 'अपने अस्पताल के अपॉइंटमेंट टोकन, वीडियो परामर्श और चिकित्सा नुस्खे प्रबंधित करें।'}
          </p>
        </div>

        <button
          onClick={() => openBookingModal(undefined, undefined)}
          className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sora font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-xl transition transform hover:scale-[1.02] shrink-0 flex items-center gap-2 cursor-pointer z-10 glow-emerald"
        >
          <Calendar className="w-4 h-4 text-slate-950" />
          <span>{language === 'en' ? 'Book New OPD Appointment' : 'नया OPD अपॉइंटमेंट बुक करें'}</span>
        </button>
      </div>

      {/* Patient Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-sora font-extrabold text-xl text-slate-900">
              {language === 'en' ? 'My Appointments & Token History' : 'मेरे अपॉइंटमेंट और टोकन'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {language === 'en' ? 'Live queue tokens, physical OPD bookings, and completed video calls.' : 'लाइव लाइन टोकन, ओपीडी बुकिंग और पूर्ण वीडियो कॉल।'}
            </p>
          </div>
          <span className="bg-sky-50 text-[#0F4C81] border border-sky-200 text-xs font-sora font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {myAppointments.length} {language === 'en' ? 'Total Records' : 'कुल रिकॉर्ड'}
          </span>
        </div>

        {myAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p>{language === 'en' ? 'No appointments found. Book your first consultation today!' : 'कोई अपॉइंटमेंट नहीं मिला। आज ही परामर्श बुक करें!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAppointments.map(appt => {
              const statusLabelHi = 
                appt.status === 'CONFIRMED' ? 'सत्यापित' :
                appt.status === 'COMPLETED' ? 'पूर्ण' :
                appt.status === 'CANCELLED' ? 'रद्द' :
                appt.status === 'IN_PROGRESS' ? 'जारी' : 'प्रतीक्षारत';

              const modeLabelHi = 
                appt.appointmentMode === 'IN_CLINIC' ? 'क्लिनिक ओपीडी' :
                appt.appointmentMode === 'VIDEO' ? 'वीडियो परामर्श' : appt.appointmentMode;

              const clinicLabelHi = 
                appt.clinicName?.toLowerCase().includes('sarangpur') ? 'सारंगपुर शाखा' :
                appt.clinicName?.toLowerCase().includes('shujalpur') ? 'शुजालपुर शाखा' :
                appt.clinicName?.toLowerCase().includes('rajgarh') ? 'राजगढ़ शाखा' : appt.clinicName;

              const cleanDate = appt.appointmentDate?.includes('T') ? appt.appointmentDate.split('T')[0] : appt.appointmentDate;

              return (
                <div key={appt.id} className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-4 hover:border-[#0F4C81] hover:bg-white transition duration-200 shadow-2xs">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sora font-bold text-xs text-[#0F4C81] bg-sky-100/90 px-3 py-1 rounded-xl border border-sky-200">
                        {language === 'en' ? `Token #${appt.tokenNumber || 'SAR-01'}` : `टोकन #${appt.tokenNumber || 'SAR-01'}`}
                      </span>
                      <span className={`text-[10px] font-sora font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {language === 'en' ? appt.status : statusLabelHi}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-sora font-bold text-slate-900 text-base">{appt.doctorName}</h4>
                      <p className="text-xs text-emerald-700 font-bold mt-0.5">{appt.doctorSpecialization}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">📍 {language === 'en' ? appt.clinicName : clinicLabelHi}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                      <p className="flex justify-between text-slate-600 font-medium">
                        <span>{language === 'en' ? 'Date & Slot:' : 'तारीख और समय:'}</span>
                        <strong className="text-slate-900 font-bold">{cleanDate} | {appt.timeSlot}</strong>
                      </p>
                      <p className="flex justify-between text-slate-600 font-medium">
                        <span>{language === 'en' ? 'Mode:' : 'प्रकार:'}</span>
                        <strong className="text-[#0F4C81] font-bold">{language === 'en' ? appt.appointmentMode : modeLabelHi}</strong>
                      </p>
                      <p className="flex justify-between text-slate-600 font-medium">
                        <span>{language === 'en' ? 'Amount Paid:' : 'भुगतान:'}</span>
                        <strong className="text-emerald-700 font-black">₹{appt.amountPaid || 0}</strong>
                      </p>
                    </div>
                  </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  {appt.appointmentMode === 'VIDEO' && (appt.amountPaid > 0 || (appt.paymentStatus as string) === 'PAID' || appt.paymentStatus === 'SUCCESS') && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('telemedicine');
                        } else {
                          window.history.pushState({}, '', '/telemedicine');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Join Video' : 'परामर्श में शामिल हों'}</span>
                    </button>
                  )}

                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => { setReschedulingApptId(appt.id); setRescheduleDate(appt.appointmentDate); setRescheduleSlot(appt.timeSlot); }}
                        className="flex-1 bg-white hover:bg-slate-100 text-[#0F4C81] border border-[#0F4C81]/30 font-sora font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#0F4C81]" />
                        <span>{language === 'en' ? 'Reschedule' : 'रीशेड्यूल'}</span>
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                        className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-sora font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        {language === 'en' ? 'Cancel' : 'रद्द करें'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sora font-bold text-lg text-slate-900">{language === 'en' ? 'Reschedule Appointment' : 'अपॉइंटमेंट रीशेड्यूल करें'}</h3>
              <button onClick={() => setReschedulingApptId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{language === 'en' ? 'New Date' : 'नई तारीख'}</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0F4C81] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{language === 'en' ? 'New Time Slot' : 'नया समय'}</label>
              <select
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0F4C81] outline-none"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setReschedulingApptId(null)} className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs cursor-pointer">
                {language === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                onClick={async () => {
                  await rescheduleAppointment(reschedulingApptId, rescheduleDate, rescheduleSlot);
                  setReschedulingApptId(null);
                }}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-sora font-bold shadow-md cursor-pointer"
              >
                {language === 'en' ? 'Save New Slot' : 'सुरक्षित करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Medical Prescriptions Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-sora font-extrabold text-xl text-slate-900">{language === 'en' ? 'Digital Prescriptions & EMR Vault' : 'डिजिटल नुस्खे और EMR'}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{language === 'en' ? 'Download verified PDF prescriptions issued by JansevaArogyam doctors.' : 'डॉक्टरों द्वारा जारी सत्यापित पीडीएफ पर्चियां डाउनलोड करें।'}</p>
          </div>
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-sora font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {myPrescriptions.length} {language === 'en' ? 'Prescriptions' : 'पर्चियां'}
          </span>
        </div>

        {myPrescriptions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p>{language === 'en' ? 'No digital prescriptions issued yet.' : 'अभी तक कोई डिजिटल पर्ची जारी नहीं की गई है।'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPrescriptions.map(p => (
              <div key={p.id} className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-4 space-y-2 hover:border-purple-300 transition duration-200 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-sora font-bold text-slate-900 text-sm">{p.doctorName}</h4>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-sora font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                      Verified Rx
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-2">Diagnosis: <strong className="text-slate-800 font-bold">{p.diagnosis || 'General Checkup'}</strong></p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Issued: {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>

                <button
                  onClick={() => downloadProtectedPdf(`/patient/appointments/${p.appointmentId}/prescription/download`, `Prescription_${p.patientName}_${p.id.substring(0,5)}.pdf`)}
                  className="w-full btn-primary py-2.5 rounded-xl text-xs font-sora font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'en' ? 'Download PDF Prescription' : 'पीडीएफ डाउनलोड करें'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JansevaArogyam Referral Wallet */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-linear-to-br from-[#0B2545] via-[#0F4C81] to-[#0A2540] p-6 text-white sm:p-8 space-y-4">
            <span className="text-xs font-sora font-extrabold uppercase tracking-widest text-emerald-300 block">
              JansevaArogyam Rewards
            </span>
            <h3 className="text-2xl font-sora font-extrabold text-white">{language === 'en' ? 'Share care. Earn rewards.' : 'देखभाल साझा करें। रिवॉर्ड पाएं।'}</h3>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-sky-100/90 font-medium">
              {language === 'en' ? 'Refer friends and family to trusted healthcare. Every successful referral earns a reward for your next service.' : 'परिवार और दोस्तों को भरोसेमंद स्वास्थ्य सेवाओं के लिए रेफर करें। हर सफल रेफरल पर अगली सेवा के लिए रिवॉर्ड पाएं।'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('referrals');
                  } else {
                    window.location.assign('/referrals');
                  }
                }} 
                className="btn-emerald px-4 py-2.5 text-xs font-sora font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{language === 'en' ? 'Refer & Earn' : 'रेफर करें और कमाएं'}</span>
              </button>
              <button 
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('referrals');
                  } else {
                    window.location.assign('/referrals');
                  }
                }} 
                className="btn-secondary px-4 py-2.5 text-xs font-sora font-bold rounded-xl border border-white/30 text-white hover:bg-white/10 cursor-pointer"
              >
                {language === 'en' ? 'View Rewards' : 'रिवॉर्ड देखें'}
              </button>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-sora font-bold uppercase tracking-widest text-[#0F4C81]">{language === 'en' ? 'Your referral wallet' : 'आपका रेफरल वॉलेट'}</p>
                <h4 className="mt-0.5 font-sora font-bold text-[#0B2545] text-lg">{language === 'en' ? 'Ready to share' : 'शेयर करने के लिए तैयार'}</h4>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                <Gift className="h-5.5 w-5.5" />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{language === 'en' ? 'Referral code' : 'रेफरल कोड'}</p>
                <code className="font-sora font-extrabold text-[#0F4C81] text-sm tracking-wider">{referralInfo.referralCode}</code>
              </div>
              <button 
                onClick={copyReferralCode} 
                className="rounded-xl bg-white border border-slate-200 p-2.5 text-slate-600 shadow-2xs hover:text-[#0F4C81] hover:bg-slate-100 transition cursor-pointer" 
                title="Copy referral code"
              >
                {copiedCode ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Users className="h-4 w-4" />
                  <span className="text-[10px] font-sora font-bold uppercase tracking-wider">{language === 'en' ? 'Referrals' : 'रेफरल'}</span>
                </div>
                <p className="text-2xl font-sora font-extrabold text-slate-900">{referralInfo.referralCount}</p>
              </div>
              
              <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <Gift className="h-4 w-4" />
                  <span className="text-[10px] font-sora font-bold uppercase tracking-wider">{language === 'en' ? 'Available Reward' : 'उपलब्ध रिवॉर्ड'}</span>
                </div>
                <p className="text-2xl font-sora font-extrabold text-slate-900">₹{referralInfo.rewardAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

