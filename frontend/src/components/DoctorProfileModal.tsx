import React from 'react';
import { 
  X, 
  Star, 
  Award, 
  Calendar, 
  Video, 
  Building2, 
  CheckCircle2, 
  Globe, 
  GraduationCap, 
  ShieldCheck, 
  Stethoscope, 
  Clock
} from 'lucide-react';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';

export const DoctorProfileModal: React.FC = () => {
  const { 
    isDoctorProfileModalOpen, 
    selectedDoctorForProfile, 
    closeDoctorProfileModal, 
    openBookingModal, 
    clinics
  } = useApp();

  if (!isDoctorProfileModalOpen || !selectedDoctorForProfile) return null;

  const doc = selectedDoctorForProfile;

  const handleBook = (_mode?: 'IN_CLINIC' | 'VIDEO') => {
    closeDoctorProfileModal();
    openBookingModal(doc.id, undefined);
  };

  const doctorClinics = clinics.filter(c => doc.clinicsCovered && doc.clinicsCovered.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeDoctorProfileModal}
          className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md transition border border-slate-200"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Banner */}
        <div className="relative bg-linear from-[#0B2545] via-[#0F4C81] to-[#0A365C] text-white p-6 sm:p-8 shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            
            {/* Doctor Avatar with Badge */}
            <div className="relative shrink-0">
              <img
                src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR}
                alt={doc.name}
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-2xl bg-slate-900"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-[10px] font-black uppercase">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Verified</span>
              </div>
            </div>

            {/* Doctor Header Info */}
            <div className="space-y-2 text-center sm:text-left grow">
              
              <div className="inline-flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>NABH Senior Medical Board Practitioner</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{doc.name}</h2>
              <p className="text-emerald-300 font-bold text-sm sm:text-base">{doc.specialization}</p>
              
              <p className="text-xs text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-2">
                <GraduationCap className="w-4 h-4 text-teal-300 shrink-0" />
                <span>{doc.qualification}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200 font-mono">
                  Reg No: {doc.regNumber}
                </span>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{doc.rating} / 5.0 ({doc.totalReviews} reviews)</span>
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-slate-700">
          
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl">
              <p className="text-slate-500 font-bold text-[11px]">Experience</p>
              <p className="text-lg font-black text-[#0F4C81]">{doc.experienceYears}+ Years</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl">
              <p className="text-slate-500 font-bold text-[11px]">Consultations</p>
              <p className="text-lg font-black text-emerald-800">{doc.consultationsCount || '10,000+'}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-2xl">
              <p className="text-slate-500 font-bold text-[11px]">Satisfaction Rate</p>
              <p className="text-lg font-black text-purple-800">{doc.satisfactionRate || 98.5}%</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
              <p className="text-slate-500 font-bold text-[11px]">In-Clinic Fee</p>
              <p className="text-lg font-black text-slate-900">₹{doc.consultationFeeClinic}</p>
            </div>
          </div>

          {/* About & Bio */}
          <div className="space-y-2">
            <h3 className="font-black text-sm text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
              <span>About & Clinical Experience</span>
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {doc.bio}
            </p>
          </div>

          {/* Clinical Interests & Specialties */}
          {doc.clinicalInterests && doc.clinicalInterests.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Specialized Conditions & Procedures</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {doc.clinicalInterests.map((interest, idx) => (
                  <span 
                    key={idx}
                    className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs"
                  >
                    • {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Qualifications */}
          {doc.educationDetails && doc.educationDetails.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#0F4C81]" />
                <span>Education & Institutional Training</span>
              </h3>
              <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {doc.educationDetails.map((edu, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#0F4C81] shrink-0 mt-1.5" />
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Awards & Recognition */}
          {doc.awards && doc.awards.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Honors & Awards</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {doc.awards.map((award, idx) => (
                  <div key={idx} className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-3 rounded-xl font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{award}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Spoken */}
          {doc.languagesSpoken && doc.languagesSpoken.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-slate-600 font-semibold">
              <Globe className="w-4 h-4 text-[#0F4C81]" />
              <span>Languages Spoken:</span>
              <span className="text-slate-900 font-bold">{doc.languagesSpoken.join(', ')}</span>
            </div>
          )}

          {/* OPD Branch Schedule */}
          <div className="space-y-3 pt-2">
            <h3 className="font-black text-sm text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F4C81]" />
              <span>Available Clinic OPD Locations</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctorClinics.map(c => (
                <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900">{c.name}</h4>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">OPD Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{c.address}</p>
                  <p className="text-[11px] text-slate-700 font-mono flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>In-Clinic Token Fee: ₹{doc.consultationFeeClinic}</span>
                  </p>
                </div>
              ))}
            </div>

            {doc.opdScheduleSummary && (
              <p className="text-[11px] bg-slate-100 text-slate-600 p-3 rounded-xl font-mono font-medium">
                <strong>Schedule Summary:</strong> {doc.opdScheduleSummary}
              </p>
            )}
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
            <p className="text-lg font-black text-slate-900">
              ₹{doc.consultationFeeClinic} <span className="text-xs font-normal text-slate-500">(OPD)</span> / ₹{doc.consultationFeeOnline} <span className="text-xs font-normal text-slate-500">(Video)</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleBook('VIDEO')}
              className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Video className="w-4 h-4 text-emerald-600" />
              <span>Book Video Consult</span>
            </button>

            <button
              onClick={() => handleBook('IN_CLINIC')}
              className="flex-1 sm:flex-initial bg-linear-to-r from-[#0F4C81] via-[#0B2545] to-[#10B981] hover:opacity-95 text-white font-black px-6 py-3 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
