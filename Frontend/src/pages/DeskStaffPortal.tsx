import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Printer,
  X,
  Receipt,
  Clock,
  Stethoscope,
  CheckCircle2,
  Users,
  Loader2
} from 'lucide-react';
import type { Appointment, Clinic } from '../types';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';

const formatAssignedBranches = (clinicsCovered?: string[], clinicsList: Clinic[] = []): string => {
  if (!clinicsCovered || clinicsCovered.length === 0) return 'No Assigned Branch';
  const names = clinicsCovered.map(cId => {
    if (!cId) return '';
    const found = clinicsList.find(c => c.id.toLowerCase() === String(cId).toLowerCase() || c.name.toLowerCase() === String(cId).toLowerCase() || (c.city && c.city.toLowerCase() === String(cId).toLowerCase()));
    if (found) return found.name;
    if (String(cId).toLowerCase() === 'sarangpur') return 'Sarangpur Branch';
    if (String(cId).toLowerCase() === 'shujalpur') return 'Shujalpur Branch';
    if (String(cId).toLowerCase() === 'rajgarh') return 'Rajgarh Branch';
    const clean = String(cId).replace(/\s*Branch\s*/i, '').trim();
    return clean ? (clean.charAt(0).toUpperCase() + clean.slice(1) + ' Branch') : '';
  }).filter(Boolean);
  const uniqueNames = Array.from(new Set(names));
  return uniqueNames.length > 0 ? uniqueNames.join(', ') : 'No Assigned Branch';
};

