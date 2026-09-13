import React, { useState } from 'react';
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
  Edit3,
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import type { Appointment, PrescriptionItem, MealTiming } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

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
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
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
    if (!articleTitle || !articleExcerpt) {
      setArticleError('Please fill in Title and Summary Excerpt');
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

  const handleMarkDone = async (apptId: string) => {
    setMarkingDoneApptId(apptId);
    try {
      await updateAppointmentStatus(apptId, 'COMPLETED');
    } finally {
      setMarkingDoneApptId(null);
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
      doc.text('SEVASADAN HEALTHCARE NETWORK', 14, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Sarangpur • Shujalpur • Rajgarh & Virtual Telemedicine OPD', 14, 22);
      doc.text('Emergency Helpline: 1800-SEVA-CLINIC | Web: www.sevasadanclinic.in', 14, 27);

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
      doc.save(`SEVASADAN_Rx_${activeAppointment?.tokenNumber || 'SAR014'}.pdf`);

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

  const filteredAppointments = appointments.filter(a => {
    if (selectedQueueFilter === 'ALL') return true;
    if (selectedQueueFilter === 'WAITING') return a.status === 'CONFIRMED' || a.status === 'PENDING';
    if (selectedQueueFilter === 'IN_PROGRESS') return a.status === 'IN_PROGRESS';
    if (selectedQueueFilter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* Doctor Console Top Header - Unified Deep Navy Brand Gradient */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
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
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {language === 'en' ? 'Active OPD' : 'ओपीडी चालू'}
              </span>
            </div>
            <p className="text-xs text-sky-200 font-medium mt-0.5">{currentDoctor.specialization}</p>
            <p className="text-[11px] text-sky-100/80 mt-0.5">
              Reg: {currentDoctor.regNumber} • {language === 'en' ? 'Assigned Branches:' : 'शाखाएं:'} {currentDoctor.clinicsCovered && currentDoctor.clinicsCovered.length > 0 
                ? currentDoctor.clinicsCovered.map((cId: string) => clinics.find(c => c.id === cId)?.name || cId).join(', ') 
                : 'Sarangpur & Tele-OPD'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 text-xs font-bold font-heading">
            <button
              onClick={() => setActiveConsoleTab('OPD')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeConsoleTab === 'OPD' ? 'bg-white text-[#0B2545] shadow-md font-extrabold' : 'text-slate-200 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'OPD & Queue' : 'ओपीडी एवं कतार'}</span>
            </button>
            <button
              onClick={() => setActiveConsoleTab('ARTICLES')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeConsoleTab === 'ARTICLES' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-200 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>{language === 'en' ? 'My Health Articles' : 'मेरे स्वास्थ्य लेख'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 text-xs font-sans">
            <div className="text-center px-3 border-r border-white/20">
              <p className="text-lg font-heading font-extrabold text-amber-300">{appointments.length}</p>
              <p className="text-[10px] text-slate-300">{language === 'en' ? 'Total Today' : 'आज के कुल'}</p>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <p className="text-lg font-heading font-extrabold text-emerald-400">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </p>
              <p className="text-[10px] text-slate-300">{language === 'en' ? 'Completed' : 'पूर्ण हुए'}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-lg font-heading font-extrabold text-sky-300">
                {appointments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED').length}
              </p>
              <p className="text-[10px] text-slate-300">{language === 'en' ? 'In Queue' : 'कतार में'}</p>
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
                {language === 'en' ? 'Doctor Knowledge Publishing' : 'चिकित्सा लेख प्रकाशन'}
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
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Publish New Article' : 'नया लेख प्रकाशित करें'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthBlogs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-heading font-bold text-slate-800 text-sm">No Health Articles Published Yet</p>
                <p className="text-xs text-slate-500 mt-1">Click "Publish New Article" above to share medical advice with patients.</p>
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
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPendingArticleDeleteId(art.id)}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold p-2 rounded-xl text-xs transition cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col max-h-210">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F4C81]" />
              <span>Live Patient Queue</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time Sync</span>
          </div>

          {/* Queue Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-heading font-bold">
            {(['ALL', 'WAITING', 'IN_PROGRESS', 'COMPLETED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSelectedQueueFilter(f)}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedQueueFilter === f ? 'bg-white text-[#0F4C81] shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Patient Queue Cards */}
          <div className="space-y-3 overflow-y-auto grow pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="font-heading font-bold text-slate-700 text-xs">
                  No Appointments available now
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
                    appt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 border border-amber-200/80 animate-pulse' :
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

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    {appt.appointmentMode === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-emerald-600" /> : <Building2 className="w-3.5 h-3.5 text-[#0F4C81]" />}
                    {appt.clinicName}
                  </span>
                  <span className="font-bold text-slate-700">{appt.timeSlot}</span>
                </div>

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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Video className="w-4 h-4 animate-pulse" />
                    <span>Start Consultation</span>
                  </button>
                )}

                <div className="pt-1 flex items-center gap-2">
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
                    disabled={markingDoneApptId === appt.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
                  >
                    {markingDoneApptId === appt.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Mark Done</span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPendingCancelApptId(appt.id); }} 
                    className="flex-1 rounded-xl bg-rose-50 hover:bg-rose-100 py-1.5 text-[10px] font-bold text-rose-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openRescheduleModal(appt); }} 
                    className="flex-1 rounded-xl bg-amber-50 hover:bg-amber-100 py-1.5 text-[10px] font-bold text-amber-800 transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
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
            </div>

            {/* Select Doctor's Patient Dropdown */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Patient:
              </label>
              <select
                value={activeAppointment?.id || ''}
                onChange={(e) => {
                  const found = appointments.find(a => a.id === e.target.value);
                  if (found) setActiveAppointment(found);
                }}
                className="w-full sm:w-60 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="">-- Doctor's Patient List --</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patientName || 'Patient'} ({a.tokenNumber || 'TK'}) {a.patientPhone ? `- ${a.patientPhone}` : ''}
                  </option>
                ))}
              </select>
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Frequency</label>
                  <select
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-0-0">1-0-0 (Morning Only)</option>
                    <option value="0-0-1">0-0-1 (Night Only)</option>
                    <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                    <option value="Once Weekly">Once Weekly</option>
                  </select>
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

      {/* ARTICLE PUBLISH / EDIT MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-in font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-extrabold text-slate-900 text-lg">
                  {editingArticleId ? 'Edit Health Article' : 'Publish New Health Article'}
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
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                    Specialty Category
                  </label>
                  <select
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diabetes & Metabolic">Diabetes & Metabolic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                    Estimated Read Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={articleReadTime}
                    onChange={(e) => setArticleReadTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  Summary Excerpt (Card Subtitle) *
                </label>
                <textarea
                  rows={2}
                  value={articleExcerpt}
                  onChange={(e) => setArticleExcerpt(e.target.value)}
                  placeholder="Short 2-line summary visible on cards..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
                  Upload Cover Image
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
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
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
        </div>
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
      {rescheduleTargetAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-in font-sans">
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
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                  New Time Slot *
                </label>
                <select
                  value={rescheduleTimeSlot}
                  onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
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
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER FOR NATIVE BROWSER PRINT DIALOG */}
      <div id="printable-rx-container" className="hidden print:block font-sans text-slate-900 bg-white p-6 leading-normal">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#0F4C81] text-white p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-extrabold tracking-tight">SEVASADAN HEALTHCARE NETWORK</h1>
            <p className="text-xs text-sky-200 mt-1">Sarangpur • Shujalpur • Rajgarh & Virtual Telemedicine OPD</p>
            <p className="text-[10px] text-sky-100/80">Emergency Helpline: 1800-SEVA-CLINIC | www.sevasadanclinic.in</p>
          </div>
          <div className="text-right">
            <h3 className="font-heading font-extrabold text-sm text-white">{currentDoctor.name}</h3>
            <p className="text-xs text-sky-200">{currentDoctor.qualification}</p>
            <p className="text-[10px] text-sky-100/80">Reg: {currentDoctor.regNumber} • {currentDoctor.specialization}</p>
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
            <p><strong>Token No:</strong> <span className="font-mono font-bold text-[#0F4C81]">{activeAppointment?.tokenNumber || 'SAR-014'}</span></p>
            <p><strong>OPD Mode:</strong> {activeAppointment?.appointmentMode || 'IN_CLINIC'}</p>
          </div>
        </div>

        {/* Clinical Observations */}
        <div className="border-b border-slate-200 pb-3 mb-4">
          <h4 className="text-xs font-heading font-extrabold text-[#0B2545] uppercase tracking-wider mb-1">Clinical Diagnosis & Observations</h4>
          <p className="text-xs text-slate-700"><strong>Diagnosis:</strong> {diagnosis}</p>
          <p className="text-xs text-slate-600 mt-0.5"><strong>Clinical Notes:</strong> {clinicalNotes}</p>
        </div>

        {/* Rx Medicines Table */}
        <div className="mb-6">
          <div className="text-2xl font-serif font-black text-emerald-600 mb-2">Rx</div>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#0B2545] text-white font-heading font-bold text-[11px]">
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
                  <td className="p-2.5 font-mono font-bold text-[#0F4C81]">{item.frequency}</td>
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
            <h5 className="font-heading font-extrabold text-[11px] text-[#0B2545] uppercase tracking-wider mb-1">Investigations Ordered</h5>
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
            Generated via SEVASADAN Doctor Console • Valid without physical seal
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


