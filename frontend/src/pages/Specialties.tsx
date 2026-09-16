import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckCircle2, 
  Calendar, 
  User, 
  PhoneCall
} from 'lucide-react';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';

export const Specialties: React.FC = () => {
  useSEO({
    title: 'Medical Specialties & Specialist OPD Doctors | JansevaArogyam',
    description: 'Find top specialist doctors in Cardiology, Pediatrics, Gynecology, Orthopedics, General Medicine & ENT at JansevaArogyam clinics in Sarangpur, Shujalpur & Rajgarh.',
    keywords: 'JansevaArogyam doctors, specialist doctor Sarangpur, cardiologist Shujalpur, gynecologist Rajgarh, pediatrician OPD, orthopedic doctor MP',
    canonical: 'https://jansevaarogyam.com/specialties'
  });

  const { doctors, specialties, openBookingModal, openDoctorProfileModal, language, selectedSpecialtyFilter } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState(selectedSpecialtyFilter || 'all');

  React.useEffect(() => {
    if (selectedSpecialtyFilter) {
      setSelectedCategory(selectedSpecialtyFilter);
    }
  }, [selectedSpecialtyFilter]);

  const categories = [
    { id: 'all', label: language === 'en' ? 'All Specialties' : 'सभी विशेषज्ञताएँ' },
    ...Array.from(new Set(specialties.map(s => s.category))).map(cat => ({ 
      id: cat, 
      label: language === 'en' 
        ? cat 
        : (cat === 'Pediatric & Neonatal Surgery' ? 'पीडियाट्रिक एवं निओनेटल सर्जरी'
           : cat === 'Pediatric Urology' ? 'पीडियाट्रिक यूरोलॉजी'
           : cat === 'General & Laparoscopic Surgery' ? 'जनरल एवं लैप्रोस्कोपिक सर्जरी'
           : cat === 'General Medicine & Diabetes' ? 'जनरल मेडिसिन एवं डायबिटीज'
           : cat === 'Emergency & Trauma' ? 'इमरजेंसी एवं ट्रॉमा' : cat)
    }))
  ];

  const filteredSpecialties = specialties.filter(sp => {
    const matchesCategory = selectedCategory === 'all' || sp.category === selectedCategory || sp.id === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="pb-24 space-y-12 font-manrope text-slate-800 bg-slate-50/50 overflow-x-hidden w-full max-w-full">
      
      {/* ==========================================
          SECTION 1: HERO SECTION
      ========================================== */}
      <section className="relative bg-gradient-to-br from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] text-white pt-14 sm:pt-18 pb-16 sm:pb-20 rounded-b-[3rem] shadow-2xl overflow-hidden border-b border-[#2DD4BF]/20">
        
        {/* Glow Lighting Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-140 h-140 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-140 h-140 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          
          <span className="text-xs font-sora font-extrabold uppercase tracking-widest text-emerald-300 block">
            {language === 'en' 
              ? 'Centers of Clinical Excellence • Sarangpur • Shujalpur • Rajgarh'
              : 'चिकित्सा उत्कृष्टता केंद्र • सारंगपुर • शुजालपुर • राजगढ़'}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sora font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
            {language === 'en' ? 'Specialized Medical Departments' : 'विशिष्ट चिकित्सा विभाग'} <br />
            <span className="bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              {language === 'en' ? 'Tailored to Your Health Needs' : 'आपकी स्वास्थ्य आवश्यकताओं के अनुकूल'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-sky-100/90 font-medium leading-relaxed max-w-2xl mx-auto">
            {language === 'en'
              ? 'Explore our board-certified clinical departments, diagnostic protocols, advanced operative procedures, and senior medical specialists.'
              : 'हमारे बोर्ड-प्रमाणित क्लिनिकल विभागों, नैदानिक प्रक्रियाओं, उन्नत ऑपरेशन प्रक्रियाओं और वरिष्ठ डॉक्टरों की जानकारी प्राप्त करें।'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-emerald-300">15+</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Board Specialists' : 'विशेषज्ञ डॉक्टर'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-sky-300">100%</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'NABH Standards' : 'एनएबीएच मानक'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-amber-300">{language === 'en' ? '3 Branches' : '3 शाखाएं'}</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'OPD Infrastructure' : 'ओपीडी सेवाएं'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          SECTION 2: CATEGORY FILTER TABS
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-sora font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-linear-to-r from-[#0F4C81] to-[#0B2545] text-white shadow-md scale-102 border border-white/10'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ==========================================
          SECTION 3: SPECIALTIES DETAILED CARDS GRID
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {filteredSpecialties.map(sp => {
          const departmentDoctors = doctors.filter(d => sp.doctorIds.includes(d.id) || d.specialization.toLowerCase().includes(sp.id.replace('-', '')));

          return (
            <div 
              key={sp.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 space-y-6"
            >
              {/* Department Banner & Header Overlay */}
              <div className="relative h-56 sm:h-72 overflow-hidden">
                <img 
                  src={sp.bannerUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200'} 
                  alt={sp.nameEn} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="bg-emerald-400 text-slate-950 font-sora font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {sp.category}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-sora font-black tracking-tight text-white">
                      {language === 'en' ? sp.nameEn : sp.nameHi}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      {sp.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => openBookingModal(undefined, undefined)}
                    className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sora font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-950" />
                    <span>{language === 'en' ? 'Book Department OPD' : 'विभाग ओपीडी बुक करें'}</span>
                  </button>
                </div>
              </div>

              {/* Department Details */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {language === 'hi' ? (sp.descriptionHi || sp.description) : sp.description}
                </p>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Common Conditions Treated */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                    <h3 className="font-sora font-black text-xs text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
                      <span>{language === 'en' ? 'Common Conditions Treated' : 'सामान्य इलाज़ योग्य स्थितियां'}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sp.conditionsTreated.map((cond, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Procedures & Technology */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                    <h3 className="font-sora font-black text-xs text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'en' ? 'Diagnostic Equipment & Procedures' : 'जांच उपकरण एवं प्रक्रियाएं'}</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium pt-1">
                      {sp.proceduresAndTech.map((proc, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{proc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Department Doctors Grid */}
                {departmentDoctors.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sora font-black text-xs text-slate-900 uppercase tracking-wider">
                        {language === 'en' ? `Department Medical Specialists (${departmentDoctors.length})` : `विभाग के विशेषज्ञ डॉक्टर (${departmentDoctors.length})`}
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {language === 'en' ? 'Verified Board Doctors' : 'सत्यापित बोर्ड डॉक्टर'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {departmentDoctors.map(doc => (
                        <div key={doc.id} className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xs hover:border-[#0F4C81] transition">
                          <div className="flex items-center gap-3">
                            <img 
                              src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR} 
                              alt={doc.name} 
                              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <h4 className="font-sora font-black text-sm text-slate-900">{doc.name}</h4>
                              <p className="text-[11px] text-[#0F4C81] font-bold">{doc.specialization}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{doc.qualification}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openDoctorProfileModal(doc)}
                              className="p-2 text-slate-600 hover:text-[#0F4C81] bg-slate-100 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                              title={language === 'en' ? 'View Full Profile' : 'पूरा प्रोफाइल देखें'}
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openBookingModal(doc.id, undefined)}
                              className="btn-primary text-xs font-bold px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{language === 'en' ? 'Book' : 'बुक करें'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          );
        })}
      </section>

      {/* ==========================================
          SECTION 4: CONSULTATION CTA BANNER
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden glow-teal">
          
          <div className="space-y-3 text-center md:text-left relative z-10 max-w-xl">
            <span className="text-xs font-sora font-black text-emerald-300 uppercase tracking-widest block">
              {language === 'en' ? 'EXPERT OPD CONSULTATION' : 'विशेषज्ञ ओपीडी परामर्श'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-sora font-black text-white tracking-tight">
              {language === 'en' ? 'Need Medical Advice From Our Board Doctors?' : 'क्या आपको हमारे विशेषज्ञ डॉक्टरों से चिकित्सा सलाह चाहिए?'}
            </h3>
            <p className="text-xs sm:text-sm text-sky-100/90 font-medium leading-relaxed">
              {language === 'en'
                ? 'Book a physical OPD visit at Sarangpur, Shujalpur, or Rajgarh branches, or consult online via video consultation.'
                : 'सारंगपुर, शुजालपुर या राजगढ़ शाखाओं में ओपीडी अपॉइंटमेंट बुक करें या ऑनलाइन वीडियो परामर्श लें।'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10">
            <button
              onClick={() => openBookingModal()}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sora font-black px-7 py-4 rounded-2xl text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2.5 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-slate-950" />
              <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
            </button>

            <a
              href="tel:1800-7382-723"
              className="bg-white/10 hover:bg-white/20 text-white font-sora font-bold px-7 py-4 rounded-2xl text-sm border border-white/20 flex items-center gap-2.5 backdrop-blur-md transition hover:scale-105"
            >
              <PhoneCall className="w-5 h-5 text-emerald-300" />
              <span>{language === 'en' ? 'Call Helpline' : 'हेल्पलाइन पर कॉल करें'}</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
