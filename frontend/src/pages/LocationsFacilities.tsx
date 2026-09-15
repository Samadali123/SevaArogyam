import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Navigation,
  Stethoscope,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { FACILITIES_DATA, DEFAULT_BRANCH_IMAGES } from '../data/mockData';

export const LocationsFacilities: React.FC = () => {
  useSEO({
    title: 'Clinic Locations & Facilities | JansevaArogyam - Sarangpur, Shujalpur, Rajgarh',
    description: 'Explore JansevaArogyam hospital clinics in Sarangpur, Shujalpur & Rajgarh with NABH accredited OPD, modular OTs, 24x7 ICU emergency, and lab facilities.',
    keywords: 'JansevaArogyam branches, Sarangpur hospital, Shujalpur clinic, Rajgarh hospital, 24x7 ICU emergency, lab test center',
    canonical: 'https://jansevaarogyam.com/locations-facilities'
  });

  const { clinics, doctors, openBookingModal, activeBranchId, setActiveBranchId, language } = useApp();
  
  const selectedBranchId = activeBranchId || 'sarangpur';
  const setSelectedBranchId = (id: string) => setActiveBranchId(id);
  const [facilityCategory, setFacilityCategory] = useState<string>('all');

  const selectedClinic = clinics.find(c => c.id === selectedBranchId) || clinics[0];

  const facilityCategories = [
    { id: 'all', label: language === 'en' ? 'All Facilities' : 'सभी सुविधाएं' },
    { id: 'Emergency & ICU', label: language === 'en' ? 'Emergency & ICU' : 'इमरजेंसी एवं आईसीयू' },
    { id: 'Diagnostics & Imaging', label: language === 'en' ? 'Diagnostics & Labs' : 'जांच एवं लैब' },
    { id: 'Surgery & OT', label: language === 'en' ? 'Modular OTs' : 'मॉड्युलर ओटी' },
    { id: 'Digital & Telehealth', label: language === 'en' ? 'Telehealth Pods' : 'टेलीहेल्थ पॉड्स' },
    { id: 'Patient Care & Amenities', label: language === 'en' ? 'Pharmacy & Care' : 'फार्मेसी एवं देखभाल' }
  ];

  const filteredFacilities = FACILITIES_DATA.filter(f => {
    const matchesCat = facilityCategory === 'all' || f.category === facilityCategory;
    const matchesBranch = !selectedBranchId || f.availableBranches.includes('all') || f.availableBranches.length === 0 || f.availableBranches.includes(selectedBranchId);
    return matchesCat && matchesBranch;
  });

  return (
    <div className="pb-24 space-y-12 font-manrope text-slate-800 bg-slate-50/50 overflow-x-hidden w-full max-w-full">
      
      {/* ==========================================
          SECTION 1: HERO SECTION
      ========================================== */}
      <section className="relative bg-gradient-to-br from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white pt-14 sm:pt-18 pb-16 sm:pb-20 rounded-b-[3rem] shadow-2xl overflow-hidden border-b border-emerald-500/20">
        
        {/* Glow Lighting Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-140 h-140 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-140 h-140 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          
          <span className="text-xs font-sora font-extrabold uppercase tracking-widest text-emerald-300 block">
            {language === 'en' ? 'Regional Hospital Network • Sarangpur • Shujalpur • Rajgarh' : 'क्षेत्रीय अस्पताल नेटवर्क • सारंगपुर • शुजालपुर • राजगढ़'}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sora font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
            {language === 'en' ? 'Clinic Branches & State-of-the-Art' : 'क्लिनिक शाखाएं एवं अत्याधुनिक'} <br />
            <span className="bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              {language === 'en' ? 'Medical Hospital Infrastructure' : 'चिकित्सा अस्पताल अवसंरचना'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-sky-100/90 font-medium leading-relaxed max-w-2xl mx-auto">
            {language === 'en'
              ? 'Delivering high-tech diagnostic labs, clean-air modular OTs, 24/7 ICU resuscitation, and comfortable patient amenities across Madhya Pradesh.'
              : 'मध्य प्रदेश भर में उच्च तकनीक वाली प्रयोगशालाएं, स्वच्छ वायु मॉड्युलर ओटी, 24/7 आईसीयू और आरामदायक रोगी सुविधाएं प्रदान करना।'}
          </p>

          {/* Key Quick Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-emerald-300">NABH</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Accredited OPD' : 'मान्यता प्राप्त ओपीडी'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-sky-300">24x7</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Emergency Helpline' : 'आपातकालीन हेल्पलाइन'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
              <p className="text-xl font-sora font-black text-amber-300">Live Token</p>
              <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Queue Tracking' : 'लाइव टोकन ट्रैकिंग'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          SECTION 2: BRANCH SELECTOR & SPOTLIGHT
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-sora font-black text-[#0F4C81] uppercase tracking-widest block">
            {language === 'en' ? 'Select OPD Location' : 'ओपीडी स्थान चुनें'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-sora font-black text-slate-900">
            {language === 'en' ? 'Our Regional Clinic Locations' : 'हमारे क्षेत्रीय क्लिनिक केंद्र'}
          </h2>
        </div>

        {/* Branch Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {clinics.map(c => {
            const isSelected = selectedBranchId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedBranchId(c.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 space-y-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white border-[#0F4C81] shadow-xl scale-[1.02]'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-sora font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {c.city}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>
                    {language === 'en' ? `${c.activeDoctorCount || 0} Doctors` : `${c.activeDoctorCount || 0} डॉक्टर`}
                  </span>
                </div>
                <h3 className="font-sora font-extrabold text-base tracking-tight">
                  {language === 'hi' ? (c.nameHi || c.name) : c.name}
                </h3>
                <p className={`text-xs truncate font-medium ${isSelected ? 'text-sky-100/80' : 'text-slate-500'}`}>
                  {language === 'hi' ? (c.addressHi || c.address) : c.address}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Branch Detail Spotlight Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 transition-all duration-500">
          
          {/* Left Media Banner */}
          <div className="lg:col-span-6 relative min-h-80 lg:min-h-110 overflow-hidden bg-slate-900">
            <img 
              src={selectedClinic?.imageUrl || DEFAULT_BRANCH_IMAGES[selectedClinic?.id || 'default'] || DEFAULT_BRANCH_IMAGES.default} 
              alt={selectedClinic?.name || 'Branch'} 
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_BRANCH_IMAGES[selectedClinic?.id || 'default'] || DEFAULT_BRANCH_IMAGES.default; }}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Top Status Tag */}
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/20 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-sora font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'en' ? 'OPD Active Today' : 'आज ओपीडी चालू है'}
              </span>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-sora font-extrabold tracking-tight text-white leading-tight">
                {language === 'hi' ? (selectedClinic?.fullNameHi || selectedClinic?.fullName || selectedClinic?.nameHi || selectedClinic?.name) : (selectedClinic?.fullName || selectedClinic?.name)}
              </h3>
              <p className="text-xs text-sky-200 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{selectedClinic?.city}, Madhya Pradesh • PIN {selectedClinic?.pincode || '465661'}</span>
              </p>
            </div>
          </div>

          {/* Right Information & Actions */}
          <div className="lg:col-span-6 p-7 lg:p-9 space-y-6 flex flex-col justify-between bg-white">
            
            <div className="space-y-5">
              <span className="text-xs font-sora font-extrabold text-[#0F4C81] uppercase tracking-widest block">
                {language === 'en' ? 'Branch Details & OPD' : 'शाखा विवरण एवं ओपीडी'}
              </span>

              {/* Address */}
              <div className="space-y-1">
                <span className="text-[10px] font-sora font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Branch Address' : 'शाखा का पता'}
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {selectedClinic?.address}
                </p>
              </div>

              {/* Operating Hours */}
              <div className="space-y-1">
                <span className="text-[10px] font-sora font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'en' ? 'OPD Operating Hours' : 'ओपीडी समय'}
                </span>
                <p className="text-xs font-sora font-bold text-emerald-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedClinic?.operatingHours}</span>
                </p>
              </div>

              {/* Reception & Emergency Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 hover:border-slate-300 transition">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    {language === 'en' ? 'Desk Reception' : 'रिसेप्शन डेस्क'}
                  </span>
                  <p className="text-xs font-sora font-extrabold text-[#0F4C81] font-mono flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
                    <span>{selectedClinic?.phone || '+91 7371 224400'}</span>
                  </p>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 space-y-1 hover:border-rose-200 transition">
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-500" />
                    {language === 'en' ? '24/7 Emergency' : '24/7 आपातकालीन'}
                  </span>
                  <p className="text-xs font-sora font-extrabold text-rose-700 font-mono flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{selectedClinic?.emergencyHelpline || '+91 98260 11223'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <a
                href={selectedClinic?.googleMapDirectionsUrl || (selectedClinic?.coordinates?.lat ? `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.coordinates.lat},${selectedClinic.coordinates.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selectedClinic?.name || ''} ${selectedClinic?.address || ''}`)}`)}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary py-3 px-5 rounded-2xl text-xs font-sora font-bold flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#0F4C81]" />
                <span>{language === 'en' ? 'Get Directions' : 'दिशा-निर्देश (मैप)'}</span>
              </a>

              <button
                onClick={() => openBookingModal(undefined, selectedClinic?.id)}
                className="btn-primary py-3 px-6 rounded-2xl text-xs font-sora font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>{language === 'en' ? 'Book Branch Token' : 'शाखा टोकन बुक करें'}</span>
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          SECTION 3: DOCTORS AT THIS BRANCH
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-xs font-sora font-black text-[#0F4C81] uppercase tracking-wider block">
              {language === 'en' ? 'Medical Staff' : 'चिकित्सा दल'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-sora font-black text-slate-900 mt-1">
              {language === 'en' ? `Doctors Assigned to ${selectedClinic?.name || 'This Branch'}` : `${selectedClinic?.name || 'इस शाखा'} के डॉक्टर`}
            </h2>
          </div>
        </div>

        {(() => {
          const branchDoctors = (doctors || []).filter(d => {
            if (!selectedBranchId) return true;
            if (!d.clinicsCovered || d.clinicsCovered.length === 0) return true;
            
            const searchTerms = [
              selectedBranchId.toLowerCase(),
              selectedClinic?.id?.toLowerCase(),
              selectedClinic?.name?.toLowerCase(),
              selectedClinic?.city?.toLowerCase(),
              selectedClinic?.fullName?.toLowerCase(),
            ].filter(Boolean) as string[];

            const matchesCovered = d.clinicsCovered.some(cCovered => {
              const term = String(cCovered).toLowerCase().replace(/\s*branch\s*/i, '').trim();
              return searchTerms.some(st => {
                const cleanSt = st.replace(/\s*branch\s*/i, '').trim();
                return cleanSt && (term.includes(cleanSt) || cleanSt.includes(term));
              });
            });

            if (matchesCovered) return true;

            const docBranch = String((d as any).branch || (d as any).branchId || '').toLowerCase().trim();
            if (docBranch && searchTerms.some(st => st.includes(docBranch) || docBranch.includes(st))) {
              return true;
            }

            return false;
          });

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {branchDoctors.map(doc => {
                const docName = doc?.name || 'Doctor';
                const displayName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;

                return (
                  <div key={doc.id} className="healthcare-card p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs shrink-0">
                          <img
                            src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR}
                            alt={displayName}
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-sora font-black text-sm text-slate-900 truncate">{displayName}</h4>
                          <p className="text-[11px] text-emerald-700 font-bold">{doc.specialization || 'Specialist'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 font-medium">
                          <Stethoscope className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                          {doc.qualification || 'MBBS'}
                        </span>
                        <span className="font-sora font-black text-[#0F4C81]">₹{doc.consultationFeeClinic || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(doc.id, selectedClinic?.id)}
                      className="btn-primary w-full text-xs font-bold py-2.5 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{language === 'en' ? 'Book Consultation' : 'परामर्श बुक करें'}</span>
                    </button>
                  </div>
                );
              })}

              {branchDoctors.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-100/80 rounded-3xl border border-dashed border-slate-300 space-y-1">
                  <h5 className="font-sora font-black text-slate-800 text-sm">
                    {language === 'en' ? `No Doctors Assigned to ${selectedClinic?.name || 'this branch'}` : `${selectedClinic?.name || 'इस शाखा'} में कोई डॉक्टर उपलब्ध नहीं हैं`}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {language === 'en' ? 'No Doctor Available Now in this branch.' : 'इस समय इस शाखा में कोई डॉक्टर उपलब्ध नहीं हैं।'}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* ==========================================
          SECTION 4: HOSPITAL CLINICAL FACILITIES GRID
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-sora font-black text-emerald-700 uppercase tracking-widest block">
            {language === 'en' ? 'Clinical Infrastructure' : 'नैदानिक अवसंरचना'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-sora font-black text-slate-900">
            {language === 'en' ? 'Hospital Facilities & Equipment' : 'अस्पताल सुविधाएं एवं उपकरण'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'en'
              ? 'Designed for clinical precision, patient safety, and high-quality surgical outcomes.'
              : 'नैदानिक सटीकता, रोगी सुरक्षा और उच्च गुणवत्ता वाले सर्जिकल परिणामों के लिए डिज़ाइन किया गया।'}
          </p>
        </div>

        {/* Facility Category Filter */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {facilityCategories.map(fc => (
            <button
              key={fc.id}
              onClick={() => setFacilityCategory(fc.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-sora font-extrabold whitespace-nowrap transition cursor-pointer ${
                facilityCategory === fc.id
                  ? 'bg-[#0F4C81] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
              }`}
            >
              {fc.label}
            </button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFacilities.map(fac => (
            <div 
              key={fac.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={fac.imageUrl} 
                    alt={fac.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#0B2545] text-white text-[10px] font-sora font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {fac.category}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-sora font-black text-base text-slate-900 leading-snug">{fac.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                    {fac.description}
                  </p>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 pt-2">
                    <span className="text-[10px] font-sora font-black text-slate-700 uppercase tracking-wider block">
                      {language === 'en' ? 'Key Highlights:' : 'मुख्य विशेषताएं:'}
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                      {fac.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>
                  {language === 'en' ? 'Available:' : 'उपलब्ध:'} {fac.availableBranches.includes('all') ? (language === 'en' ? 'All 3 Branches' : 'तीनों शाखाओं में') : fac.availableBranches.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
};
