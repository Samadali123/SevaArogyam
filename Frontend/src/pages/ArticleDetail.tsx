import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  UserCheck, 
  BookOpen, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';

interface ArticleDetailProps {
  onBack: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ onBack }) => {
  const { 
    healthBlogs, 
    selectedBlogId, 
    setSelectedBlogId, 
    doctors, 
    openBookingModal, 
    language 
  } = useApp();

  const currentArticle = healthBlogs.find(b => b.id === selectedBlogId) || healthBlogs[0];

  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-slate-600 font-bold text-lg">No article found or available.</p>
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 bg-[#0F4C81] text-white rounded-xl font-bold shadow-md hover:bg-[#0B2545] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const doctorAuthor = doctors.find(d => d.name.toLowerCase().includes(currentArticle.authorName?.toLowerCase() || '')) || doctors[0];
  const relatedArticles = healthBlogs.filter(b => b.id !== currentArticle.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentArticle.title,
        text: currentArticle.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 space-y-8">
      
      {/* 1. ARTICLE TOP NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-black text-[#0F4C81] hover:text-[#0A365C] bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to Health Tips' : 'स्वास्थ्य सुझावों पर वापस लौटें'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Share' : 'शेयर करें'}</span>
            </button>
            
            <button
              onClick={() => openBookingModal(doctorAuthor.id, undefined)}
              className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Consult Author Doctor' : 'लेखक डॉक्टर से परामर्श लें'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN ARTICLE CONTAINER */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Article Header Details */}
        <div className="space-y-4 text-center sm:text-left">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="bg-[#0B2545] text-emerald-400 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
              {currentArticle.category}
            </span>
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentArticle.date}
            </span>
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentArticle.readTimeMinutes} {language === 'en' ? 'min read' : 'मिनट पढ़ें'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
            {currentArticle.title}
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            {currentArticle.excerpt}
          </p>

          {/* Author Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={doctorAuthor.avatarUrl || DEFAULT_DOCTOR_AVATAR} 
                alt={doctorAuthor.name}
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-slate-900">{currentArticle.authorName}</h4>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-[#0F4C81] font-bold">
                  {doctorAuthor.specialization} • {language === 'en' ? 'SEVASADAN Senior Specialist' : 'सेवासदन वरिष्ठ विशेषज्ञ'}
                </p>
              </div>
            </div>

            <button
              onClick={() => openBookingModal(doctorAuthor.id, undefined)}
              className="hidden sm:flex items-center gap-1 bg-[#0F4C81] hover:bg-[#0A365C] text-white px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0"
            >
              <span>{language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें'}</span>
            </button>
          </div>

        </div>

        {/* Hero Cover Image */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative h-72 sm:h-96">
          <img 
            src={currentArticle.imageUrl} 
            alt={currentArticle.title}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 to-transparent pointer-events-none" />
        </div>

        {/* Article Body Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-800 text-base leading-relaxed">
          
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-3">
            {language === 'en' ? 'Overview & Clinical Perspective' : 'अवलोकन एवं क्लिनिकल दृष्टिकोण'}
          </h2>
          
          <p className="font-medium text-slate-700">
            {language === 'en' 
              ? 'Maintaining optimal health requires a blend of clinical awareness, timely diagnostic evaluations, and structured daily habits. At SEVASADAN Super Specialty OPDs in Sarangpur, Shujalpur, and Rajgarh, our specialists frequently observe that proactive medical consultations drastically improve long-term treatment outcomes.'
              : 'उत्कृष्ट स्वास्थ्य बनाए रखने के लिए क्लिनिकल जागरूकता, समय पर जांच और दैनिक आदतों का संतुलन आवश्यक है। सारंगपुर, शुजालपुर और राजगढ़ में सेवासदन सुपर स्पेशलिटी ओपीडी में हमारे विशेषज्ञ अक्सर देखते हैं कि समय पर ली गई डॉक्टरी सलाह से इलाज के परिणाम बहुत बेहतर होते हैं।'}
          </p>

          <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 space-y-3">
            <h3 className="font-extrabold text-sm text-[#0F4C81] flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'en' ? 'Key Specialist Recommendations' : 'विशेषज्ञ डॉक्टर की प्रमुख सिफारिशें'}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 font-semibold">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'en' ? 'Schedule routine annual screenings tailored to age and family health history.' : 'उम्र और पारिवारिक स्वास्थ्य इतिहास के अनुसार नियमित वार्षिक जांच करवाएं।'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'en' ? 'Never self-medicate with unverified antibiotics or pain relievers without prescription.' : 'बिना प्रिस्क्रिप्शन के कभी भी एंटीबायोटिक या दर्द निवारक दवाएं स्वयं न लें।'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'en' ? 'Utilize SEVASADAN Digital Tele-OPD for quick follow-up reviews and prescription renewals.' : 'त्वरित फॉलो-अप और प्रिस्क्रिप्शन रीन्यू के लिए सेवासदन डिजिटल टेली-ओपीडी का उपयोग करें।'}</span>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 pt-2">
            {language === 'en' ? 'When to Consult a Specialist Immediately' : 'विशेषज्ञ डॉक्टर से तुरंत कब परामर्श लें'}
          </h3>

          <p className="text-slate-700 font-medium">
            {language === 'en'
              ? 'If you or your family members experience persistent symptoms such as unmanaged high fever, sudden shortness of breath, unexplained joint swelling, or ongoing blood pressure fluctuations, do not delay care. Our outpatient departments at Sarangpur, Shujalpur, and Rajgarh offer daily OPD tokens with live queue tracking.'
              : 'यदि आप या आपके परिवार के सदस्य लगातार तेज बुखार, सांस फूलना, जोड़ों में सूजन, या रक्तचाप में उतार-चढ़ाव जैसे लक्षणों का सामना कर रहे हैं, तो तुरंत डॉक्टर से संपर्क करें। हमारी सारंगपुर, शुजालपुर और राजगढ़ शाखाओं में रोजाना लाइव टोकन ट्रैकिंग के साथ ओपीडी उपलब्ध है।'}
          </p>

          {/* Alert Takeaways Box */}
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="font-black text-sm text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'en' ? 'Actionable Takeaway' : 'महत्वपूर्ण सुझाव'}</span>
            </h4>
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              {language === 'en' 
                ? <>Early diagnosis remains the most effective form of preventative healthcare. You can book an OPD token or schedule a video call with <strong>{currentArticle.authorName}</strong> directly through SEVASADAN.</>
                : <>शुरुआती जांच ही सबसे प्रभावी बचाव है। आप सेवासदन पोर्टल से सीधे <strong>{currentArticle.authorName}</strong> का ओपीडी टोकन या वीडियो परामर्श बुक कर सकते हैं।</>}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-medium leading-normal flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>{language === 'en' ? 'Medical Disclaimer:' : 'चिकित्सा अस्वीकरण:'}</strong> {language === 'en' 
                ? 'This health insight article is intended strictly for educational purposes and should not be used as a substitute for professional medical diagnosis or emergency treatment. Always consult a qualified physician for individual medical concerns.'
                : 'यह स्वास्थ्य लेख केवल जागरूकता के लिए है और इसे किसी आपातकालीन उपचार या व्यक्तिगत चिकित्सा सलाह का विकल्प नहीं माना जाना चाहिए। व्यक्तिगत चिकित्सा समस्याओं के लिए सदैव योग्य डॉक्टर से परामर्श लें।'}
            </p>
          </div>

        </div>

        {/* Doctor Consultation Card Footer */}
        <div className="bg-linear-to-r from-[#0B2545] via-[#0F4C81] to-[#0D1F38] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-900/50">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
              {language === 'en' ? 'Need Expert Care?' : 'विशेषज्ञ देखभाल चाहिए?'}
            </span>
            <h3 className="text-xl font-black">
              {language === 'en' ? `Consult ${currentArticle.authorName}` : `${currentArticle.authorName} से परामर्श लें`}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'en'
                ? 'In-clinic OPD tokens at Sarangpur, Shujalpur & Rajgarh or Virtual Video consult.'
                : 'सारंगपुर, शुजालपुर और राजगढ़ में क्लिनिक ओपीडी टोकन या ऑनलाइन वीडियो परामर्श उपलब्ध है।'}
            </p>
          </div>

          <button
            onClick={() => openBookingModal(doctorAuthor.id, undefined)}
            className="bg-[#10B981] hover:bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Stethoscope className="w-4 h-4" />
            <span>{language === 'en' ? 'Book Doctor Consultation' : 'डॉक्टर परामर्श बुक करें'}</span>
          </button>
        </div>

      </article>

      {/* 3. RELATED ARTICLES SECTION */}
      {relatedArticles.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-black text-xl text-slate-900">
              {language === 'en' ? 'More Medical Insights & Health Tips' : 'अन्य चिकित्सा जानकारी और स्वास्थ्य टिप्स'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map(rel => (
              <div
                key={rel.id}
                onClick={() => {
                  setSelectedBlogId(rel.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="h-36 overflow-hidden relative">
                    <img 
                      src={rel.imageUrl} 
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <span className="absolute top-2 left-2 bg-[#0B2545] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-bold">{rel.date} • {rel.readTimeMinutes} min read</p>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F4C81] transition">
                      {rel.title}
                    </h4>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0F4C81]">
                  <span>{rel.authorName}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
