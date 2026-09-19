import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Stethoscope, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Video, 
  Building2,
  Volume2,
  BookOpen,
  X,
  Clock,
  Loader2,
  ChevronDown,
  FileText,
  ArrowRight,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import { HiPencilSquare, HiTrash, HiPlus } from 'react-icons/hi2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import type { Appointment, PrescriptionItem, MealTiming } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatAssignedBranches } from '../utils/branchUtils';

interface ThemeSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ThemeSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: ThemeSelectOption[];
  placeholder?: string;
  className?: string;
}

const ThemeSelect: React.FC<ThemeSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-emerald-500/50 hover:border-emerald-600 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-left"
      >
        <span className="truncate pr-2">
          {selectedOpt ? selectedOpt.label : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-emerald-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-emerald-200 rounded-2xl shadow-xl py-1.5 max-h-60 overflow-y-auto animate-fade-in divide-y divide-slate-50 min-w-[200px]">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-xs text-left flex items-center justify-between font-bold transition cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50 text-emerald-800 font-black' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                <div className="truncate">
                  <span>{opt.label}</span>
                  {opt.sublabel && <span className="block text-[10px] text-slate-400 font-normal">{opt.sublabel}</span>}
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface DoctorConsoleProps {
  onNavigate?: (tab: string) => void;
}

export const DoctorConsole: React.FC<DoctorConsoleProps> = ({ onNavigate }) => {
  const { 
    appointments, 
    doctors, 
    clinics, 
    currentUser, 
    updateAppointmentStatus, 
    rescheduleAppointment, 
    createPrescription,
    healthBlogs,
    createArticle,
    updateArticle,
    deleteArticle,
    language
  } = useApp();

  // Tab State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'OPD' | 'ARTICLES'>('OPD');

  // OPD Queue & Active Appointment State
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'PENDING' | 'RESCHEDULED' | 'CANCELLED' | 'ALL'>('PENDING');
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(appointments[0] || null);

  React.useEffect(() => {
    if (!activeAppointment && appointments.length > 0) {
      setActiveAppointment(appointments[0]);
    }
  }, [appointments, activeAppointment]);

  // Action Button Loading States
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [announcingTokenId, setAnnouncingTokenId] = useState<string | null>(null);
  const [markingDoneApptId, setMarkingDoneApptId] = useState<string | null>(null);

  // Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [pendingArticleDeleteId, setPendingArticleDeleteId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('General Medicine');
  const [articleReadTime, setArticleReadTime] = useState(5);
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImageUrl, setArticleImageUrl] = useState('');
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState('');
  // Appointment Actions Modal State
  const [pendingCancelApptId, setPendingCancelApptId] = useState<string | null>(null);
  const [rescheduleTargetAppt, setRescheduleTargetAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<string>('10:00 AM');

  // Consultation Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardPatient, setWizardPatient] = useState<Appointment | null>(null);

  const openWizard = (appt?: Appointment) => {
    setWizardPatient(appt || null);
    setWizardStep(appt ? 2 : 1);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardStep(1);
    setWizardPatient(null);
  };

  const fallbackDoctor = {
    id: 'doc-default',
    name: currentUser?.name || 'Dr. Rahul Sharma',
    specialization: (currentUser as any)?.specialization || 'Senior Medical Officer',
    qualification: (currentUser as any)?.qualification || 'MBBS, MD',
    regNumber: (currentUser as any)?.regNumber || 'MP-REG-8821',
    avatarUrl: (currentUser as any)?.avatarUrl || DEFAULT_DOCTOR_AVATAR,
    clinicsCovered: (currentUser as any)?.clinicsCovered || ['sarangpur', 'shujalpur', 'rajgarh']
  };

  const currentDoctor = (currentUser?.role === 'DOCTOR' ? (currentUser as any) : doctors[0]) || fallbackDoctor;

  const handleConfirmCancelAppointment = async () => {
    if (!pendingCancelApptId) return;
    await updateAppointmentStatus(pendingCancelApptId, 'CANCELLED');
    setPendingCancelApptId(null);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTargetAppt || !rescheduleDate || !rescheduleTimeSlot) return;
    setIsRescheduling(true);
    try {
      await rescheduleAppointment(rescheduleTargetAppt.id, rescheduleDate, rescheduleTimeSlot);
      setRescheduleTargetAppt(null);
    } finally {
      setIsRescheduling(false);
    }
  };

  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleTargetAppt(appt);
    setRescheduleDate(appt.appointmentDate || new Date().toISOString().split('T')[0]);
    setRescheduleTimeSlot(appt.timeSlot || '10:00 AM');
  };

  const openCreateArticleModal = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleCategory('General Medicine');
    setArticleReadTime(5);
    setArticleExcerpt('');
    setArticleContent('');
    setArticleImageUrl('');
    setArticleError('');
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (art: any) => {
    setEditingArticleId(art.id);
    setArticleTitle(art.title || '');
    setArticleCategory(art.category || 'General Medicine');
    setArticleReadTime(art.readTimeMinutes || 5);
    setArticleExcerpt(art.excerpt || '');
    setArticleContent(art.content || art.excerpt || '');
    setArticleImageUrl(art.imageUrl || '');
    setArticleError('');
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleExcerpt.trim()) {
      setArticleError('Please fill in Title and Summary Excerpt');
      return;
    }
    if (!articleImageUrl) {
      setArticleError('Mandatory: Please upload a cover image for the article before saving.');
      return;
    }
    setArticleLoading(true);
    setArticleError('');
    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, {
          title: articleTitle,
          category: articleCategory,
          readTimeMinutes: Number(articleReadTime) || 5,
          excerpt: articleExcerpt,
          content: articleContent,
          imageUrl: articleImageUrl
        });
      } else {
        await createArticle({
          title: articleTitle,
          category: articleCategory,
          readTimeMinutes: Number(articleReadTime) || 5,
          excerpt: articleExcerpt,
          content: articleContent,
          imageUrl: articleImageUrl
        });
      }
      setArticleLoading(false);
      setIsArticleModalOpen(false);
    } catch (err: any) {
      setArticleLoading(false);
      setArticleError(err.message || 'Failed to save article');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDeleteArticle = async () => {
    if (!pendingArticleDeleteId) return;
    const id = pendingArticleDeleteId;
    setPendingArticleDeleteId(null);
    try {
      await deleteArticle(id);
    } catch (err: any) {
      setArticleError(err.message || 'Failed to delete article');
    }
  };

  // Prescription Form State (Rx Engine)
  const [diagnosis, setDiagnosis] = useState<string>('Type-2 Diabetes Mellitus with Mild Hypertension');
  const [symptomsInput, setSymptomsInput] = useState<string>('Fatigue, Post-prandial hyperglycemia');
  const [clinicalNotes, setClinicalNotes] = useState<string>('BP: 130/84 mmHg, Pulse: 76 bpm. Patient advised low-carb diet and regular walking.');
  const [investigationsInput, setInvestigationsInput] = useState<string>('HbA1c, Serum Creatinine');
  const [adviceInput, setAdviceInput] = useState<string>('30 mins morning walk daily. Avoid refined sugars.');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>('2026-09-30');

  // Medicine List
  const [medicineItems, setMedicineItems] = useState<PrescriptionItem[]>([
    {
      id: 'm1',
      medicineName: 'Tab. Metformin HCl SR',
      dosage: '500 mg',
      frequency: '1-0-1',
      durationDays: 30,
      timing: 'AFTER_MEAL',
      timeOfDay: { morning: true, afternoon: false, night: true },
      specialInstructions: 'Take after breakfast and dinner.'
    },
    {
      id: 'm2',
      medicineName: 'Tab. Telmisartan',
      dosage: '40 mg',
      frequency: '1-0-0',
      durationDays: 30,
      timing: 'BEFORE_MEAL',
      timeOfDay: { morning: true, afternoon: false, night: false },
      specialInstructions: 'Take early morning.'
    }
  ]);

  // Temporary item form
  const [medName, setMedName] = useState<string>('');
  const [medDosage, setMedDosage] = useState<string>('500 mg');
  const [medFreq, setMedFreq] = useState<string>('1-0-1');
  const [medDays, setMedDays] = useState<number>(7);
  const [medTiming] = useState<MealTiming>('AFTER_MEAL');
  const [medNote, setMedNote] = useState<string>('');

  const quickMedicines = [
    'Tab. Metformin 500mg', 'Tab. Telmisartan 40mg', 'Tab. Paracetamol 650mg',
    'Cap. Amoxicillin 500mg', 'Tab. Pantoprazole 40mg', 'Syrup Crocin 120mg'
  ];

  // Speech Announcement Simulator for OPD Queue
  const handleAnnounceToken = (appt: Appointment) => {
    setAnnouncingTokenId(appt.id);
    updateAppointmentStatus(appt.id, 'IN_PROGRESS');
    if ('speechSynthesis' in window) {
      const text = `Token number ${appt.tokenNumber}, ${appt.patientName}, please proceed to ${currentDoctor.name}'s OPD room.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setAnnouncingTokenId(null);
      utterance.onerror = () => setAnnouncingTokenId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setAnnouncingTokenId(null), 1000);
    }
  };

  const handleAddMedicine = () => {
    if (!medName.trim()) return;
    const newItem: PrescriptionItem = {
      id: `m-${Date.now()}`,
      medicineName: medName,
      dosage: medDosage,
      frequency: medFreq,
      durationDays: medDays,
      timing: medTiming,
      timeOfDay: {
        morning: medFreq.startsWith('1'),
        afternoon: medFreq.includes('-1-'),
        night: medFreq.endsWith('1')
      },
      specialInstructions: medNote
    };
    setMedicineItems(prev => [...prev, newItem]);
    setMedName('');
    setMedNote('');
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicineItems(prev => prev.filter(item => item.id !== id));
  };

  // Generate & Download Branded PDF Prescription
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      const patientName = activeAppointment ? activeAppointment.patientName : 'Rameshwar Prasad Yadav';
      const patientAge = activeAppointment ? activeAppointment.patientAge : 54;
      const patientGender = activeAppointment ? activeAppointment.patientGender : 'Male';
      const patientPhone = activeAppointment ? activeAppointment.patientPhone : '9826198261';

      // Header Branding
      doc.setFillColor(11, 37, 69); // Deep Navy #0B2545
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('JANSEVAAROGYAM HEALTHCARE NETWORK', 14, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Sarangpur • Shujalpur • Rajgarh & Virtual Telemedicine OPD', 14, 22);
      doc.text('Emergency Helpline: 1800-JANSEVA-CLINIC | Web: www.jansevaarogyam.com', 14, 27);

      // Doctor info box (Top right)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(currentDoctor.name, 130, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(currentDoctor.qualification, 130, 47);
      doc.text(`Reg No: ${currentDoctor.regNumber}`, 130, 51);
      doc.text(currentDoctor.specialization, 130, 55);

      // Patient info banner
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, 60, 182, 22, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(`Patient Name: ${patientName}`, 18, 67);
      doc.text(`Age/Gender: ${patientAge} Yrs / ${patientGender}`, 18, 73);
      doc.text(`Phone: +91 ${patientPhone}`, 18, 79);

      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 130, 67);
      doc.text(`Token No: ${activeAppointment?.tokenNumber || 'SAR-014'}`, 130, 73);
      doc.text(`Mode: ${activeAppointment?.appointmentMode || 'IN_CLINIC'}`, 130, 79);

      // Clinical Diagnosis & Symptoms
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 37, 69);
      doc.text('CLINICAL DIAGNOSIS & OBSERVATIONS', 14, 90);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Diagnosis: ${diagnosis}`, 14, 97);
      doc.setFont('helvetica', 'normal');
      doc.text(`Clinical Notes: ${clinicalNotes}`, 14, 103);

      // Rx Symbol
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('Rx', 14, 115);

      // Table of Medicines
      const tableData = medicineItems.map((item, index) => [
        (index + 1).toString(),
        item.medicineName,
        item.dosage,
        item.frequency,
        `${item.durationDays} Days`,
        item.timing.replace('_', ' '),
        item.specialInstructions || '-'
      ]);

      autoTable(doc, {
        startY: 120,
        head: [['#', 'Medicine Name', 'Dosage', 'Frequency', 'Duration', 'Timing', 'Instructions']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [11, 37, 69], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 180;

      // Advice & Investigations
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 37, 69);
      doc.text('INVESTIGATIONS ORDERED:', 14, finalY + 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(investigationsInput || 'None', 65, finalY + 10);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 37, 69);
      doc.text('ADVICE & LIFESTYLE:', 14, finalY + 16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(adviceInput || 'None', 65, finalY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 37, 69);
      doc.text('NEXT FOLLOW-UP DATE:', 14, finalY + 22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(nextFollowUpDate || 'As Needed', 65, finalY + 22);

      // Digital Signature Stamp
      doc.setFillColor(240, 253, 244);
      doc.rect(130, finalY + 10, 66, 20, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('DIGITALLY SIGNED & VERIFIED', 134, finalY + 16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(currentDoctor.name, 134, 21 + finalY);
      doc.text(`Reg: ${currentDoctor.regNumber}`, 134, 26 + finalY);

      // Save PDF file locally
      doc.save(`JANSEVAAROGYAM_Rx_${activeAppointment?.tokenNumber || 'SAR014'}.pdf`);

      // Trigger native browser print preview window for isolated prescription container
      setTimeout(() => {
        window.print();
      }, 200);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleSavePrescription = async () => {
    if (!activeAppointment) return;
    setIsSavingPrescription(true);
    try {
      await createPrescription({
        appointmentId: activeAppointment.id,
        patientId: activeAppointment.patientId,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialization: currentDoctor.specialization,
        doctorRegNumber: currentDoctor.regNumber,
        patientName: activeAppointment.patientName,
        patientAge: activeAppointment.patientAge,
        patientGender: activeAppointment.patientGender,
        patientPhone: activeAppointment.patientPhone,
        clinicName: activeAppointment.clinicName,
        diagnosis,
        symptoms: symptomsInput.split(',').map(s => s.trim()),
        clinicalNotes,
        investigationsOrdered: [investigationsInput],
        adviceList: [adviceInput],
        items: medicineItems,
        nextFollowUpDate
      });
      handleExportPdf();
    } catch (err) {
      console.error('Prescription save error:', err);
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const handleMarkDone = async (apptId: string) => {
    setMarkingDoneApptId(apptId);
    try {
      await updateAppointmentStatus(apptId, 'COMPLETED');
      const targetAppt = appointments.find(a => a.id === apptId) || activeAppointment;
      if (targetAppt) {
        try {
          await createPrescription({
            appointmentId: targetAppt.id,
            patientId: targetAppt.patientId,
            doctorId: currentDoctor.id,
            doctorName: currentDoctor.name,
            doctorSpecialization: currentDoctor.specialization,
            doctorRegNumber: currentDoctor.regNumber,
            patientName: targetAppt.patientName,
            patientAge: targetAppt.patientAge,
            patientGender: targetAppt.patientGender,
            patientPhone: targetAppt.patientPhone,
            clinicName: targetAppt.clinicName,
            diagnosis,
            symptoms: symptomsInput.split(',').map(s => s.trim()).filter(Boolean),
            clinicalNotes,
            investigationsOrdered: [investigationsInput].filter(Boolean),
            adviceList: [adviceInput].filter(Boolean),
            items: medicineItems,
            nextFollowUpDate
          });
          handleExportPdf();
        } catch (rxErr) {
          console.warn('Auto-prescription dispatch warning:', rxErr);
        }
      }
    } finally {
      setMarkingDoneApptId(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (selectedQueueFilter === 'PENDING') return a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS';
    if (selectedQueueFilter === 'RESCHEDULED') return (a.status as string) === 'RESCHEDULED' || a.isRescheduled;
    if (selectedQueueFilter === 'CANCELLED') return a.status === 'CANCELLED';
    if (selectedQueueFilter === 'ALL') return true;
    return true;
  });

  // Section 11: Doctor Panel full historical patient list across all statuses
  const doctorHistoricalPatients = React.useMemo(() => {
    const map = new Map<string, Appointment>();
    (appointments || []).forEach(a => {
      if (a.patientName && a.patientName !== 'Patient') {
        const key = `${a.patientName.toLowerCase().trim()}_${a.patientAge || ''}_${(a.patientPhone || '').trim()}`;
        if (!map.has(key)) {
          map.set(key, a);
        }
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* Doctor Console Top Header - Deep Forest Green Brand Gradient (#0B3D2E -> #0A2E22) */}
      <div className="bg-gradient-to-r from-[#0B3D2E] via-[#0A2E22] to-[#0B3D2E] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="flex items-center gap-4">
          <img 
            src={currentDoctor.avatarUrl || DEFAULT_DOCTOR_AVATAR} 
            alt={currentDoctor.name} 
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">{currentDoctor.name}</h2>
              <span className="bg-[rgba(255,255,255,0.15)] border border-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                {language === 'en' ? 'DOCTOR PORTAL' : 'डॉक्टर पोर्टल'}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">{currentDoctor.specialization}</p>
            <p className="text-[11px] text-emerald-100/80 mt-0.5">
              Reg: {currentDoctor.regNumber} • {language === 'en' ? 'Assigned Branches:' : 'शाखाएं:'} {formatAssignedBranches(currentDoctor.clinicsCovered, clinics)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full lg:w-auto">
          <div className="grid grid-cols-2 w-full sm:w-auto p-1.5 gap-1.5 bg-[rgba(255,255,255,0.15)] rounded-2xl border border-white/20 text-xs font-bold font-heading backdrop-blur-md">
            <button
              onClick={() => setActiveConsoleTab('OPD')}
              className={`w-full flex items-center justify-center py-2 px-3 sm:px-4 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
                activeConsoleTab === 'OPD' ? 'bg-gradient-to-r from-[#0B7A56] to-[#0F9D6D] text-white shadow-md font-extrabold border border-white/20' : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{language === 'en' ? 'OPD & Queue' : 'ओपीडी एवं कतार'}</span>
            </button>
            <button
              onClick={() => setActiveConsoleTab('ARTICLES')}
              className={`w-full flex items-center justify-center py-2 px-3 sm:px-4 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
                activeConsoleTab === 'ARTICLES' ? 'bg-gradient-to-r from-[#0B7A56] to-[#0F9D6D] text-white shadow-md font-extrabold border border-white/20' : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{language === 'en' ? 'My Health Articles' : 'मेरे स्वास्थ्य लेख'}</span>
            </button>
          </div>

          {/* Stats Box - Equal 3-column Grid with Evenly Distributed Spacing */}
          <div className="grid grid-cols-3 w-full sm:w-auto bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 text-xs font-sans backdrop-blur-md">
            <div className="text-center px-2 sm:px-4 py-0.5 border-r border-white/20 flex flex-col items-center justify-center">
              <p className="text-lg font-heading font-extrabold text-amber-300 leading-none mb-1">{appointments.length}</p>
              <p className="text-[10px] text-slate-300 whitespace-nowrap">{language === 'en' ? 'Total Today' : 'आज के कुल'}</p>
            </div>
            <div className="text-center px-2 sm:px-4 py-0.5 border-r border-white/20 flex flex-col items-center justify-center">
              <p className="text-lg font-heading font-extrabold text-emerald-400 leading-none mb-1">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </p>
              <p className="text-[10px] text-slate-300 whitespace-nowrap">{language === 'en' ? 'Completed' : 'पूर्ण हुए'}</p>
            </div>
            <div className="text-center px-2 sm:px-4 py-0.5 flex flex-col items-center justify-center">
              <p className="text-lg font-heading font-extrabold text-sky-300 leading-none mb-1">
                {appointments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED').length}
              </p>
              <p className="text-[10px] text-slate-300 whitespace-nowrap">{language === 'en' ? 'In Queue' : 'कतार में'}</p>
            </div>
          </div>
        </div>
      </div>

      {activeConsoleTab === 'ARTICLES' ? (
        /* ARTICLES & PUBLICATIONS MANAGEMENT TAB */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {language === 'en' ? 'Doctor Knowledge Base' : 'चिकित्सा ज्ञान केंद्र'}
              </span>
              <h3 className="text-2xl font-heading font-extrabold text-slate-900 mt-2">
                {language === 'en' ? 'Health Articles & Medical Advice' : 'स्वास्थ्य लेख एवं चिकित्सा सलाह'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {language === 'en' 
                  ? 'Publish medical insights, health guidance, and seasonal disease advice for your patients.'
                  : 'अपने मरीजों के लिए चिकित्सा मार्गदर्शन और स्वास्थ्य सलाह प्रकाशित करें।'}
              </p>
            </div>
            <button
              onClick={openCreateArticleModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
            >
              <HiPlus className="w-4 h-4 text-white stroke-[0.5]" />
              <span>{language === 'en' ? 'Add New Article' : 'नया लेख जोड़ें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthBlogs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-heading font-bold text-slate-800 text-sm">No Health Articles Published Yet</p>
                <p className="text-xs text-slate-500 mt-1">Click "Add New Article" above to share medical advice with patients.</p>
              </div>
            ) : (
              healthBlogs.map(art => (
                <div key={art.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={art.imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600'}
                        alt={art.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#0B2545] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>{art.date}</span>
                        <span>{art.readTimeMinutes} min read</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-slate-900 text-base leading-snug">{art.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{art.excerpt}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditArticleModal(art)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#0F4C81] font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <HiPencilSquare className="w-4 h-4 text-[#0F4C81]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPendingArticleDeleteId(art.id)}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center group/del"
                      title="Delete Article"
                    >
                      <HiTrash className="w-4 h-4 text-rose-600 group-hover/del:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* OPD & QUEUE & RX ENGINE TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Live Queue Manager */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 flex flex-col min-h-[400px] max-h-[85vh]">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F4C81]" />
              <span>Live Patient Queue</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time Sync</span>
          </div>

          {/* Queue Filter Buttons (Section 8: Pending, Rescheduled, Cancelled, All) */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1.5 rounded-2xl text-[10px] sm:text-[11px] font-heading font-bold shrink-0">
            {[
              { id: 'PENDING', label: 'Pending' },
              { id: 'RESCHEDULED', label: 'Reschd.' },
              { id: 'CANCELLED', label: 'Cancelled' },
              { id: 'ALL', label: 'All' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedQueueFilter(f.id as any)}
                className={`py-1.5 rounded-xl transition cursor-pointer text-center truncate ${
                  selectedQueueFilter === f.id ? 'bg-white text-[#0F4C81] shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Patient Queue Cards */}
          <div className="space-y-3 overflow-y-auto grow pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="font-heading font-bold text-slate-700 text-xs">
                  No Appointments under {selectedQueueFilter}
                </p>
              </div>
            ) : (
              filteredAppointments.map(appt => (
              <div
                key={appt.id}
                onClick={() => setActiveAppointment(appt)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  activeAppointment?.id === appt.id 
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20' 
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#0F4C81]">
                    {appt.tokenNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80' :
                    appt.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-800 border border-teal-200/80' :
                    (appt.status as string) === 'RESCHEDULED' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' :
                    appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border border-rose-200/80' :
                    'bg-sky-100 text-sky-800 border border-sky-200/80'
                  }`}>
                    {appt.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900">{appt.patientName || 'Patient'}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {appt.patientAge ? `${appt.patientAge} Yrs` : 'Age N/A'} 
                    {appt.patientGender ? ` • ${appt.patientGender}` : ''} 
                    {appt.patientPhone ? ` • +91 ${appt.patientPhone}` : ''}
                  </p>
                </div>

                {/* Section 7.2: Rescheduled Date Display */}
                {((appt.status as string) === 'RESCHEDULED' || (appt as any).rescheduledFrom) && (
                  <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Rescheduled to {new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ({appt.timeSlot})</span>
                  </div>
                )}

                {/* Section 4: Cancellation Visibility */}
                {appt.status === 'CANCELLED' && (
                  <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>This patient cancelled his booking</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium truncate max-w-[55%]">
                    {appt.appointmentMode === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />}
                    <span className="truncate">{appt.clinicName}</span>
                  </span>
                  <span className="font-bold text-slate-700 shrink-0 text-right">
                    {new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {appt.timeSlot}
                  </span>
                </div>

                {/* Section 9.1: Doctor Confirmation Prompt (Yes / No) for Pending Appointments */}
                {appt.status === 'PENDING' && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-black text-amber-900">Confirm Appointment?</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'CONFIRMED'); }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition shadow-xs cursor-pointer"
                      >
                        Yes (Confirm)
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'CANCELLED'); }}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-lg text-xs transition shadow-xs cursor-pointer"
                      >
                        No (Cancel)
                      </button>
                    </div>
                  </div>
                )}

                {/* Video start consultation button */}
                {appt.appointmentMode === 'VIDEO' && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAppointmentStatus(appt.id, 'IN_PROGRESS');
                      if (onNavigate) {
                        onNavigate('telemedicine');
                      } else {
                        window.location.href = '/telemedicine';
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Video className="w-4 h-4 animate-pulse" />
                    <span>Start Video Call</span>
                  </button>
                )}

                {/* In-clinic Start Consultation wizard button for CONFIRMED / IN_PROGRESS */}
                {appt.appointmentMode !== 'VIDEO' && (appt.status === 'CONFIRMED' || appt.status === 'IN_PROGRESS') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openWizard(appt); }}
                    className="w-full bg-gradient-to-r from-[#0B1F3A] to-[#0F4C81] hover:opacity-90 text-white font-heading font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Start Consultation</span>
                  </button>
                )}

                {/* Section 9.2 & 10: Doctor Status Action Buttons (Confirmed, Rescheduled, Cancelled, Completed) */}
                {appt.status !== 'PENDING' && (
                  <div className="pt-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAnnounceToken(appt); }}
                        disabled={announcingTokenId === appt.id}
                        className="flex-1 bg-[#0F4C81] hover:bg-[#0B2545] text-white py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
                        title="Audio OPD Announcement"
                      >
                        {announcingTokenId === appt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Call Token</span>
                      </button>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkDone(appt.id); }}
                        disabled={markingDoneApptId === appt.id || appt.status === 'COMPLETED'}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
                      >
                        {markingDoneApptId === appt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Mark Completed</span>
                        )}
                      </button>
                    </div>

                    {appt.status !== 'CANCELLED' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openRescheduleModal(appt); }} 
                          className="flex-1 rounded-xl bg-amber-50 hover:bg-amber-100 py-1.5 text-[10px] font-bold text-amber-800 transition cursor-pointer border border-amber-200"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPendingCancelApptId(appt.id); }} 
                          className="flex-1 rounded-xl bg-rose-50 hover:bg-rose-100 py-1.5 text-[10px] font-bold text-rose-700 transition cursor-pointer border border-rose-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )))}
          </div>
        </div>

        {/* Right Col: Digital Prescription Pad (Rx Creator) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          
          {/* Active Patient Details Banner with Patient Selector */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#0F4C81] text-lg">{activeAppointment?.tokenNumber || 'TK-001'}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeAppointment?.patientType || 'PATIENT'}
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-1">
                {activeAppointment?.patientName || 'Select Patient from Queue'}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {activeAppointment?.patientAge ? `${activeAppointment.patientAge} Yrs` : ''} 
                {activeAppointment?.patientGender ? ` • ${activeAppointment.patientGender}` : ''} 
                {activeAppointment?.patientPhone ? ` • Phone: +91 ${activeAppointment.patientPhone}` : ''}
              </p>

              {/* Section 3: Voice Note Audio Player */}
              {(activeAppointment?.voiceNoteUrl || (activeAppointment as any)?.audioUrl) && activeAppointment && (
                <div className="mt-3 p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 max-w-sm">
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <audio src={activeAppointment.voiceNoteUrl || (activeAppointment as any).audioUrl} controls className="h-7 grow" />
                </div>
              )}

              {/* Section 3: Uploaded Documents */}
              {((activeAppointment?.documents && activeAppointment.documents.length > 0) || (activeAppointment as any)?.documentUrl) && activeAppointment && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(activeAppointment.documents || [(activeAppointment as any).documentUrl]).map((docUrl: any, idx: number) => {
                    const urlStr = typeof docUrl === 'string' ? docUrl : docUrl?.url || '';
                    if (!urlStr) return null;
                    return (
                      <a
                        key={idx}
                        href={urlStr}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-sky-100 text-[#0F4C81] hover:underline font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-sky-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Document #{idx + 1}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 11: Select Doctor's Registered Patient Dropdown */}
            <div className="w-full sm:w-auto">
              <ThemeSelect
                label="Select Patient:"
                value={activeAppointment?.id || ''}
                onChange={(val) => {
                  const found = appointments.find(a => a.id === val);
                  if (found) setActiveAppointment(found);
                }}
                placeholder="-- Doctor's Registered Patients List --"
                options={[
                  { value: '', label: "-- Doctor's Registered Patients List --" },
                  ...doctorHistoricalPatients.map(a => ({
                    value: a.id,
                    label: `${a.patientName || 'Patient'}${a.patientAge ? ` (${a.patientAge} Yrs` : ''}${a.patientGender ? `, ${a.patientGender})` : ')'}`,
                    sublabel: a.patientPhone ? `Phone: +91 ${a.patientPhone}` : undefined
                  }))
                ]}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          {/* Rx Pad Sections */}
          <div className="space-y-6">
            
            {/* Diagnosis & Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type-2 Diabetes Mellitus"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Symptoms & Complaints
                </label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g. Fatigue, High sugar levels"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Quick Medicine Pill Tagger */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Medicine Autocomplete
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickMedicines.map(qm => (
                  <button
                    key={qm}
                    type="button"
                    onClick={() => setMedName(qm)}
                    className="text-[11px] bg-slate-100 hover:bg-[#0F4C81] hover:text-white px-3 py-1 rounded-lg font-medium text-slate-700 transition cursor-pointer"
                  >
                    + {qm}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Autocomplete & Add Block */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
                <span>Prescribed Medicines (Rx)</span>
              </h4>

              {/* Add Medicine Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Search e.g. Metformin"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ThemeSelect
                    label="Frequency"
                    value={medFreq}
                    onChange={setMedFreq}
                    options={[
                      { value: '1-0-1', label: '1-0-1 (Morning & Night)' },
                      { value: '1-0-0', label: '1-0-0 (Morning Only)' },
                      { value: '0-0-1', label: '0-0-1 (Night Only)' },
                      { value: '1-1-1', label: '1-1-1 (Thrice Daily)' },
                      { value: 'Once Weekly', label: 'Once Weekly' }
                    ]}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Days</label>
                  <input
                    type="number"
                    value={medDays}
                    onChange={(e) => setMedDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="w-full bg-[#0F4C81] hover:bg-[#0B2545] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Added Medicines Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200/80">
                    <tr>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Timing</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicineItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.medicineName}</td>
                        <td className="p-3 text-slate-600">{item.dosage}</td>
                        <td className="p-3 font-mono font-bold text-[#0F4C81]">{item.frequency}</td>
                        <td className="p-3 text-slate-600">{item.durationDays} Days</td>
                        <td className="p-3 text-slate-600">{item.timing.replace('_', ' ')}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveMedicine(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice & Clinical Notes & Investigations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Investigations Ordered
                </label>
                <textarea
                  rows={2}
                  value={investigationsInput}
                  onChange={(e) => setInvestigationsInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Examination Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Advice & Lifestyle
                </label>
                <textarea
                  rows={2}
                  value={adviceInput}
                  onChange={(e) => setAdviceInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Follow-up Date */}
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl">
              <span className="text-xs font-bold text-emerald-900">Next Scheduled Follow-up Date:</span>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Bottom Action Bar (Sign & Issue Rx) */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="text-xs text-slate-600 font-medium">
                Ready to issue prescription for <span className="font-heading font-extrabold text-slate-900">{activeAppointment?.patientName || 'Patient'}</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSavePrescription}
                  disabled={isSavingPrescription}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isSavingPrescription ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing & Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sign & Issue Rx</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
      )}

      {/* ===== CONSULTATION WIZARD MODAL ===== */}
      {wizardOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] my-auto overflow-hidden">

            {/* Wizard Header */}
            <div className="bg-gradient-to-r from-[#0B1F3A] to-[#0F4C81] text-white px-5 sm:px-7 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg leading-tight">
                    {language === 'en' ? 'Patient Consultation' : 'रोगी परामर्श'}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {language === 'en'
                      ? `Step ${wizardStep} of 3 — ${wizardStep === 1 ? 'Select Patient' : wizardStep === 2 ? 'Diagnosis & Medicines' : 'Prescription Review'}`
                      : `चरण ${wizardStep} / 3`}
                  </p>
                </div>
              </div>
              <button onClick={closeWizard} className="p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-0 px-5 sm:px-7 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
              {[
                { n: 1, label: language === 'en' ? 'Select Patient' : 'रोगी चुनें' },
                { n: 2, label: language === 'en' ? 'Diagnosis & Rx' : 'निदान और दवाएं' },
                { n: 3, label: language === 'en' ? 'Review & Sign' : 'समीक्षा करें' },
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className={`flex items-center gap-1.5 ${wizardStep === s.n ? 'opacity-100' : wizardStep > s.n ? 'opacity-70' : 'opacity-35'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${wizardStep >= s.n ? 'bg-[#0F4C81] text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {wizardStep > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 hidden sm:block">{s.label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200 mx-1.5" />}
                </React.Fragment>
              ))}
            </div>

            {/* Wizard Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">

              {/* ---- STEP 1: Select Confirmed Patient ---- */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'en'
                      ? 'Select a confirmed patient from the queue to start consultation.'
                      : 'परामर्श शुरू करने के लिए कतार से एक पुष्टिकृत रोगी चुनें।'}
                  </p>
                  <div className="space-y-2">
                    {filteredAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS').length === 0 ? (
                      <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">
                          {language === 'en' ? 'No confirmed patients in queue.' : 'कतार में कोई पुष्टिकृत रोगी नहीं है।'}
                        </p>
                      </div>
                    ) : (
                      filteredAppointments
                        .filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
                        .map(appt => (
                          <button
                            key={appt.id}
                            onClick={() => { setWizardPatient(appt); setWizardStep(2); }}
                            className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                              wizardPatient?.id === appt.id
                                ? 'border-[#0F4C81] bg-sky-50/60 ring-2 ring-[#0F4C81]/20'
                                : 'border-slate-200 hover:border-[#0F4C81]/40 bg-white hover:bg-sky-50/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white font-black text-sm flex items-center justify-center shrink-0">
                                {appt.tokenNumber?.replace(/[^0-9]/g, '').slice(-2) || '—'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-heading font-extrabold text-sm text-slate-900 truncate">{appt.patientName || 'Patient'}</p>
                                <p className="text-xs text-slate-500 font-medium">
                                  {appt.patientAge ? `${appt.patientAge} Yrs` : ''}{appt.patientGender ? ` • ${appt.patientGender}` : ''} • {appt.timeSlot}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${appt.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-800' : 'bg-sky-100 text-sky-800'}`}>
                                {appt.status}
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#0F4C81] opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* ---- STEP 2: Diagnosis, Symptoms & Medicines ---- */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  {/* Selected Patient mini-banner */}
                  {wizardPatient && (
                    <div className="bg-[#0B1F3A]/5 border border-[#0F4C81]/20 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0B1F3A] text-white font-black text-xs flex items-center justify-center shrink-0">
                        {wizardPatient.tokenNumber?.replace(/[^0-9]/g, '').slice(-2) || '—'}
                      </div>
                      <div>
                        <p className="font-heading font-extrabold text-sm text-slate-900">{wizardPatient.patientName}</p>
                        <p className="text-xs text-slate-500">{wizardPatient.patientAge ? `${wizardPatient.patientAge} Yrs` : ''}{wizardPatient.patientGender ? ` • ${wizardPatient.patientGender}` : ''}</p>
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'en' ? 'Clinical Diagnosis' : 'नैदानिक निदान'}
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      placeholder="e.g. Type-2 Diabetes Mellitus"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/30 focus:border-[#0F4C81]/50 transition"
                    />
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'en' ? 'Symptoms & Complaints' : 'लक्षण एवं शिकायतें'}
                    </label>
                    <input
                      type="text"
                      value={symptomsInput}
                      onChange={e => setSymptomsInput(e.target.value)}
                      placeholder="e.g. Fatigue, high sugar, frequent urination"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/30 focus:border-[#0F4C81]/50 transition"
                    />
                  </div>

                  {/* Quick Medicine Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {language === 'en' ? 'Quick Add Medicine' : 'त्वरित दवा जोड़ें'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickMedicines.map(qm => (
                        <button
                          key={qm}
                          type="button"
                          onClick={() => setMedName(qm)}
                          className="text-[11px] bg-slate-100 hover:bg-[#0F4C81] hover:text-white px-3 py-1.5 rounded-lg font-medium text-slate-700 transition cursor-pointer"
                        >
                          + {qm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Medicine Form */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-[#0F4C81]" />
                      <span>{language === 'en' ? 'Add Medicine' : 'दवा जोड़ें'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'en' ? 'Medicine Name' : 'दवा का नाम'}
                        </label>
                        <input
                          type="text"
                          value={medName}
                          onChange={e => setMedName(e.target.value)}
                          placeholder="e.g. Tab. Metformin 500mg"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'en' ? 'Dosage' : 'खुराक'}
                        </label>
                        <input
                          type="text"
                          value={medDosage}
                          onChange={e => setMedDosage(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'en' ? 'Frequency' : 'आवृत्ति'}
                        </label>
                        <select
                          value={medFreq}
                          onChange={e => setMedFreq(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="1-0-1">1-0-1 (Morning & Night)</option>
                          <option value="1-0-0">1-0-0 (Morning Only)</option>
                          <option value="0-0-1">0-0-1 (Night Only)</option>
                          <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                          <option value="Once Weekly">Once Weekly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'en' ? 'Duration (Days)' : 'अवधि (दिन)'}
                        </label>
                        <input
                          type="number"
                          value={medDays}
                          onChange={e => setMedDays(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="w-full bg-[#0F4C81] hover:bg-[#0B2545] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'en' ? 'Add to Prescription' : 'प्रिस्क्रिप्शन में जोड़ें'}</span>
                    </button>
                  </div>

                  {/* Medicine List */}
                  {medicineItems.length > 0 && (
                    <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
                      <table className="w-full text-left text-xs min-w-[420px]">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200/80">
                          <tr>
                            <th className="p-2.5">Medicine</th>
                            <th className="p-2.5">Dosage</th>
                            <th className="p-2.5">Freq.</th>
                            <th className="p-2.5">Days</th>
                            <th className="p-2.5 text-right">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {medicineItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900 max-w-[140px] truncate">{item.medicineName}</td>
                              <td className="p-2.5 text-slate-600">{item.dosage}</td>
                              <td className="p-2.5 font-mono font-bold text-[#0F4C81]">{item.frequency}</td>
                              <td className="p-2.5 text-slate-600">{item.durationDays}d</td>
                              <td className="p-2.5 text-right">
                                <button onClick={() => handleRemoveMedicine(item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ---- STEP 3: Prescription Review + Follow-up Date ---- */}
              {wizardStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="font-heading font-extrabold text-sm text-emerald-900">
                        {language === 'en' ? 'Prescription Preview' : 'प्रिस्क्रिप्शन पूर्वावलोकन'}
                      </h4>
                    </div>

                    {/* Patient */}
                    <div className="bg-white border border-emerald-100 rounded-xl p-3 text-xs space-y-1">
                      <p className="font-extrabold text-slate-900">{wizardPatient?.patientName || activeAppointment?.patientName || '—'}</p>
                      <p className="text-slate-500">{wizardPatient?.patientAge ? `${wizardPatient.patientAge} Yrs` : ''}{wizardPatient?.patientGender ? ` • ${wizardPatient.patientGender}` : ''}</p>
                    </div>

                    {/* Diagnosis */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Diagnosis</p>
                      <p className="text-xs text-slate-800 font-medium bg-white border border-emerald-100 rounded-lg p-2.5">{diagnosis || '—'}</p>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Symptoms</p>
                      <p className="text-xs text-slate-800 font-medium bg-white border border-emerald-100 rounded-lg p-2.5">{symptomsInput || '—'}</p>
                    </div>

                    {/* Medicines */}
                    {medicineItems.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          Rx — {medicineItems.length} Medicine{medicineItems.length > 1 ? 's' : ''}
                        </p>
                        <div className="bg-white border border-emerald-100 rounded-lg overflow-hidden">
                          {medicineItems.map((item, idx) => (
                            <div key={item.id} className={`px-3 py-2 text-xs ${idx % 2 === 0 ? '' : 'bg-slate-50'}`}>
                              <span className="font-bold text-slate-900">{item.medicineName}</span>
                              <span className="text-slate-500 ml-2">{item.dosage} • {item.frequency} • {item.durationDays} Days</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50 border border-sky-200 p-4 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-sky-900">
                        {language === 'en' ? 'Next Follow-up Date' : 'अगली फॉलो-अप तारीख'}
                      </p>
                      <p className="text-[11px] text-sky-700 mt-0.5">
                        {language === 'en' ? 'Optional — leave blank if not required' : 'वैकल्पिक — यदि आवश्यक न हो तो खाली छोड़ें'}
                      </p>
                    </div>
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={e => setNextFollowUpDate(e.target.value)}
                      className="px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-400 w-full sm:w-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer — Next / Back / Submit */}
            <div className="px-5 sm:px-7 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (wizardStep === 1) closeWizard();
                  else setWizardStep((prev) => (prev - 1) as 1 | 2 | 3);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{wizardStep === 1 ? (language === 'en' ? 'Cancel' : 'रद्द करें') : (language === 'en' ? 'Back' : 'वापस')}</span>
              </button>

              {wizardStep < 3 ? (
                <button
                  onClick={() => {
                    if (wizardStep === 1 && !wizardPatient) return;
                    if (wizardStep === 1 && wizardPatient) { setActiveAppointment(wizardPatient); }
                    setWizardStep((prev) => (prev + 1) as 2 | 3);
                  }}
                  disabled={wizardStep === 1 && !wizardPatient}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#0F4C81] hover:opacity-90 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{language === 'en' ? 'Next' : 'आगे'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (wizardPatient) setActiveAppointment(wizardPatient);
                    await handleSavePrescription();
                    closeWizard();
                  }}
                  disabled={isSavingPrescription}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-75"
                >
                  {isSavingPrescription ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'en' ? 'Saving...' : 'सहेजा जा रहा है...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'en' ? 'Sign & Issue Rx' : 'हस्ताक्षर करें और जारी करें'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE PUBLISH / EDIT MODAL */}
      {isArticleModalOpen && createPortal(
        <div className="fixed inset-0 min-h-screen w-screen bg-slate-900/60 backdrop-blur-md z-999999 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 sm:space-y-5 animate-fade-in font-sans max-h-[92vh] overflow-y-auto my-auto relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-extrabold text-slate-900 text-lg">
                  {editingArticleId ? 'Edit Health Article' : 'Add New Health Article'}
                </h3>
              </div>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {articleError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl">
                {articleError}
              </div>
            )}

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="e.g. Managing Hypertension and BP Control in Summers"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <ThemeSelect
                    label="Specialty Category"
                    value={articleCategory}
                    onChange={setArticleCategory}
                    options={[
                      { value: 'General Medicine', label: 'General Medicine' },
                      { value: 'Pediatrics', label: 'Pediatrics' },
                      { value: 'Orthopedics', label: 'Orthopedics' },
                      { value: 'Gynecology', label: 'Gynecology' },
                      { value: 'Cardiology', label: 'Cardiology' },
                      { value: 'Diabetes & Metabolic', label: 'Diabetes & Metabolic' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                    Estimated Read Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={articleReadTime}
                    onChange={(e) => setArticleReadTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  Short Excerpt / Summary *
                </label>
                <input
                  type="text"
                  value={articleExcerpt}
                  onChange={(e) => setArticleExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence preview for patient cards..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  Full Medical Article Content
                </label>
                <textarea
                  rows={4}
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  placeholder="Detailed health recommendations, precautions, and dietary guidance..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  Upload Cover Image <span className="text-emerald-600 font-extrabold">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                  />
                  {articleImageUrl && (
                    <img
                      src={articleImageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shrink-0 shadow-xs"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={articleLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {articleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingArticleId ? 'Save Changes' : 'Publish Article'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ARTICLE DELETE CONFIRMATION POPUP MODAL */}
      <ConfirmDialog
        open={!!pendingArticleDeleteId}
        title="Delete Health Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmLabel="Yes, Delete Article"
        onConfirm={confirmDeleteArticle}
        onCancel={() => setPendingArticleDeleteId(null)}
      />

      {/* APPOINTMENT CANCEL CONFIRMATION POPUP MODAL */}
      <ConfirmDialog
        open={!!pendingCancelApptId}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action will notify the patient."
        confirmLabel="Yes, Cancel Appointment"
        onConfirm={handleConfirmCancelAppointment}
        onCancel={() => setPendingCancelApptId(null)}
      />

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {rescheduleTargetAppt && createPortal(
        <div className="fixed inset-0 min-h-screen w-screen bg-slate-900/60 backdrop-blur-md z-999999 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-in font-sans relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-base">Reschedule Appointment</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {rescheduleTargetAppt.patientName || 'Patient'} ({rescheduleTargetAppt.tokenNumber || 'Token'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleTargetAppt(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  New Appointment Date *
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <ThemeSelect
                  label="New Time Slot *"
                  value={rescheduleTimeSlot}
                  onChange={setRescheduleTimeSlot}
                  options={['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => ({
                    value: slot,
                    label: slot
                  }))}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleTargetAppt(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0B2545] text-white font-heading font-extrabold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isRescheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rescheduling...</span>
                    </>
                  ) : (
                    <span>Confirm Reschedule</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* HIDDEN PRINT CONTAINER FOR NATIVE BROWSER PRINT DIALOG */}
      <div id="printable-rx-container" className="hidden print:block font-sans text-slate-900 bg-white p-6 leading-normal">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-[#0B3D2E] via-[#0A2E22] to-[#0B3D2E] text-white p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-extrabold tracking-tight">JANSEVAAROGYAM HEALTHCARE NETWORK</h1>
            <p className="text-xs text-emerald-200 mt-1">Sarangpur • Shujalpur • Rajgarh & Virtual Telemedicine OPD</p>
            <p className="text-[10px] text-emerald-100/80">Emergency Helpline: 1800-JANSEVA-CLINIC | www.jansevaarogyam.com</p>
          </div>
          <div className="text-right">
            <h3 className="font-heading font-extrabold text-sm text-white">{currentDoctor.name}</h3>
            <p className="text-xs text-emerald-200">{currentDoctor.qualification}</p>
            <p className="text-[10px] text-emerald-100/80">Reg: {currentDoctor.regNumber} • {currentDoctor.specialization}</p>
          </div>
        </div>

        {/* Patient Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 flex items-center justify-between text-xs font-medium">
          <div className="space-y-1">
            <p><strong>Patient Name:</strong> {activeAppointment?.patientName || 'Rameshwar Prasad Yadav'}</p>
            <p><strong>Age / Gender:</strong> {activeAppointment?.patientAge || 54} Yrs / {activeAppointment?.patientGender || 'Male'}</p>
            <p><strong>Phone:</strong> +91 {activeAppointment?.patientPhone || '9826198261'}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Token No:</strong> <span className="font-mono font-bold text-[#0F9D6D]">{activeAppointment?.tokenNumber || 'SAR-014'}</span></p>
            <p><strong>OPD Mode:</strong> {activeAppointment?.appointmentMode || 'IN_CLINIC'}</p>
          </div>
        </div>

        {/* Clinical Observations */}
        <div className="border-b border-slate-200 pb-3 mb-4">
          <h4 className="text-xs font-heading font-extrabold text-[#0B3D2E] uppercase tracking-wider mb-1">Clinical Diagnosis & Observations</h4>
          <p className="text-xs text-slate-700"><strong>Diagnosis:</strong> {diagnosis}</p>
          <p className="text-xs text-slate-600 mt-0.5"><strong>Clinical Notes:</strong> {clinicalNotes}</p>
        </div>

        {/* Rx Medicines Table */}
        <div className="mb-6">
          <div className="text-2xl font-serif font-black text-[#0F9D6D] mb-2">Rx</div>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#0B3D2E] text-white font-heading font-bold text-[11px]">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Medicine Name</th>
                <th className="p-2.5">Dosage</th>
                <th className="p-2.5">Frequency</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Timing</th>
                <th className="p-2.5">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {medicineItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2.5 font-bold">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                  <td className="p-2.5 text-slate-600">{item.dosage}</td>
                  <td className="p-2.5 font-mono font-bold text-[#0F9D6D]">{item.frequency}</td>
                  <td className="p-2.5 text-slate-600">{item.durationDays} Days</td>
                  <td className="p-2.5 text-slate-600">{item.timing.replace('_', ' ')}</td>
                  <td className="p-2.5 text-slate-600">{item.specialInstructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Investigations & Advice Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <h5 className="font-heading font-extrabold text-[11px] text-[#0B3D2E] uppercase tracking-wider mb-1">Investigations Ordered</h5>
            <p className="text-slate-700">{investigationsInput || 'None'}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <h5 className="font-heading font-extrabold text-[11px] text-[#0B2545] uppercase tracking-wider mb-1">Advice & Lifestyle</h5>
            <p className="text-slate-700">{adviceInput || 'None'}</p>
          </div>
        </div>

        {/* Next Follow Up */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-bold flex justify-between items-center mb-6">
          <span>Next Scheduled Follow-up Date:</span>
          <span className="text-emerald-700 font-extrabold">{nextFollowUpDate || 'As Needed'}</span>
        </div>

        {/* Footer Signature */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
          <div className="text-[10px] text-slate-400">
            Generated via JANSEVAAROGYAM Doctor Console • Valid without physical seal
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-center">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">DIGITALLY SIGNED & VERIFIED</p>
            <p className="font-heading font-extrabold text-xs text-slate-900 mt-0.5">{currentDoctor.name}</p>
            <p className="text-[10px] text-slate-500">Reg: {currentDoctor.regNumber}</p>
          </div>
        </div>
      </div>

    </div>
  );
};


