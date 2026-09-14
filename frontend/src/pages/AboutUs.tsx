import React from 'react';
import { 
  GraduationCap,
  Stethoscope, 
  CheckCircle2,
  Calendar,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Building2,
  Activity,
  Heart,
  Baby,
  Crosshair
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import drAnkurImg from '../assets/images/Dr_Ankur.jpeg';

interface AboutUsProps {
  onNavigate?: (tab: string) => void;
}

export const AboutUs: React.FC<AboutUsProps> = () => {
  const { openBookingModal, language } = useApp();
  const hi = language === 'hi';

  const educationTimeline = [
    {
      period: '2010 – 2016',
      degree: hi ? 'एमबीबीएस (MBBS)' : 'MBBS',
      institution: hi ? 'इंडेक्स मेडिकल कॉलेज एवं रिसर्च सेंटर, इंदौर' : 'Index Medical College & Research Centre, Indore',
      description: hi
        ? 'इंटरनल मेडिसिन, इमरजेंसी ट्रॉमा और बाल रोग में व्यापक क्लिनिकल रोटेशन के साथ बुनियादी मेडिकल डिग्री।'
        : 'Foundational medical degree with extensive clinical rotations across internal medicine, emergency trauma, and pediatrics.'
    },
    {
      period: '2017 – 2020',
      degree: hi ? 'एमएस (MS) — जनरल सर्जरी' : 'MS — General Surgery',
      institution: hi ? 'श्री अरबिंदो इंस्टीट्यूट ऑफ मेडिकल साइंसेज (SAIMS), इंदौर' : 'Sri Aurobindo Institute of Medical Sciences (SAIMS), Indore',
      description: hi
        ? 'इमरजेंसी ट्रॉमा, एक्यूट एब्डॉमिनल सर्जरी और क्रिटिकल केयर मैनेजमेंट में पारंगत पोस्टग्रेजुएट सर्जिकल रेजीडेंसी।'
        : 'Postgraduate surgical residency mastering emergency trauma, acute abdominal procedures, and critical care management.'
    },
    {
      period: '2023 – 2026',
      degree: hi ? 'एमसीएच (MCh) — पीडियाट्रिक सर्जरी' : 'MCh — Pediatric Surgery',
      institution: hi ? 'एमजीएम मेडिकल कॉलेज एवं सुपर स्पेशलिटी अस्पताल, इंदौर' : 'MGM Medical College & Super Specialty Hospital, Indore',
      description: hi
        ? 'नवजात शिशुओं की जन्मजात सर्जिकल विसंगतियों, पीडियाट्रिक यूरोलॉजी और पीडियाट्रिक लेप्रोस्कोपी पर केंद्रित सुपर-स्पेशलिटी रेजीडेंसी।'
        : 'Super-specialty residency focusing on newborn congenital surgical anomalies, pediatric urology, and pediatric laparoscopy.'
    }
  ];

  const corePillars = [
    {
      icon: ShieldCheck,
      title: hi ? 'एनएबीएच मान्यता प्राप्त देखभाल' : 'NABH Accredited Care',
      desc: hi ? 'सारंगपुर, शुजालपुर और राजगढ़ में राष्ट्रीय क्लिनिकल सुरक्षा और गुणवत्ता मानकों का पूर्ण पालन।' : 'Strict adherence to national clinical safety and quality protocols across Sarangpur, Shujalpur, and Rajgarh.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      icon: Baby,
      title: hi ? 'सुपर-स्पेशलिटी विशेषज्ञता' : 'Super-Specialty Expertise',
      desc: hi ? 'एमसीएच (MCh) प्रमाणित विशेषज्ञों के नेतृत्व में उन्नत पीडियाट्रिक, निओनेटल और यूरोलॉजिकल सर्जिकल उपचार।' : 'Advanced pediatric, neonatal, and urological surgical interventions led by MCh certified specialists.',
      color: 'bg-[#0F4C81]/10 text-[#0F4C81] border-[#0F4C81]/20'
    },
    {
      icon: Building2,
      title: hi ? '24x7 मल्टी-स्पेशलिटी ओपीडी' : '24x7 Multi-Specialty OPD',
      desc: hi ? 'सहज ओपीडी टोकन ट्रैकिंग, स्वचालित पैथोलॉजी लैब और आपातकालीन एसीएलएस (ACLS) एम्बुलेंस सुविधा।' : 'Seamless OPD token tracking, automated pathology labs, and emergency ACLS ambulance coverage.',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    }
  ];

  const clinicalExpertiseList = [
    {
      icon: Baby,
      title: hi ? 'पीडियाट्रिक सर्जरी (बाल रोग सर्जरी)' : 'Pediatric Surgery',
      desc: hi ? 'शिशुओं, बच्चों और किशोरों की जन्मजात या अन्य सर्जिकल समस्याओं का संपूर्ण उपचार।' : 'Comprehensive surgical care for infants, children, and teens with congenital or acquired surgical conditions.'
    },
    {
      icon: Heart,
      title: hi ? 'निओनेटल सर्जरी (नवजात शिशु सर्जरी)' : 'Neonatal Surgery',
      desc: hi ? 'नवजात शिशुओं की गंभीर जन्मजात विकृतियों के लिए आईसीयू में विशेष ऑपरेशन सुविधा।' : 'Specialized operative management for newborns facing critical congenital anomalies in ICU settings.'
    },
    {
      icon: Crosshair,
      title: hi ? 'पीडियाट्रिक यूरोलॉजी' : 'Pediatric Urology',
      desc: hi ? 'गुर्दे, मूत्राशय, मूत्रनली की रुकावट, हाइपोस्पेडियास और अविकसित अंडकोष का सर्जिकल इलाज।' : 'Surgical repair of kidneys, bladder, ureter, PUJ obstruction, hypospadias, and undescended testicles.'
    },
    {
      icon: Stethoscope,
      title: hi ? 'जनरल सर्जरी (सामान्य शल्य चिकित्सा)' : 'General Surgery',
      desc: hi ? 'जटिल सर्जिकल समस्याओं, पेट एवं आंतों की सर्जरी, और आपातकालीन आघात का विशेषज्ञ इलाज।' : 'Expert treatment of complex surgical conditions, gastrointestinal procedures, acute trauma, and emergency care.'
    },
    {
      icon: Activity,
      title: hi ? 'लैप्रोस्कोपिक एवं दूरबीन सर्जरी' : 'Laparoscopic & Minimally Invasive',
      desc: hi ? 'कम दर्द, न्यूनतम चीरा और त्वरित रिकवरी के लिए आधुनिक दूरबीन सर्जिकल तकनीक।' : 'Modern keyhole surgical techniques designed to minimize tissue trauma, reduce pain, and accelerate recovery.'
    },
    {
      icon: ShieldCheck,
      title: hi ? 'जन्म पूर्व सर्जिकल परामर्श (Antenatal Counseling)' : 'Antenatal Surgical Counseling',
      desc: hi ? 'गर्भस्थ शिशु की जन्मजात विकृतियों का अल्ट्रासाउंड मूल्यांकन और जन्म के तुरंत बाद इलाज की योजना।' : 'Pre-birth fetal ultrasound evaluation for congenital surgical conditions to plan immediate post-birth intervention.'
    }
  ];

  const commonConditions = [
    { name: hi ? 'हाइपोस्पेडियास रिपेयर (Hypospadias Repair)' : 'Hypospadias Repair', desc: hi ? 'जन्मजात मूत्रमार्ग पुनर्गठन' : 'Congenital urethral opening reconstruction' },
    { name: hi ? 'अविकसित अंडकोष सर्जरी (Orchidopexy)' : 'Undescended Testis (Orchidopexy)', desc: hi ? 'अंडकोष को सही स्थान पर लाने का ऑपरेशन' : 'Surgical correction for testicular descent' },
    { name: hi ? 'गुर्दा नली रुकावट (PUJ Pyeloplasty)' : 'PUJ Obstruction (Pyeloplasty)', desc: hi ? 'गुर्दे व पेशाब नली के जोड़ का ऑपरेशन' : 'Kidney-ureter junction blockage repair' },
    { name: hi ? 'पेशाब का उलटा बहाव (VUR Surgery)' : 'Vesicoureteral Reflux (VUR)', desc: hi ? 'पेशाब के गुर्दे में वापस जाने से रोकने का इलाज' : 'Preventing urine backflow to kidneys' },
    { name: hi ? 'मूत्र मार्ग रुकावट (PUV Valve Ablation)' : 'Posterior Urethral Valve (PUV)', desc: hi ? 'पेशाब के रास्ते में झिल्ली हटाने की प्रक्रिया' : 'Urinary tract obstruction valve ablation' },
    { name: hi ? 'बच्चों में हर्निया व हाइड्रोसील (Hernia & Hydrocele)' : 'Pediatric Hernia & Hydrocele', desc: hi ? 'जांघ व पेट के सूजन का दूरबीन द्वारा ऑपरेशन' : 'Minimally invasive groin swelling repairs' },
    { name: hi ? 'आंतों की रुकावट (Intestinal Atresia)' : 'Neonatal Intestinal Atresia', desc: hi ? 'नवजात में बंद आंतों को खोलने की सर्जरी' : 'Congenital bowel obstruction surgery' },
    { name: hi ? 'बच्चों में अपेंडिक्स व पेट का इंफेक्शन (Appendicitis)' : 'Pediatric Appendicitis & Peritonitis', desc: hi ? 'आपातकालीन पेट दर्द एवं अपेंडिक्स का ऑपरेशन' : 'Emergency acute abdominal surgeries' }
  ];

  return (
    <div className="pb-24 space-y-16 font-sans text-slate-800 bg-slate-50/50 overflow-x-hidden w-full max-w-full">
      
      {/* ==========================================
          SECTION 1: ELEGANT EDITORIAL HERO SECTION
      ========================================== */}
      <section className="relative bg-gradient-to-br from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white pt-16 sm:pt-20 pb-20 sm:pb-24 rounded-b-[3rem] shadow-2xl overflow-hidden border-b border-emerald-500/20 font-sans">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-140 h-140 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-140 h-140 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Eyebrow Badge */}
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-emerald-300 block">
                {hi ? 'प्रथम श्रेणी राजपत्रित अधिकारी • 3 बार एमपीपीएससी चयनित' : 'Class-I Gazetted Specialist • 3× MPPSC Selected'}
              </span>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-tight">
                  Dr. Ankur Deshwali
                </h1>
                <p className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  {hi ? 'बाल रोग सर्जन | नवजात शिशु सर्जन | जनरल सर्जन' : 'Pediatric Surgeon | Neonatal Surgeon | General Surgeon'}
                </p>
              </div>

              {/* Lead Paragraph */}
              <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed font-medium max-w-2xl font-sans">
                {hi
                  ? 'नवजात शिशुओं, बच्चों और वयस्कों के लिए समर्पित, विश्वस्तरीय सुपर-स्पेशलिटी शल्य चिकित्सा सेवाएं। एमपी मेडिकल सर्विसेज के अंतर्गत सिविल अस्पताल सारंगपुर एवं जिला अस्पताल राजगढ़ में पदस्थ।'
                  : 'Dedicated to providing compassionate, world-class super-specialty surgical care for newborns, children, and adults. Serving MP Medical Services as a Class-I Gazetted Officer at Civil Hospital, Sarangpur & District Hospital, Rajgarh.'}
              </p>

              {/* Quick Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-sans">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left space-y-1">
                  <span className="text-[11px] font-heading font-extrabold text-amber-300 block">{hi ? 'शैक्षणिक योग्यता' : 'QUALIFICATIONS'}</span>
                  <p className="text-xs font-bold text-white">MBBS • MS • MCh</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left space-y-1">
                  <span className="text-[11px] font-heading font-extrabold text-emerald-300 block">{hi ? 'सरकारी पद' : 'GOVERNMENT ROLE'}</span>
                  <p className="text-xs font-bold text-white">{hi ? 'प्रथम श्रेणी विशेषज्ञ' : 'Class-I Specialist'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left space-y-1">
                  <span className="text-[11px] font-heading font-extrabold text-sky-300 block">{hi ? 'लोक सेवा' : 'PUBLIC SERVICE'}</span>
                  <p className="text-xs font-bold text-white">{hi ? '3× एमपीपीएससी चयनित' : '3× MPPSC Selected'}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => openBookingModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold px-8 py-4 rounded-2xl text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2.5 cursor-pointer"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span>{hi ? 'ओपीडी अपॉइंटमेंट बुक करें' : 'Book OPD Appointment'}</span>
                </button>

                <a
                  href="tel:1800-7382-723"
                  className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold px-7 py-4 rounded-2xl text-sm border border-white/20 flex items-center gap-2.5 backdrop-blur-md transition hover:scale-105"
                >
                  <PhoneCall className="w-5 h-5 text-emerald-300" />
                  <span>{language === 'en' ? 'Call Doctor Helpline' : 'डॉक्टर हेल्पलाइन पर कॉल करें'}</span>
                </a>
              </div>

            </div>

            {/* Right Doctor Portrait Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group max-w-md w-full">
                
                {/* Glowing Background Ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-400 via-sky-400 to-amber-400 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-700 pointer-events-none" />
                
                {/* Main Card Container */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 bg-slate-900/80 backdrop-blur-md">
                  <img
                    src={drAnkurImg}
                    alt="Dr. Ankur Deshwali"
                    className="w-full h-120 object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-6 text-white space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sora font-black text-xl text-white">Dr. Ankur Deshwali</h3>
                      <span className="text-emerald-300 text-xs font-sora font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Available Today
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-sora font-bold">MCh Senior Pediatric & Neonatal Surgeon</p>
                    <p className="text-[11px] text-slate-300 font-medium pt-1">Civil Hospital, Sarangpur & District Hospital, Rajgarh</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: THREE CORE HEALTHCARE PILLARS
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {corePillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-lg space-y-3.5 hover:shadow-xl transition duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pillar.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-sora font-black text-lg text-slate-900 group-hover:text-[#0F4C81] transition-colors">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          SECTION 3: EDUCATION & QUALIFICATIONS TIMELINE
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-4">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sora font-black text-[#0F4C81] uppercase tracking-widest block">
            {hi ? 'अकादमिक उत्कृष्टता' : 'Academic Excellence'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-black text-slate-900 tracking-tight">
            {hi ? 'शिक्षा एवं सर्जिकल सुपर-स्पेशलिटी प्रशिक्षण' : 'Education & Surgical Super-Specialty Training'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {hi
              ? 'मध्य प्रदेश के प्रमुख मेडिकल कॉलेजों और सुपर-स्पेशलिटी अस्पतालों में गहन सुपर-स्पेशलिटी प्रशिक्षण।'
              : 'Rigorous super-specialty training across premier medical colleges and super-specialty hospitals of Madhya Pradesh.'}
          </p>
        </div>

        {/* Timeline Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {educationTimeline.map((edu, idx) => (
            <div 
              key={idx}
              className="healthcare-card p-7 space-y-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#0B2545] text-emerald-300 font-sora font-extrabold text-xs px-3.5 py-1.5 rounded-xl font-mono">
                    {edu.period}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0F4C81] flex items-center justify-center group-hover:bg-[#0F4C81] group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-sora font-black text-slate-900">{edu.degree}</h3>
                  <p className="text-xs font-bold text-[#0F4C81] mt-1">{edu.institution}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {edu.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SECTION 4: CORE CLINICAL EXPERTISE GRID
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-sora font-black text-[#0F4C81] uppercase tracking-widest block">
            {hi ? 'विशिष्ट देखभाल' : 'Specialized Care'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-sora font-black text-slate-900 tracking-tight">
            {hi ? 'सर्जिकल एवं क्लिनिकल विशेषज्ञता के क्षेत्र' : 'Areas of Surgical & Clinical Expertise'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {hi
              ? 'नवजात शिशु आईसीयू की जटिलताओं से लेकर की-होल लेप्रोस्कोपी तक उन्नत पीडियाट्रिक सर्जिकल उपचार।'
              : 'Advanced pediatric operative interventions ranging from newborn ICU anomalies to keyhole laparoscopy.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicalExpertiseList.map((exp, idx) => {
            const IconComp = exp.icon;
            return (
              <div 
                key={idx}
                className="healthcare-card p-7 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0F4C81] flex items-center justify-center group-hover:bg-[#0B2545] group-hover:text-emerald-300 transition-colors shadow-2xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-sora font-black text-slate-900">{exp.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {exp.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          SECTION 5: COMMON SURGICAL CONDITIONS TREATED
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-sora font-black text-[#0F4C81] uppercase tracking-wider block">
                {hi ? 'सर्जिकल स्पेक्ट्रम' : 'Surgical Spectrum'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-sora font-black text-slate-900 mt-1">
                {hi ? 'सामान्य पीडियाट्रिक सर्जिकल स्थितियां' : 'Common Pediatric Surgical Conditions'}
              </h2>
            </div>
            <button
              onClick={() => openBookingModal()}
              className="btn-primary text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span>{hi ? 'डॉक्टर परामर्श बुक करें' : 'Book Doctor Consultation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {commonConditions.map((cond, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-[#0F4C81] transition"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="font-sora font-black text-xs text-slate-900 truncate">{cond.name}</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-6 leading-normal">{cond.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          SECTION 6: CONSULTATION CTA BANNER
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden glow-teal">
          
          <div className="space-y-3 text-center md:text-left relative z-10 max-w-xl">
            <span className="text-xs font-sora font-black text-emerald-300 uppercase tracking-widest block">
              {hi ? 'विशेषज्ञ चिकित्सा सलाह' : 'EXPERT MEDICAL ADVICE'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-sora font-black text-white tracking-tight">
              {hi ? 'क्या आपको विशिष्ट पीडियाट्रिक सर्जिकल मार्गदर्शन चाहिए?' : 'Need Specialized Pediatric Surgical Guidance?'}
            </h3>
            <p className="text-xs sm:text-sm text-sky-100/90 font-medium leading-relaxed">
              {hi
                ? 'शुरुआती जांच से समय पर सर्जिकल मूल्यांकन संभव है। आज ही डॉ. अंकुर देशवाली से ओपीडी टोकन बुक करें या वीडियो परामर्श लें।'
                : 'Early diagnosis allows timely surgical evaluation. Book an OPD token or consult via video consultation with Dr. Ankur Deshwali today.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10">
            <button
              onClick={() => openBookingModal()}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sora font-black px-7 py-4 rounded-2xl text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2.5 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-slate-950" />
              <span>{hi ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'}</span>
            </button>

            <a
              href="tel:1800-7382-723"
              className="bg-white/10 hover:bg-white/20 text-white font-sora font-bold px-7 py-4 rounded-2xl text-sm border border-white/20 flex items-center gap-2.5 backdrop-blur-md transition hover:scale-105"
            >
              <PhoneCall className="w-5 h-5 text-emerald-300" />
              <span>{hi ? 'हेल्पलाइन पर कॉल करें' : 'Call Helpline'}</span>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