export const DeskStaffPortal: React.FC = () => {
  const { 
    clinics, 
    doctors, 
    appointments, 
    updateAppointmentStatus, 
    bookAppointment,
    activeBranchId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(activeBranchId || 'sarangpur');
  const [activeTab, setActiveTab] = useState<'queue' | 'doctors'>('queue');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Walk-in Cash Booking Modal State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [printedTokenAppt, setPrintedTokenAppt] = useState<Appointment | null>(null);

  const [walkInForm, setWalkInForm] = useState({
    branchId: clinics[0]?.id || 'sarangpur',
    doctorId: doctors[0]?.id || '',
    patientName: '',
    patientPhone: '',
    patientAge: 35,
    patientGender: 'Male' as 'Male' | 'Female' | 'Other',
    patientAddress: 'Sarangpur',
    patientType: 'NEW' as 'NEW' | 'EXISTING' | 'FOLLOW_UP',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    medicalConcerns: '',
    feePaid: 300
  });

  const existingPatientsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; age: number; gender: string; phone: string }>();
    appointments.forEach(a => {
      if (a.patientName && a.patientName !== 'Patient') {
        const key = `${a.patientName.toLowerCase()}_${a.patientPhone}`;
        if (!map.has(key)) {
          map.set(key, {
            id: a.patientId || key,
            name: a.patientName,
            age: a.patientAge || 30,
            gender: a.patientGender || 'Male',
            phone: a.patientPhone || ''
          });
        }
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  // Filter appointments for desk staff
  const branchAppts = appointments.filter(a => 
    (!selectedBranchFilter || a.clinicId === selectedBranchFilter || selectedBranchFilter === 'all') &&
    a.appointmentMode === 'IN_CLINIC'
  );

  const pendingQueue = branchAppts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
  const inProgressQueue = branchAppts.filter(a => a.status === 'IN_PROGRESS');
  const completedQueue = branchAppts.filter(a => a.status === 'COMPLETED');

  const filteredQueue = branchAppts.filter(a => {
    const tokenStr = String(a.tokenNumber || '');
    const matchesSearch = !searchQuery || 
      tokenStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.patientPhone && String(a.patientPhone).includes(searchQuery));
    return matchesSearch;
  });

  // Available doctors for selected branch
  const availableBranchDoctors = doctors.filter(d => {
    if (!walkInForm.branchId) return true;
    const selectedClinic = clinics.find(c => c.id === walkInForm.branchId);
    const searchTerms = [
      walkInForm.branchId.toLowerCase(),
      selectedClinic?.id?.toLowerCase(),
      selectedClinic?.name?.toLowerCase(),
      selectedClinic?.city?.toLowerCase()
    ].filter(Boolean) as string[];

    if (!d.clinicsCovered || d.clinicsCovered.length === 0) return true;
    return d.clinicsCovered.some(cCovered => {
      const term = String(cCovered).toLowerCase().replace(/\s*branch\s*/i, '').trim();
      return searchTerms.some(st => {
        const cleanSt = st.replace(/\s*branch\s*/i, '').trim();
        return cleanSt && (term.includes(cleanSt) || cleanSt.includes(term));
      });
    });
  });

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.patientName || !walkInForm.patientPhone) {
      alert('Patient name and phone number are required');
      return;
    }

    setIsFormSubmitting(true);
    try {
      const selectedDoc = doctors.find(d => d.id === walkInForm.doctorId) || availableBranchDoctors[0] || doctors[0];
      const appt = await bookAppointment({
        doctorId: selectedDoc.id,
        clinicId: walkInForm.branchId,
        appointmentMode: 'IN_CLINIC',
        appointmentDate: walkInForm.appointmentDate,
        timeSlot: walkInForm.timeSlot,
        patientNotes: walkInForm.medicalConcerns || 'Front Desk Walk-in Physical Visit',
        symptoms: [],
        paymentMethod: 'CASH_AT_CLINIC',
        patientType: walkInForm.patientType,
        patientName: walkInForm.patientName,
        patientAge: Number(walkInForm.patientAge),
        patientGender: walkInForm.patientGender,
      });

      setIsFormSubmitting(false);
      setIsWalkInModalOpen(false);
      setPrintedTokenAppt(appt);

      // Reset form
      setWalkInForm({
        branchId: clinics[0]?.id || 'sarangpur',
        doctorId: doctors[0]?.id || '',
        patientName: '',
        patientPhone: '',
        patientAge: 35,
        patientGender: 'Male',
        patientAddress: 'Sarangpur',
        patientType: 'NEW',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        medicalConcerns: '',
        feePaid: 300
      });
    } catch (err) {
      setIsFormSubmitting(false);
      console.error('Walk-in booking error:', err);
      alert('Failed to register walk-in patient. Please try again.');
    }
  };

  const handleCheckIn = (apptId: string) => {
    updateAppointmentStatus(apptId, 'IN_PROGRESS');
  };

  const handleComplete = (apptId: string) => {
    updateAppointmentStatus(apptId, 'COMPLETED');
  };

  const openPrintModal = (appt: Appointment) => {
    setPrintedTokenAppt(appt);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* HERO HEADER BANNER */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#0F4C81]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-[11px] font-heading font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-400/30 backdrop-blur-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FRONT DESK RECEPTION PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              OPD Desk & Walk-in Token Management
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 font-sans font-normal max-w-2xl leading-relaxed">
              Register walk-in patients on-ground, collect cash payments, assign tokens & manage live lobby queue across branches seamlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-heading font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer backdrop-blur-md transition"
              >
                <option value="all" className="bg-[#0B2545] text-white">All Clinic Branches</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0B2545] text-white">{c.name} OPD Desk</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg hover:shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4 text-white stroke-[3]" />
              <span>Book Walk-in Patient (Cash)</span>
            </button>
          </div>
        </div>

        {/* METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider">Waiting Queue</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0F4C81]">{pendingQueue.length}</p>
              <p className="text-[11px] text-slate-500 font-sans">Patients waiting in lobby</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[11px] font-heading font-bold text-emerald-600 uppercase tracking-wider">Inside Consultation</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600">{inProgressQueue.length}</p>
              <p className="text-[11px] text-slate-500 font-sans">Currently with doctor</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[11px] font-heading font-bold text-purple-600 uppercase tracking-wider">Completed Today</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-purple-600">{completedQueue.length}</p>
              <p className="text-[11px] text-slate-500 font-sans">Finished OPD visits</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[11px] font-heading font-bold text-amber-600 uppercase tracking-wider">Active Doctors</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-600">{doctors.length}</p>
              <p className="text-[11px] text-slate-500 font-sans">OPD chambers open</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* NAVIGATION TAB PILLS */}
        <div className="bg-slate-200/60 p-1.5 rounded-2xl inline-flex gap-1.5 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'queue' 
                ? 'bg-white text-[#0F4C81] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-white/50'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Live OPD Queue ({filteredQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'doctors' 
                ? 'bg-white text-[#0F4C81] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-white/50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
            <span>Doctor Chamber Availability</span>
          </button>
        </div>

        {/* LIVE QUEUE TABLE VIEW */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">Today's In-Clinic OPD Token Queue</h3>
                <p className="text-xs text-slate-500 font-sans">Real-time status updates and walk-in token details</p>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search token #, patient name or phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-sans border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-heading font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Token #</th>
                    <th className="p-4">Patient Details</th>
                    <th className="p-4">Assigned Doctor</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="max-w-xs mx-auto space-y-2">
                          <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-heading font-extrabold text-slate-700 text-xs">
                            {searchQuery ? `No tokens or patients matched "${searchQuery}".` : 'No Patient Available in queue currently'}
                          </p>
                          <p className="text-[11px] text-slate-400">Click "Book Walk-in Patient" to register ground walk-ins.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map(appt => {
                      const doc = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-mono font-extrabold text-[#0F4C81] text-sm">
                            {appt.tokenNumber || 'TK-101'}
                          </td>
                          <td className="p-4">
                            <p className="font-heading font-bold text-slate-900 text-xs">{appt.patientName || 'Walk-in Patient'}</p>
                            <p className="text-[11px] text-slate-500 font-sans">
                              {appt.patientPhone ? `+91 ${appt.patientPhone}` : 'No Phone'} • {appt.patientGender || 'Male'}, {appt.patientAge || 35} yrs
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="font-heading font-bold text-slate-800">{doc ? doc.name : 'Duty Doctor'}</p>
                            <p className="text-[10px] text-slate-400">{doc?.specialization || 'General Physician'}</p>
                          </td>
                          <td className="p-4 font-mono text-slate-700 font-medium">
                            {appt.timeSlot}
                          </td>
                          <td className="p-4">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-lg uppercase">
                              Cash Paid (₹{appt.amountPaid || doc?.consultationFeeClinic || 300})
                            </span>
                          </td>
                          <td className="p-4">
                            {appt.status === 'PENDING' || appt.status === 'CONFIRMED' ? (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Waiting in Lobby
                              </span>
                            ) : appt.status === 'IN_PROGRESS' ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Inside Chamber
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPrintModal(appt)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                title="Print Token Pass"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              
                              {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleCheckIn(appt.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold shadow-xs transition cursor-pointer"
                                >
                                  Call to Chamber
                                </button>
                              )}

                              {appt.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleComplete(appt.id)}
                                  className="px-3 py-1.5 bg-[#0F4C81] hover:bg-[#0B2545] text-white rounded-xl text-xs font-heading font-bold shadow-xs transition cursor-pointer"
                                >
                                  Finish Visit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* DOCTOR AVAILABILITY TAB VIEW */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition">
                <div className="flex items-center gap-4">
                  <img
                    src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR}
                    alt={doc.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="font-heading font-extrabold text-base text-slate-900">{doc.name}</h4>
                    <p className="text-xs text-[#0F4C81] font-heading font-bold">{doc.specialization}</p>
                    <p className="text-[11px] text-emerald-700 font-sans font-bold mt-0.5">Consultation: ₹{doc.consultationFeeClinic || 300}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-3 border border-slate-100 font-sans">
                  <div>
                    <p className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider">Assigned OPD Branches</p>
                    <p className="font-heading font-bold text-[#0F4C81] text-xs mt-0.5">
                      {formatAssignedBranches(doc.clinicsCovered, clinics)}
                    </p>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2">
                    <p className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider">Schedule Today</p>
                    <p className="font-medium text-slate-700 text-xs mt-0.5">{doc.opdScheduleSummary || 'OPD Open 09:00 AM - 02:00 PM'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* WALK-IN PATIENT CASH REGISTRATION MODAL */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  FRONT DESK REGISTRATION (CASH)
                </span>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Book Walk-in Patient</span>
                </h3>
              </div>
              <button onClick={() => setIsWalkInModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              
              {/* TOP SELECTION CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading font-bold text-slate-700 mb-1.5">Hospital Clinic Branch *</label>
                  <select
                    value={walkInForm.branchId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, branchId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-heading font-bold text-slate-700 mb-1.5">Assign Doctor *</label>
                  <select
                    required
                    value={walkInForm.doctorId}
                    onChange={(e) => {
                      const docId = e.target.value;
                      const doc = doctors.find(d => d.id === docId);
                      setWalkInForm({
                        ...walkInForm,
                        doctorId: docId,
                        feePaid: doc?.consultationFeeClinic || 300
                      });
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                  >
                    <option value="" disabled>Select Duty Doctor</option>
                    {(availableBranchDoctors.length > 0 ? availableBranchDoctors : doctors).map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`} ({d.specialization}) - ₹{d.consultationFeeClinic || 300}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading font-bold text-slate-700 mb-1.5">Patient Type *</label>
                  <select
                    value={walkInForm.patientType}
                    onChange={(e) => setWalkInForm({ ...walkInForm, patientType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                  >
                    <option value="NEW">New Patient (First Visit)</option>
                    <option value="EXISTING">Existing Registered Patient</option>
                  </select>
                </div>

                <div>
                  <label className="block font-heading font-bold text-slate-700 mb-1.5">Appointment Time Slot *</label>
                  <select
                    value={walkInForm.timeSlot}
                    onChange={(e) => setWalkInForm({ ...walkInForm, timeSlot: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition font-mono"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* CONDITIONAL PATIENT DETAILS ACCORDING TO PATIENT TYPE */}
              {walkInForm.patientType !== 'NEW' ? (
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 space-y-3">
                  <label className="block text-xs font-heading font-bold text-[#0F4C81]">
                    Select Registered Patient ({walkInForm.doctorId ? 'Doctor\'s Patient List' : 'All Registered Patient Records'})
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const p = existingPatientsList.find(item => item.id === selectedVal || item.name === selectedVal);
                      if (p) {
                        setWalkInForm({
                          ...walkInForm,
                          patientName: p.name,
                          patientAge: p.age,
                          patientGender: p.gender as any,
                          patientPhone: p.phone
                        });
                      }
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-sans font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  >
                    <option value="">-- Choose Patient from Registered Patients List --</option>
                    {existingPatientsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.age} Yrs, {p.gender} {p.phone ? `• +91 ${p.phone}` : ''})
                      </option>
                    ))}
                  </select>

                  {walkInForm.patientName && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-sans font-medium">
                      <span>Selected Patient: <span className="font-heading font-bold text-slate-900">{walkInForm.patientName}</span> ({walkInForm.patientAge} Yrs, {walkInForm.patientGender} • +91 {walkInForm.patientPhone})</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-heading font-extrabold uppercase">Registered</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading font-bold text-slate-700 mb-1.5">Patient Full Name *</label>
                      <input
                        type="text"
                        required
                        value={walkInForm.patientName}
                        onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block font-heading font-bold text-slate-700 mb-1.5">Contact Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={walkInForm.patientPhone}
                        onChange={(e) => setWalkInForm({ ...walkInForm, patientPhone: e.target.value.replace(/\D/g, '') })}
                        placeholder="98260XXXXX"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading font-bold text-slate-700 mb-1.5">Age (Years)</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={walkInForm.patientAge}
                        onChange={(e) => setWalkInForm({ ...walkInForm, patientAge: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block font-heading font-bold text-slate-700 mb-1.5">Gender</label>
                      <select
                        value={walkInForm.patientGender}
                        onChange={(e) => setWalkInForm({ ...walkInForm, patientGender: e.target.value as any })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#0F4C81] focus:bg-white outline-none transition"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <p className="font-heading font-extrabold text-emerald-950 text-xs">Payment Collection Mode</p>
                  <p className="text-[11px] text-emerald-800 font-sans font-medium">Cash Collected at Reception Counter</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-heading font-bold text-slate-500">In-Clinic Token Fee</span>
                  <p className="text-xl font-heading font-extrabold text-emerald-700">₹{walkInForm.feePaid}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition text-xs"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Registering Token...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Collect Cash & Issue Token</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OPD TOKEN RECEIPT MODAL */}
      {printedTokenAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100 animate-fade-in text-slate-900 font-sans">
            <div className="text-center space-y-1 border-b border-slate-200/80 pb-4">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-heading font-extrabold px-3 py-0.5 rounded-full uppercase border border-emerald-200">
                OFFICIAL OPD TOKEN RECEIPT
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-1">SEVASADAN CLINIC NETWORK</h3>
              <p className="text-xs text-slate-500 font-sans font-medium">{printedTokenAppt.clinicName || 'Sarangpur Branch'}</p>
            </div>

            <div className="bg-gradient-to-br from-[#0B2545] to-[#0F4C81] text-white p-6 rounded-2xl text-center space-y-1 shadow-md border border-white/10">
              <p className="text-[10px] font-heading font-bold text-emerald-400 uppercase tracking-widest">Token Sequence Number</p>
              <p className="text-4xl font-mono font-extrabold text-amber-300 tracking-wider">#{printedTokenAppt.tokenNumber || 'TK-101'}</p>
              <p className="text-[11px] text-sky-100/80 font-sans pt-1">Please wait in lobby until your token is called</p>
            </div>

            <div className="space-y-2 text-xs font-sans bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-heading font-bold text-slate-900">{printedTokenAppt.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-heading font-bold text-slate-900">{printedTokenAppt.doctorName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Slot & Date:</span>
                <span className="font-mono font-medium text-slate-900">{printedTokenAppt.timeSlot} ({printedTokenAppt.appointmentDate})</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Amount Paid (Cash):</span>
                <span className="font-heading font-extrabold text-emerald-700">₹{printedTokenAppt.amountPaid || 300} (PAID)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setPrintedTokenAppt(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 text-xs transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0B2545] text-white text-xs font-heading font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print OPD Pass</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
