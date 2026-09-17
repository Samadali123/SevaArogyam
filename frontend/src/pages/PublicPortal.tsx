import React, { useState } from 'react';
import { 
  Building2, 
  Video, 
  MapPin, 
  Calendar,
  ChevronDown,
  Activity,
  Award,
  Stethoscope,
  PhoneCall,
  FileText,
  ChevronRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { 
  FiMapPin, 
  FiPhoneCall, 
  FiClock, 
  FiNavigation, 
  FiCalendar, 
  FiActivity, 
  FiHeart, 
  FiShield, 
  FiUserCheck,
  FiEye,
  FiAlertCircle
} from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { DEFAULT_BRANCH_IMAGES } from '../data/mockData';
import drAnkurImg from '../assets/images/Dr_Ankur.jpeg';

interface PublicPortalProps {
  onNavigate?: (tab: string) => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Jansevarogyam - Specialist OPD Hospital & Healthcare Network',
    description: 'Jansevarogyam (जनसेवा आरोग्यम) provides specialist doctor OPD appointments, 24x7 ICU emergency, lab tests, pharmacy & regional healthcare across Sarangpur, Shujalpur, and Rajgarh, MP.',
    keywords: 'jansevaarogyam, Janseva Arogyam, Janseva, Arogyam, Janseva Arogyam Clinic, Janseva Arogyam Hospital, जनसेवा आरोग्यम, Sarangpur hospital, Shujalpur clinic, Rajgarh doctor booking, OPD appointment online',
    canonical: 'https://jansevaarogyam.com/'
  });

  const { 
    clinics, 
    healthBlogs, 
    openBookingModal,
    setSelectedBlogId,
    language,
    setSelectedSpecialtyFilter
  } = useApp();

  // Filtering State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'How does the physical clinic Token System work at Sarangpur, Shujalpur, and Rajgarh?',
      qHi: 'सारंगपुर, शुजालपुर और राजगढ़ में इन-क्लीनिक टोकन प्रणाली कैसे काम करती है?',
      aEn: 'When you book an in-clinic visit, a sequential daily token (e.g., SAR-014 or RAJ-022) is generated automatically. You can track your queue live and arrive at the OPD counter without waiting in long manual lines.',
      aHi: 'जब आप इन-क्लीनिक अपॉइंटमेंट बुक करते हैं, तो एक टोकन नंबर जारी किया जाता है। आप अपने फोन से लाइव कतार स्थिति देख सकते हैं।'
    },
    {
      qEn: 'What do I need for a virtual video telemedicine consultation?',
      qHi: 'वीडियो टेलीमेडिसिन परामर्श के लिए क्या आवश्यक है?',
      aEn: 'You only need a smartphone, tablet, or laptop with a camera and microphone. You will receive an SMS with a direct 30-minute magic join link requiring no app downloads.',
      aHi: 'आपको केवल कैमरा और माइक वाले स्मार्टफोन या लैपटॉप की आवश्यकता है। आपको एसएमएस द्वारा एक डायरेक्ट जॉइन लिंक मिलेगा।'
    },
    {
      qEn: 'Can I download an official digital prescription after my video consult?',
      qHi: 'क्या मैं वीडियो परामर्श के बाद डिजिटल प्रिस्क्रिप्शन डाउनलोड कर सकता हूँ?',
      aEn: 'Yes! Doctors sign standardized digital prescriptions with official letterheads and digital signature stamps instantly after consults, available for 1-click PDF download.',
      aHi: 'जी हाँ! डॉक्टर परामर्श के बाद डिजिटल प्रिस्क्रिप्शन साइन करते हैं जिसे आप 1-क्लिक में पीडीएफ के रूप में डाउनलोड कर सकते हैं।'
    },
    {
      qEn: 'What payment options are supported?',
      qHi: 'भुगतान के कौन-कौन से विकल्प उपलब्ध हैं?',
      aEn: 'We support Razorpay & Cashfree (UPI, Google Pay, PhonePe, Cards, NetBanking) alongside "Pay Cash at Counter" for physical clinic visits.',
      aHi: 'हम यूपीआई, गूगल पे, कार्ड और क्लीनिक पर नकद भुगतान दोनों का समर्थन करते हैं।'
    }
  ];

  return (
    <div className="pb-24 overflow-x-hidden w-full max-w-full font-jakarta text-slate-800 bg-slate-50/50">
      
      {/* 1. CLINIC FACILITIES & KEY HIGHLIGHTS MARQUEE RIBBON */}
      <div className="bg-[#0B1F3A] text-white py-2.5 border-b border-white/10 overflow-hidden relative shadow-inner font-sans">
        <div className="flex items-center whitespace-nowrap animate-marquee gap-8 text-xs">
          <span className="font-heading font-extrabold text-amber-300 flex items-center gap-2 shrink-0 uppercase tracking-widest text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] shrink-0 animate-pulse"></span>
            {language === 'en' ? 'JANSEVAAROGYAM CLINIC HIGHLIGHTS & FACILITIES:' : 'जनसेवा आरोग्यम क्लीनिक मुख्य बिंदु एवं सुविधाएं:'}
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <strong className="text-orange-300 font-extrabold font-heading">{language === 'en' ? '24x7 Emergency & ICU:' : '24x7 आपातकालीन एवं आईसीयू:'}</strong>
            <span className="text-[#5EAAF0] font-bold">{language === 'en' ? 'ACLS Ambulance Helpline: 1800-SEVA-CLINIC' : 'एमर्जेंसी एम्बुलेंस हेल्पलाइन: 1800-SEVA-CLINIC'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <FileText className="w-3.5 h-3.5 text-[#5EAAF0] shrink-0" />
            <strong className="text-[#5EAAF0] font-extrabold font-heading">{language === 'en' ? 'High-Tech Pathology Lab:' : 'हाई-टेक पैथोलॉजी लैब:'}</strong>
            <span>{language === 'en' ? 'Automated Testing & Doorstep WhatsApp PDF Reports' : 'स्वचालित लैब टेस्ट और व्हाट्सएप पीडीएफ रिपोर्ट'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <strong className="text-amber-300 font-extrabold font-heading">{language === 'en' ? 'NABH Accredited OPD:' : 'एनएबीएच मान्यता प्राप्त ओपीडी:'}</strong>
            <span>{language === 'en' ? 'Sarangpur • Shujalpur • Rajgarh Multi-Specialty Network' : 'सारंगपुर • शुजालपुर • राजगढ़ नेटवर्क'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <Stethoscope className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
            <strong className="text-[#2DD4BF] font-extrabold font-heading">{language === 'en' ? '15+ Board Doctors:' : '15+ विशेषज्ञ डॉक्टर:'}</strong>
            <span>{language === 'en' ? 'General Medicine, Pediatrics, Ortho, Derm, Cardio & Gynae' : 'जनरल मेडिसिन, शिशु रोग, हड्डी, त्वचा, हृदय एवं स्त्री रोग'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <Video className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <strong className="text-teal-200 font-extrabold font-heading">{language === 'en' ? 'Digital Video Tele-OPD:' : 'डिजिटल वीडियो टेली-ओपीडी:'}</strong>
            <span>{language === 'en' ? 'Consult Doctors Online with Verified Digital Prescriptions' : 'घर बैठे ऑनलाइन परामर्श एवं डिजिटल प्रिस्क्रिप्शन'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <strong className="text-purple-300 font-extrabold font-heading">{language === 'en' ? 'Modular Clean-Air OTs:' : 'मॉड्यूलर क्लीन-एयर ओटी:'}</strong>
            <span>{language === 'en' ? 'HEPA Filtered Surgical Suites & Joint Replacement' : 'हेपा फिल्टर युक्त आधुनिक ऑपरेशन थियेटर'}</span>
          </span>

          <span className="inline-flex items-center gap-2 font-medium text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
            <strong className="text-[#2DD4BF] font-extrabold font-heading">{language === 'en' ? '24/7 Pharmacy:' : '24/7 मेडिकल स्टोर:'}</strong>
            <span>{language === 'en' ? '100% Certified Genuine Medicines & Vaccines' : '100% प्रामाणिक दवाएं और टीके'}</span>
          </span>
        </div>
      </div>

      {/* 2. HERO SECTION — ELEGANT MEDICAL HEADLINE & DOCTOR HIGHLIGHT */}
      <section className="relative bg-gradient-to-br from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] text-white pt-12 sm:pt-16 pb-16 sm:pb-20 rounded-b-[3rem] shadow-2xl overflow-hidden font-sans">
        {/* Ambient Glass Glow Lighting Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-140 h-140 bg-[#2DD4BF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-140 h-140 bg-[#5EAAF0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Eyebrow Label */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 text-xs font-heading font-extrabold text-[#2DD4BF] tracking-widest uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] shrink-0 animate-pulse"></span>
                <span>{language === 'en' ? 'EXPERT OPD CONSULTATION • PEDIATRIC & GENERAL SURGERY' : 'विशेषज्ञ ओपीडी परामर्श • बाल रोग एवं जनरल सर्जरी'}</span>
              </div>

              {/* Main Heading & Subheading */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-none text-white">
                  Dr. Ankur Deshwali
                </h1>
                <p className="text-lg sm:text-2xl font-heading font-bold bg-gradient-to-r from-[#2DD4BF] via-[#5EAAF0] to-[#10B981] bg-clip-text text-transparent">
                  {language === 'en' 
                    ? 'Pediatric Surgeon | Neonatal Surgeon | General Surgeon' 
                    : 'बाल रोग सर्जन | नवजात शिशु सर्जन | जनरल सर्जन'}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl leading-relaxed font-sans font-medium">
                {language === 'en'
                  ? 'Providing world-class specialized surgical care for newborns, children, and adults with compassionate expertise in pediatric anomalies, laparoscopic procedures, pediatric urology, and antenatal counseling.'
                  : 'नवजात शिशुओं, बच्चों और वयस्कों के लिए विश्वस्तरीय विशेषज्ञ शल्य चिकित्सा सेवाएं - बाल रोग, लेप्रोस्कोपिक प्रक्रियाएं, बाल मूत्र रोग और जन्मपूर्व परामर्श।'}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                <div className="inline-flex items-center text-xs font-mono font-bold text-amber-300">
                  <span>MBBS | MS (General Surgery) | MCh (Pediatric Surgery)</span>
                </div>
                
                <div className="inline-flex items-center text-xs font-heading font-bold text-[#2DD4BF]">
                  <span>{language === 'en' ? 'NABH Certified Practice' : 'एनएबीएच प्रमाणित चिकित्सा'}</span>
                </div>
              </div>

              {/* Location Tag */}
              <div className="flex items-center justify-center lg:justify-start text-xs font-semibold text-slate-300 pt-1 font-sans">
                <span>{language === 'en' ? 'Civil Hospital, Sarangpur & District Hospital, Rajgarh, Madhya Pradesh' : 'सिविल अस्पताल सारंगपुर एवं जिला अस्पताल राजगढ़, मध्य प्रदेश'}</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                <button
                  onClick={() => openBookingModal()}
                  className="bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-heading font-extrabold px-7 py-4 rounded-2xl text-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('specialties');
                    else {
                      const el = document.getElementById('branches-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-white font-heading font-bold border border-white/10 px-6 py-4 rounded-2xl text-sm backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
                >
                  <Stethoscope className="w-5 h-5 text-[#2DD4BF]" />
                  <span>{language === 'en' ? 'Explore Specialties' : 'विशेषज्ञताएँ देखें'}</span>
                </button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-[#2DD4BF]">15+</p>
                  <p className="text-[11px] text-[#CBD5E1] font-medium">{language === 'en' ? 'Expert Doctors' : 'विशेषज्ञ डॉक्टर'}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-[#5EAAF0]">25,000+</p>
                  <p className="text-[11px] text-[#CBD5E1] font-medium">{language === 'en' ? 'Patients Treated' : 'उपचारित मरीज'}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-amber-300">4.9 ★</p>
                  <p className="text-[11px] text-[#CBD5E1] font-medium">{language === 'en' ? 'Patient Satisfaction' : 'मरीज संतुष्टि'}</p>
                </div>
              </div>

            </div>

            {/* Right Column: Doctor Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group max-w-md w-full">
                {/* Decorative glowing background aura */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-teal-400 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-700" />
                
                {/* Image Card Container */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 bg-slate-900/60 backdrop-blur-md">
                  <img
                    src={drAnkurImg}
                    alt="Dr. Ankur Deshwali - Pediatric & Neonatal Surgeon"
                    className="w-full h-120 object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Floating Stat Badge Left */}
                  <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white p-3 rounded-2xl border border-white/15 shadow-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'en' ? 'Experience' : 'अनुभव'}</p>
                      <p className="text-xs font-heading font-extrabold text-white">{language === 'en' ? 'MCh Specialist' : 'एमसीएच विशेषज्ञ'}</p>
                    </div>
                  </div>

                  {/* Doctor Title Overlay Card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-extrabold text-xl text-white">Dr. Ankur Deshwali</h3>
                        <p className="text-xs text-emerald-300 font-heading font-bold">{language === 'en' ? 'Senior Pediatric & Neonatal Surgeon' : 'वरिष्ठ बाल एवं नवजात शिशु रोग सर्जन'}</p>
                      </div>
                      <div className="text-emerald-300 text-xs font-heading font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {language === 'en' ? 'Available Today' : 'आज उपलब्ध हैं'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ELEGANT QUICK ACTION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-8 font-sans">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          
          <button
            onClick={() => openBookingModal(undefined, undefined)}
            className="p-5 rounded-2xl bg-gradient-to-b from-sky-50/50 to-sky-100/30 hover:to-sky-100 border border-sky-100 hover:border-sky-300 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 space-y-3 group cursor-pointer"
          >
            <div className="w-13 h-13 bg-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">{language === 'en' ? 'Book In-Clinic OPD' : 'ओपीडी परामर्श बुक करें'}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'en' ? 'Sequential Token Visit' : 'क्रमबद्ध टोकन प्रक्रिया'}</p>
            </div>
          </button>

          <button
            onClick={() => openBookingModal(undefined, undefined, 'VIDEO')}
            className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-emerald-100/30 hover:to-emerald-100 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 space-y-3 group cursor-pointer"
          >
            <div className="w-13 h-13 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">{language === 'en' ? 'Video Telemedicine' : 'वीडियो टेलीमेडिसिन'}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'en' ? 'Consult From Home' : 'घर बैठे परामर्श लें'}</p>
            </div>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('branches-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/50 to-purple-100/30 hover:to-purple-100 border border-purple-100 hover:border-purple-300 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 space-y-3 group cursor-pointer"
          >
            <div className="w-13 h-13 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-purple-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">{language === 'en' ? 'Clinic Locations' : 'अस्पताल शाखाएं'}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'en' ? 'Sarangpur, Shujalpur, Rajgarh' : 'सारंगपुर, शुजालपुर, राजगढ़'}</p>
            </div>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('doctors-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-5 rounded-2xl bg-gradient-to-b from-teal-50/50 to-teal-100/30 hover:to-teal-100 border border-teal-100 hover:border-teal-300 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 space-y-3 group cursor-pointer"
          >
            <div className="w-13 h-13 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-teal-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">{language === 'en' ? 'Our Specialists' : 'हमारे विशेषज्ञ'}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'en' ? '15+ Multi-Specialty Board' : '15+ विशेषज्ञ डॉक्टर'}</p>
            </div>
          </button>

          <a
            href="tel:1800-7382-723"
            className="p-5 rounded-2xl bg-gradient-to-b from-rose-50/50 to-rose-100/30 hover:to-rose-100 border border-rose-100 hover:border-rose-300 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 space-y-3 group block cursor-pointer"
          >
            <div className="w-13 h-13 bg-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-rose-500/20">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">{language === 'en' ? 'Emergency Helpline' : 'आपातकालीन हेल्पलाइन'}</h4>
              <p className="text-[11px] text-rose-600 font-bold mt-0.5">1800-SEVA-CLINIC</p>
            </div>
          </a>

        </div>
      </section>

      {/* 4. CENTERS OF EXCELLENCE / SPECIALTIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-16 sm:pt-20 pb-12 font-sans">
        <div className="text-center space-y-3">
          <span className="text-xs font-heading font-extrabold text-[#0F4C81] uppercase tracking-widest block">
            {language === 'en' ? 'Clinical Departments' : 'चिकित्सा विभाग'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            {language === 'en' ? 'Centers of Excellence & Specialty OPDs' : 'उत्कृष्टता केंद्र एवं विशेषज्ञ ओपीडी'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
            {language === 'en'
              ? 'Access expert clinical consultations across general medicine, surgery, child care, joint replacement, and cardiology.'
              : 'जनरल मेडिसिन, शल्य चिकित्सा, बाल रोग, हड्डी रोग और हृदय रोग में विशेषज्ञ परामर्श प्राप्त करें।'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 pt-4">
          {[
            {
              id: 'general-medicine',
              category: 'Internal Medicine',
              nameEn: 'General Medicine & Diabetes',
              nameHi: 'जनरल मेडिसिन एवं मधुमेह',
              taglineEn: 'Comprehensive care for diabetes, fever, hypertension & lifestyle diseases.',
              taglineHi: 'मधुमेह, बुखार, उच्च रक्तचाप एवं जीवनशैली संबंधी बीमारियों का इलाज।',
              icon: FiShield,
              count: 4
            },
            {
              id: 'pediatrics',
              category: 'Child Health',
              nameEn: 'Pediatrics & Neonatology',
              nameHi: 'बाल रोग एवं नवजात शिशु देखभाल',
              taglineEn: 'Specialized surgical and medical care for newborns, infants & children.',
              taglineHi: 'नवजात शिशुओं और बच्चों के लिए शल्य एवं चिकित्सा देखभाल।',
              icon: FiUserCheck,
              count: 3
            },
            {
              id: 'orthopedics',
              category: 'Bone & Joint',
              nameEn: 'Orthopedics & Joint Care',
              nameHi: 'हड्डी, जोड़ एवं ट्रॉमा विशेषज्ञ',
              taglineEn: 'Total knee & hip replacement, fracture trauma and spine care.',
              taglineHi: 'घुटने और कूल्हे का प्रतिस्थापन, फ्रैक्चर और रीढ़ की हड्डी की देखभाल।',
              icon: FiActivity,
              count: 3
            },
            {
              id: 'dermatology',
              category: 'Skin & Hair',
              nameEn: 'Dermatology & Cosmetology',
              nameHi: 'त्वचा, बाल एवं सौंदर्य विशेषज्ञ',
              taglineEn: 'Advanced skin treatments, PRP hair therapy & cosmetology.',
              taglineHi: 'त्वचा के रोग, बालों के झड़ने का इलाज और सौंदर्य देखभाल।',
              icon: FiEye,
              count: 2
            },
            {
              id: 'cardiology',
              category: 'Cardiovascular',
              nameEn: 'Cardiology & Heart Care',
              nameHi: 'हृदय रोग एवं कार्डियक केयर',
              taglineEn: 'ECG, 2D Echo, cardiac screening and heart health management.',
              taglineHi: 'ईसीजी, 2डी ईको और हृदय रोग जांच एवं उपचार।',
              icon: FiHeart,
              count: 2
            },
            {
              id: 'gynecology',
              category: 'Womens Health',
              nameEn: 'Obstetrics & Gynecology',
              nameHi: 'स्त्री एवं प्रसूति रोग विशेषज्ञ',
              taglineEn: 'Maternity care, high-risk pregnancy & laparoscopic surgery.',
              taglineHi: 'गर्भावस्था देखभाल, प्रसूति सहायता और लेप्रोस्कोपिक सर्जरी।',
              icon: FiShield,
              count: 3
            },
            {
              id: 'ophthalmology',
              category: 'Eye Care',
              nameEn: 'Ophthalmology & Eye Care',
              nameHi: 'नेत्र रोग एवं दृष्टि विज्ञान',
              taglineEn: 'Micro-incision cataract surgery, computerized vision testing.',
              taglineHi: 'मोतियाबिंद सर्जरी, कंप्यूटर से आंखों की जांच एवं उपचार।',
              icon: FiEye,
              count: 2
            },
            {
              id: 'emergency-care',
              category: 'Critical Care',
              nameEn: 'Emergency & Critical Care',
              nameHi: 'आपातकालीन एवं आईसीयू विभाग',
              taglineEn: '24/7 ACLS trauma resuscitation, ICU support & ambulance.',
              taglineHi: '24 घंटे आपातकालीन आघात चिकित्सा, आईसीयू एवं एम्बुलेंस।',
              icon: FiAlertCircle,
              count: 5
            }
          ].map(sp => {
            const IconComp = sp.icon;
            return (
              <button
                key={sp.id}
                onClick={() => {
                  setSelectedSpecialtyFilter(sp.category || sp.id);
                  if (onNavigate) onNavigate('specialties');
                }}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xl text-slate-800 transition-all duration-300 flex flex-col items-center justify-between text-center gap-4 cursor-pointer group hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0F4C81] group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-xs">
                  <IconComp className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 leading-snug">
                    {language === 'en' ? sp.nameEn : sp.nameHi}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5 line-clamp-2">
                    {language === 'en' ? sp.taglineEn : sp.taglineHi}
                  </p>
                  <span className="inline-block text-[11px] mt-2.5 font-bold text-[#0F4C81] group-hover:text-emerald-600">
                    {sp.count} {language === 'en' ? 'Doctors' : 'विशेषज्ञ'} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. PHYSICAL CLINIC LOCATIONS NETWORK */}
      <section id="branches-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-14 sm:py-18 font-sans">
        <div className="text-center space-y-3">
          <span className="text-xs font-heading font-extrabold text-emerald-700 uppercase tracking-widest block">
            {language === 'en' ? 'Physical Hospital & Clinic Network' : 'अस्पताल एवं क्लीनिक नेटवर्क'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            {language === 'en' ? 'Our Multi-Specialty Clinics in Malwa Region' : 'मालवा क्षेत्र में हमारी सुपर-स्पेशलिटी शाखाएँ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
            {language === 'en'
              ? 'State-of-the-art OPD centers equipped with digital token displays, automated lab testing, and in-house pharmacy.'
              : 'डिजिटल टोकन डिस्प्ले, स्वचालित लैब टेस्ट और इन-हाउस फार्मेसी से लैस आधुनिक ओपीडी केंद्र।'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {clinics.map(c => (
            <div 
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 group flex flex-col justify-between"
            >
              <div>
                {/* Branch Image Header */}
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img 
                    src={c.imageUrl || DEFAULT_BRANCH_IMAGES[c.id] || DEFAULT_BRANCH_IMAGES.default} 
                    alt={c.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_BRANCH_IMAGES[c.id] || DEFAULT_BRANCH_IMAGES.default; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
                    <span className="text-emerald-300 font-heading font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {language === 'en' ? 'OPD Active Today' : 'ओपीडी आज चालू है'}
                    </span>
                    <h3 className="font-heading font-extrabold text-xl text-white tracking-tight">{language === 'hi' ? (c.nameHi || c.name) : c.name}</h3>
                    <p className="text-xs text-sky-200 font-medium">{c.city}, {language === 'en' ? 'Madhya Pradesh' : 'मध्य प्रदेश'}</p>
                  </div>
                </div>

                {/* Details Body (Using react-icons) */}
                <div className="p-6 space-y-3.5 text-xs">
                  <div className="flex items-start gap-3 text-slate-600">
                    <div className="w-7 h-7 rounded-xl bg-sky-50 flex items-center justify-center text-[#0F4C81] shrink-0 mt-0.5 border border-sky-100">
                      <FiMapPin className="w-4 h-4" />
                    </div>
                    <span className="font-medium leading-relaxed pt-0.5 text-slate-700">{language === 'hi' ? (c.addressHi || c.address) : c.address}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 font-mono">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                      <FiPhoneCall className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800">{c.phone}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                      <FiClock className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-700">{c.operatingHours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Using react-icons) */}
              <div className="p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 font-sans">
                <a
                  href={c.googleMapDirectionsUrl || (c.coordinates?.lat ? `https://www.google.com/maps/dir/?api=1&destination=${c.coordinates.lat},${c.coordinates.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.name} ${c.address}`)}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <FiNavigation className="w-3.5 h-3.5 text-[#0F4C81]" />
                  <span>{language === 'en' ? 'Directions' : 'दिशा-निर्देश'}</span>
                </a>

                <button
                  onClick={() => openBookingModal(undefined, c.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <FiCalendar className="w-3.5 h-3.5 text-white" />
                  <span>{language === 'en' ? 'Book Token' : 'टोकन बुक करें'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HEALTH KNOWLEDGE HUB & BLOGS */}
      {healthBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-14 sm:py-18 font-sans">
          <div className="text-center space-y-3">
            <span className="text-xs font-heading font-extrabold text-[#0F4C81] uppercase tracking-widest block">
              {language === 'en' ? 'Health Knowledge Hub' : 'स्वास्थ्य ज्ञान केंद्र'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              {language === 'en' ? 'Medical Insights & Patient Care Guides' : 'चिकित्सा लेख एवं मरीज देखभाल गाइड'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
              {language === 'en'
                ? 'Read verified healthcare guidance written directly by our board doctors.'
                : 'हमारे विशेषज्ञ डॉक्टरों द्वारा लिखे गए सत्यापित स्वास्थ्य लेख पढ़ें।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {healthBlogs.map(blog => (
              <div 
                key={blog.id}
                onClick={() => {
                  setSelectedBlogId(blog.id);
                  if (onNavigate) onNavigate('article-detail');
                }}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
              >
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                    <span className="absolute top-4 left-4 text-white bg-[#0A2540]/90 px-3 py-1 rounded-lg text-[11px] font-heading font-extrabold uppercase tracking-wider backdrop-blur-md">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
                      <span>{blog.date}</span> • <span>{blog.readTimeMinutes} {language === 'en' ? 'min read' : 'मिनट पढ़ें'}</span>
                    </div>
                    <h4 className="font-heading font-extrabold text-lg text-slate-900 leading-snug group-hover:text-[#0F4C81] transition-colors">{blog.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{blog.excerpt}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between font-sans">
                  <span className="text-xs font-heading font-bold text-[#0F4C81] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    {blog.authorName}
                  </span>
                  <span className="text-xs font-heading font-extrabold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {language === 'en' ? 'Read Article' : 'लेख पढ़ें'} <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 space-y-8 py-14 sm:py-18 font-sans">
        <div className="text-center space-y-2">
          <span className="text-xs font-heading font-extrabold text-[#0F4C81] uppercase tracking-widest block">
            {language === 'en' ? 'Got Questions?' : 'कोई प्रश्न है?'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            {language === 'en' ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले प्रश्न'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'en'
              ? 'Everything you need to know about JANSEVAAROGYAM physical OPD tokens & telemedicine.'
              : 'जनसेवा आरोग्यम ओपीडी टोकन और वीडियो टेलीमेडिसिन के बारे में सभी जानकारी।'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-sky-300 shadow-md ring-2 ring-sky-500/10' : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{language === 'en' ? faq.qEn : faq.qHi}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-sky-100 text-[#0F4C81] rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 font-sans font-medium">
                    {language === 'en' ? faq.aEn : faq.aHi}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FLOATING STICKY ACTION BAR AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1F3A]/95 backdrop-blur-xl border-t border-white/10 py-3.5 px-4 shadow-2xl font-sans">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="hidden md:flex items-center gap-3 text-white text-xs font-heading font-extrabold">
            <span className="w-3 h-3 rounded-full bg-[#2DD4BF] animate-pulse shrink-0"></span>
            <span>{language === 'en' ? 'JANSEVAAROGYAM 24x7 Multi-Specialty Helpdesk' : 'जनसेवा आरोग्यम 24x7 मल्टी-स्पेशलिटी हेल्पडेस्क'}</span>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <a
              href="tel:1800-7382-723"
              className="flex-1 md:flex-initial bg-[#C2410C] hover:bg-[#C2410C]/90 text-white font-heading font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{language === 'en' ? 'Call Helpline' : 'हेल्पलाइन पर कॉल करें'}</span>
            </a>

            <button
              onClick={() => openBookingModal(undefined, undefined)}
              className="flex-1 md:flex-initial bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-heading font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
            </button>

            <button
              onClick={() => openBookingModal(undefined, undefined, 'VIDEO')}
              className="flex-1 md:flex-initial bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-white font-heading font-extrabold px-5 py-3 rounded-xl text-xs border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md transition cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#2DD4BF]" />
              <span>{language === 'en' ? 'Video OPD' : 'वीडियो ओपीडी'}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

