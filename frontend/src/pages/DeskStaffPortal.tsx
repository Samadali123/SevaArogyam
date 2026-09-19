import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
import type { Appointment } from '../types';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import { ThemeSelect } from '../components/ThemeSelect';
import { formatAssignedBranches, isDoctorInBranch } from '../utils/branchUtils';

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
      if (walkInForm.doctorId && a.doctorId !== walkInForm.doctorId) return;
      if (walkInForm.branchId && a.clinicId !== walkInForm.branchId) return;

      if (a.patientName && a.patientName !== 'Patient') {
        const key = `${a.patientName.toLowerCase().trim()}_${a.patientPhone}`;
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
  }, [appointments, walkInForm.doctorId, walkInForm.branchId]);

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
    return isDoctorInBranch(d, walkInForm.branchId, clinics);
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
        
        {/* HERO HEADER BANNER - Staff Dusty Slate-Violet Theme (#5B5588 -> #6E6B9E) */}
        <div className="bg-gradient-to-r from-[#5B5588] via-[#6E6B9E] to-[#5B5588] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border border-white/10 relative">
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-[11px] font-heading font-extrabold px-3 py-1 rounded-full uppercase border border-white/20 backdrop-blur-xs">
              <UserCheck className="w-3.5 h-3.5 text-purple-200" />
              <span>FRONT DESK RECEPTION PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              OPD Desk & Walk-in Token Management
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 font-sans font-normal max-w-2xl leading-relaxed">
              Register walk-in patients on-ground, collect cash payments, assign tokens & manage live lobby queue across branches seamlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0 w-full md:w-auto">
            <div className="w-full sm:w-60">
              <ThemeSelect
                value={selectedBranchFilter}
                onChange={setSelectedBranchFilter}
                variant="dark"
                themeColor="purple"
                placeholder="Select Clinic Branch"
                options={[
                  { value: 'all', label: 'All Clinic Branches' },
                  ...clinics.map(c => ({
                    value: c.id,
                    label: `${c.name} OPD Desk`
                  }))
                ]}
                className="w-full"
              />
            </div>

            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#5B5588] to-[#6E6B9E] hover:opacity-95 text-white font-heading font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-white/20"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Book Walk-in Patient (Cash)</span>
            </button>
          </div>
        </div>

        {/* METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider">Waiting Queue</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0F4C81]">{pendingQueue.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">Patients waiting in lobby</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-heading font-bold text-emerald-600 uppercase tracking-wider">Inside Consultation</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600">{inProgressQueue.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">Currently with doctor</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-heading font-bold text-purple-600 uppercase tracking-wider">Completed Today</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-purple-600">{completedQueue.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">Finished OPD visits</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition hover:border-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-heading font-bold text-amber-600 uppercase tracking-wider">Active Doctors</p>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-600">{doctors.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">OPD chambers open</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

        </div>

        {/* NAVIGATION TAB PILLS */}
        <div className="bg-slate-200/70 p-1.5 rounded-2xl flex flex-col sm:flex-row w-full sm:w-auto gap-1.5 border border-slate-200">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'queue' 
                ? 'bg-white text-[#5B5588] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-white/50'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Live OPD Queue ({filteredQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'doctors' 
                ? 'bg-white text-[#5B5588] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-white/50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#5B5588] shrink-0" />
            <span>Doctor Chamber Availability</span>
          </button>
        </div>

        {/* LIVE QUEUE VIEW */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">Today's In-Clinic OPD Token Queue</h3>
                <p className="text-xs text-slate-500 font-sans">Real-time status updates and walk-in token details</p>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search token #, patient name or phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-sans border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B5588] transition"
                />
              </div>
            </div>

            {/* MOBILE VIEW: Stacked Cards Per Patient/Token */}
            <div className="block md:hidden space-y-3">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-heading font-extrabold text-slate-700 text-xs">
                    {searchQuery ? `No tokens or patients matched "${searchQuery}".` : 'No Patient Available in queue currently'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "Book Walk-in Patient" to register ground walk-ins.</p>
                </div>
              ) : (
                filteredQueue.map(appt => {
                  const doc = doctors.find(d => d.id === appt.doctorId);
                  return (
                    <div key={appt.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-sm text-[#5B5588] bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
                          #{appt.tokenNumber || 'TK-101'}
                        </span>
                        <div>
                          {appt.status === 'PENDING' || appt.status === 'CONFIRMED' ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Waiting in Lobby
                            </span>
                          ) : appt.status === 'IN_PROGRESS' ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Inside Chamber
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-slate-900 text-sm">{appt.patientName || 'Walk-in Patient'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {appt.patientPhone ? `+91 ${appt.patientPhone}` : 'No Phone'} • {appt.patientGender || 'Male'}, {appt.patientAge || 35} yrs
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Doctor:</span>
                          <span className="font-heading font-bold text-slate-800">{doc ? doc.name : 'Duty Doctor'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Slot:</span>
                          <span className="font-mono text-slate-700 font-medium">{appt.timeSlot}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Payment:</span>
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-md uppercase">
                            Cash Paid (₹{appt.amountPaid || doc?.consultationFeeClinic || 300})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => openPrintModal(appt)}
                          className={`py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-[#5B5588] border border-purple-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-heading font-bold shadow-2xs ${
                            appt.status === 'COMPLETED' ? 'w-full' : 'shrink-0'
                          }`}
                          title="View OPD Pass"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#5B5588]" />
                          <span>View OPD Pass</span>
                        </button>
                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCheckIn(appt.id)}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold shadow-xs transition cursor-pointer text-center"
                          >
                            Call to Chamber
                          </button>
                        )}
                        {appt.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(appt.id)}
                            className="flex-1 py-2.5 bg-[#5B5588] hover:bg-[#484270] text-white rounded-xl text-xs font-heading font-bold shadow-xs transition cursor-pointer text-center"
                          >
                            Finish Visit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DESKTOP / TABLET VIEW: Spacious Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
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
                          <td className="p-4 font-mono font-extrabold text-[#5B5588] text-sm">
                            #{appt.tokenNumber || 'TK-101'}
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
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 animate-pulse">
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
                                className="p-2 bg-purple-50 hover:bg-purple-100 text-[#5B5588] border border-purple-200 rounded-xl transition cursor-pointer shadow-2xs"
                                title="Print / View Token Pass"
                              >
                                <Printer className="w-4 h-4 text-[#5B5588]" />
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
                                  className="px-3 py-1.5 bg-[#5B5588] hover:bg-[#484270] text-white rounded-xl text-xs font-heading font-bold shadow-xs transition cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <img
                      src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR}
                      alt={doc.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200/50 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-extrabold text-base text-slate-900 truncate">{doc.name}</h4>
                      </div>
                      <p className="text-xs text-[#5B5588] font-heading font-bold truncate">{doc.specialization}</p>
                      <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full mt-1">
                        OPD Fee: ₹{doc.consultationFeeClinic || 300}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl text-xs space-y-2.5 border border-slate-100 font-sans mt-4">
                    <div>
                      <p className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider mb-1">Assigned OPD Branches</p>
                      <p className="font-heading font-bold text-slate-800 text-xs leading-relaxed">
                        {formatAssignedBranches(doc.clinicsCovered, clinics)}
                      </p>
                    </div>
                    <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider">Schedule Today</p>
                        <p className="font-medium text-slate-700 text-xs mt-0.5">{doc.opdScheduleSummary || 'OPD Open 09:00 AM - 02:00 PM'}</p>
                      </div>
                      <span className="shrink-0 bg-purple-50 text-[#5B5588] border border-purple-200/80 text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                        Chamber Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* WALK-IN PATIENT CASH REGISTRATION MODAL */}
      {isWalkInModalOpen && createPortal(
        <div className="fixed inset-0 min-h-screen w-screen z-999999 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-fade-in relative z-10">
            
            {/* Fixed Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
              <div className="space-y-1">
                <span className="bg-purple-50 text-[#5B5588] text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-purple-200">
                  FRONT DESK REGISTRATION (CASH)
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#5B5588] shrink-0" />
                  <span>Book Walk-in Patient</span>
                </h3>
              </div>
              <button 
                onClick={() => setIsWalkInModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="walkin-cash-form" onSubmit={handleWalkInSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 text-xs">
              
              {/* TOP SELECTION CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <ThemeSelect
                    label="Hospital Clinic Branch *"
                    value={walkInForm.branchId}
                    onChange={(val) => setWalkInForm({ ...walkInForm, branchId: val })}
                    themeColor="purple"
                    options={clinics.map(c => ({
                      value: c.id,
                      label: `${c.name} (${c.city})`
                    }))}
                  />
                </div>

                <div>
                  <ThemeSelect
                    label="Assign Doctor *"
                    value={walkInForm.doctorId}
                    onChange={(val) => {
                      const doc = doctors.find(d => d.id === val);
                      setWalkInForm({
                        ...walkInForm,
                        doctorId: val,
                        feePaid: doc?.consultationFeeClinic || 300
                      });
                    }}
                    placeholder="Select Duty Doctor"
                    themeColor="purple"
                    options={(availableBranchDoctors.length > 0 ? availableBranchDoctors : doctors).map(d => ({
                      value: d.id,
                      label: `${d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`} (${d.specialization}) - ₹${d.consultationFeeClinic || 300}`
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <ThemeSelect
                    label="Patient Type *"
                    value={walkInForm.patientType}
                    onChange={(val) => setWalkInForm({ ...walkInForm, patientType: val as any })}
                    themeColor="purple"
                    options={[
                      { value: 'NEW', label: 'New Patient (First Visit)' },
                      { value: 'EXISTING', label: 'Existing Registered Patient' }
                    ]}
                  />
                </div>

                <div>
                  <ThemeSelect
                    label="Appointment Time Slot *"
                    value={walkInForm.timeSlot}
                    onChange={(val) => setWalkInForm({ ...walkInForm, timeSlot: val })}
                    themeColor="purple"
                    options={['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => ({
                      value: slot,
                      label: slot
                    }))}
                  />
                </div>
              </div>

              {/* CONDITIONAL PATIENT DETAILS ACCORDING TO PATIENT TYPE */}
              {walkInForm.patientType !== 'NEW' ? (
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
                  <ThemeSelect
                    label={`Select Registered Patient (${walkInForm.doctorId ? "Doctor's Patient List" : 'All Registered Patient Records'})`}
                    value={existingPatientsList.find(p => p.name === walkInForm.patientName)?.id || ''}
                    onChange={(selectedVal) => {
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
                    placeholder="-- Choose Patient from Registered Patients List --"
                    themeColor="purple"
                    options={[
                      { value: '', label: '-- Choose Patient from Registered Patients List --' },
                      ...existingPatientsList.map(p => ({
                        value: p.id,
                        label: `${p.name} (${p.age} Yrs, ${p.gender})`,
                        sublabel: p.phone ? `Phone: +91 ${p.phone}` : undefined
                      }))
                    ]}
                  />

                  {walkInForm.patientName && (
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center justify-between text-xs text-purple-900 font-sans font-medium">
                      <span>Selected Patient: <span className="font-heading font-bold text-slate-900">{walkInForm.patientName}</span> ({walkInForm.patientAge} Yrs, {walkInForm.patientGender} • +91 {walkInForm.patientPhone})</span>
                      <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-heading font-extrabold uppercase">Registered</span>
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
                        placeholder="Enter patient name"
                        className="w-full px-4 py-3 bg-[#5B5588]/5 border border-[#5B5588]/20 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#5B5588] focus:border-[#5B5588] focus:bg-white outline-none transition"
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
                        placeholder="Enter 10-digit mobile number"
                        className="w-full px-4 py-3 bg-[#5B5588]/5 border border-[#5B5588]/20 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#5B5588] focus:border-[#5B5588] focus:bg-white outline-none transition font-mono"
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
                        value={walkInForm.patientAge || ''}
                        onChange={(e) => setWalkInForm({ ...walkInForm, patientAge: e.target.value ? Number(e.target.value) : '' as any })}
                        placeholder="Enter age"
                        className="w-full px-4 py-3 bg-[#5B5588]/5 border border-[#5B5588]/20 rounded-xl font-sans font-medium focus:ring-2 focus:ring-[#5B5588] focus:border-[#5B5588] focus:bg-white outline-none transition"
                      />
                    </div>

                    <div>
                      <ThemeSelect
                        label="Gender"
                        value={walkInForm.patientGender}
                        onChange={(val) => setWalkInForm({ ...walkInForm, patientGender: val as any })}
                        placeholder="Select Gender"
                        showPlaceholderOption={true}
                        themeColor="purple"
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#5B5588]/10 p-4 rounded-2xl border border-[#5B5588]/20 flex items-center justify-between">
                <div>
                  <p className="font-heading font-extrabold text-[#5B5588] text-xs">Payment Collection Mode</p>
                  <p className="text-[11px] text-slate-600 font-sans font-medium">Cash Collected at Reception Counter</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-heading font-bold text-slate-500">In-Clinic Token Fee</span>
                  <p className="text-xl font-heading font-extrabold text-[#5B5588]">₹{walkInForm.feePaid}</p>
                </div>
              </div>

            </form>

            {/* Fixed Modal Footer with Always Reachable Submit Button */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-200/70 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="walkin-cash-form"
                disabled={isFormSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5588] to-[#6E6B9E] hover:opacity-95 text-white font-heading font-extrabold shadow-md shadow-[#5B5588]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition text-xs"
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

          </div>
        </div>,
        document.body
      )}

      {/* PRINTABLE OPD TOKEN RECEIPT MODAL */}
      {printedTokenAppt && createPortal(
        <div className="fixed inset-0 min-h-screen w-screen z-999999 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100 animate-fade-in text-slate-900 font-sans relative z-10">
            <div className="text-center space-y-1 border-b border-slate-200/80 pb-4">
              <span className="bg-[#5B5588]/10 text-[#5B5588] text-[10px] font-heading font-extrabold px-3 py-0.5 rounded-full uppercase border border-[#5B5588]/20">
                OFFICIAL OPD TOKEN RECEIPT
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-1">JANSEVAAROGYAM CLINIC NETWORK</h3>
              <p className="text-xs text-slate-500 font-sans font-medium">{printedTokenAppt.clinicName || 'Sarangpur Branch'}</p>
            </div>

            <div className="bg-gradient-to-r from-[#5B5588] via-[#6E6B9E] to-[#5B5588] text-white p-6 rounded-2xl text-center space-y-1 shadow-md border border-white/10">
              <p className="text-[10px] font-heading font-bold text-purple-100 uppercase tracking-widest">Token Sequence Number</p>
              <p className="text-4xl font-mono font-extrabold text-white tracking-wider">#{printedTokenAppt.tokenNumber || 'TK-101'}</p>
              <p className="text-[11px] text-purple-100/90 font-sans pt-1">Please wait in lobby until your token is called</p>
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
                <span className="font-mono font-medium text-slate-900">{printedTokenAppt.timeSlot} ({String(printedTokenAppt.appointmentDate || '').split('T')[0]})</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Amount Paid (Cash):</span>
                <span className="font-heading font-extrabold text-[#5B5588]">₹{printedTokenAppt.amountPaid || 300} (PAID)</span>
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
                className="px-5 py-2.5 bg-gradient-to-r from-[#5B5588] to-[#6E6B9E] hover:opacity-95 text-white text-xs font-heading font-extrabold rounded-xl shadow-md shadow-[#5B5588]/20 flex items-center gap-2 cursor-pointer transition border border-white/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print OPD Pass</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* HIDDEN PRINT CONTAINER FOR NATIVE BROWSER PRINT DIALOG */}
      {printedTokenAppt && (
        <div id="printable-opd-pass-container" className="hidden print:block font-sans text-slate-900 bg-white p-6 leading-normal max-w-md mx-auto">
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest border border-slate-900 px-2 py-0.5 rounded-full">
              OFFICIAL OPD TOKEN RECEIPT
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">JANSEVAAROGYAM CLINIC NETWORK</h2>
            <p className="text-xs font-bold text-slate-700">{printedTokenAppt.clinicName || 'Sarangpur Hospital Branch'}</p>
            <p className="text-[10px] text-slate-500">24x7 Emergency OPD & Specialist Healthcare Network</p>
          </div>

          <div className="my-6 p-6 border-2 border-slate-900 rounded-2xl text-center space-y-1 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">TOKEN SEQUENCE NUMBER</p>
            <p className="text-5xl font-mono font-black text-slate-900">#{printedTokenAppt.tokenNumber || 'TK-101'}</p>
            <p className="text-xs font-semibold text-slate-600 pt-1">Please wait in the hospital lobby until your token is announced.</p>
          </div>

          <div className="space-y-3 text-xs border border-slate-300 rounded-xl p-4">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Patient Name:</span>
              <span className="font-black text-slate-900 text-sm">{printedTokenAppt.patientName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Patient Age / Gender:</span>
              <span className="font-bold text-slate-900">{printedTokenAppt.patientAge || 30} Yrs / {printedTokenAppt.patientGender || 'Male'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Assigned Doctor:</span>
              <span className="font-bold text-slate-900">{printedTokenAppt.doctorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">OPD Date & Time Slot:</span>
              <span className="font-bold text-slate-900">{printedTokenAppt.timeSlot} ({String(printedTokenAppt.appointmentDate || '').split('T')[0]})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Payment Status:</span>
              <span className="font-black text-[#5B5588]">₹{printedTokenAppt.amountPaid || 300} (CASH PAID)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-600">Registration Mode:</span>
              <span className="font-bold text-slate-800">Front Desk Walk-in Counter</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between text-[10px] text-slate-600">
            <div>
              <p className="font-bold text-slate-800">Jansevarogyam OPD Desk Stamp</p>
              <p>Printed: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Authorized Reception Sign</p>
              <div className="h-6"></div>
              <p className="border-t border-slate-400 pt-0.5">Reception Counter Desk</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
