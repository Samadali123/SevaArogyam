import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Building2, 
  Video, 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Lock,
  FileCheck,
  Image as ImageIcon,
  Mic,
  Square,
  Volume2,
  SearchX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../../context/AppContext';
import type { AppointmentMode, PatientType, Appointment } from '../../types';
import { api, getApiErrorMessage } from '../../services/api';
import { loadRazorpay } from '../../services/razorpay';
import { CustomSelect } from '../ui/CustomSelect';

export interface UploadedDoc {
  id: string;
  name: string;
  sizeFormatted: string;
  type: string;
  url: string;
  uploadedAt: string;
  file?: File;
}

export const BookingWizardModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    closeBookingModal, 
    preselectedDoctorId, 
    preselectedClinicId, 
    preselectedMode,
    clinics, 
    doctors, 
    currentUser,
    bookAppointment,
    appointments,
    language 
  } = useApp();


  const [step, setStep] = useState<number>(1);

  // Form State
  const [appointmentMode, setAppointmentMode] = useState<AppointmentMode>('IN_CLINIC');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('sarangpur');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [patientType, setPatientType] = useState<PatientType>('EXISTING');
  const [patientName, setPatientName] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number | string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  void patientId;
  
  // Step 4: Uploaded Documents & Voice Note State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Step 4: Voice Note State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [voiceNoteFile, setVoiceNoteFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setVoiceNoteUrl(url);
        setVoiceNoteFile(new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Step 5: Payment Choice State (Online vs Offline)
  const [paymentModeChoice, setPaymentModeChoice] = useState<'RAZORPAY' | 'CASH'>('RAZORPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  
  // Step 6: Confirmation output
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (preselectedMode) {
      setAppointmentMode(preselectedMode);
    }

    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
      const doc = doctors.find(d => d.id === preselectedDoctorId);
      if (doc && doc.clinicsCovered.length > 0) {
        setSelectedClinicId(doc.clinicsCovered[0]);
      }
    } else if (doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }

    if (preselectedClinicId) {
      setSelectedClinicId(preselectedClinicId);
    }

    if (currentUser && currentUser.role === 'PATIENT') {
      setPatientName((currentUser as any).name || '');
      setPatientId((currentUser as any).patientId || '');
      setPatientAge((currentUser as any).age || '');
      setPatientGender((currentUser as any).gender || '');
    }
  }, [preselectedDoctorId, preselectedClinicId, preselectedMode, isBookingModalOpen]);

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  const currentClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  // Section 5: Filter unique registered patients who have booked with current Doctor (any status)
  const registeredPatientsList = useMemo(() => {
    if (!selectedDoctorId) return [];
    const map = new Map<string, { id: string; name: string; age: number | string; gender: string; phone?: string }>();
    (appointments || []).forEach(a => {
      if (a.doctorId === selectedDoctorId && a.patientName && a.patientName !== 'Patient') {
        const key = `${a.patientName.toLowerCase().trim()}_${a.patientAge || ''}_${(a.patientPhone || '').trim()}`;
        if (!map.has(key)) {
          map.set(key, {
            id: a.patientId || key,
            name: a.patientName,
            age: a.patientAge || '',
            gender: a.patientGender || '',
            phone: a.patientPhone || ''
          });
        }
      }
    });
    return Array.from(map.values());
  }, [appointments, selectedDoctorId]);

  // Section 1.2: Dynamic time slots per doctor's working schedule & excluding booked slots
  const availableSlots = useMemo(() => {
    if (!currentDoctor) return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    
    // Standard doctor slots from opdScheduleSummary or standard 30-min working hours
    const baseSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ];

    // Filter out slots already booked for this doctor on this date
    const booked = (appointments || [])
      .filter(a => a.doctorId === currentDoctor.id && a.appointmentDate === appointmentDate && a.status !== 'CANCELLED')
      .map(a => (a.timeSlot || '').trim().toUpperCase());

    const filtered = baseSlots.filter(s => !booked.includes(s.trim().toUpperCase()));
    return filtered.length > 0 ? filtered : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'];
  }, [currentDoctor, appointmentDate, appointments]);

  if (!isBookingModalOpen) return null;

  const commonSymptoms = [
    'Fever / Chills', 'Cold & Cough', 'Diabetes Check', 'Hypertension / BP',
    'Joint Pain / Stiffness', 'Skin Rash / Allergy', 'Pediatric Vaccination', 'Chest Pain / ECG'
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleNextStep = () => {
    if (step === 2 && !selectedDoctorId) return;
    if (step === 3) {
      if (patientType === 'NEW' && (!patientName || !String(patientName).trim())) {
        alert('Please enter the patient name.');
        return;
      }
    }
    if (step === 4) {
      if (!patientNotes || !patientNotes.trim()) {
        alert('Medical Intake & Specific Concerns is mandatory. Please enter your symptoms or health concerns before continuing.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Document Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDoc[] = Array.from(files).map((file, idx) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      const url = URL.createObjectURL(file);
      return {
        id: `doc-${Date.now()}-${idx}`,
        name: file.name,
        sizeFormatted,
        type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        url,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file
      };
    });

    setUploadedFiles(prev => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile?.id === id) {
      setPreviewFile(null);
    }
  };

  const triggerReplace = (id: string) => {
    setReplaceTargetId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeKB = Math.round(file.size / 1024);
    const sizeFormatted = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    const url = URL.createObjectURL(file);

    setUploadedFiles(prev => prev.map(f => f.id === replaceTargetId ? {
      id: f.id,
      name: file.name,
      sizeFormatted,
      type: file.type || 'application/octet-stream',
      url,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file
    } : f));

    setReplaceTargetId(null);
    e.target.value = '';
  };

  // Dummy Razorpay Payment Trigger
  const handleConfirmBooking = async () => {
    setIsProcessingPayment(true);

    try {
      const appt = await bookAppointment({
        doctorId: selectedDoctorId,
        clinicId: appointmentMode === 'IN_CLINIC' ? selectedClinicId : null,
        appointmentMode,
        appointmentDate,
        timeSlot,
        patientNotes,
        symptoms: selectedSymptoms,
        paymentMethod: paymentModeChoice === 'CASH' ? 'CASH_AT_CLINIC' : 'RAZORPAY',
        patientType,
        patientName: patientName || 'Patient',
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        documents: uploadedFiles.map(f => f.file).filter(Boolean) as File[],
        voiceNote: voiceNoteFile || undefined
      });

      if (paymentModeChoice === 'RAZORPAY' && appt.razorpayOrderId) {
        await loadRazorpay();
        if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable');
        await new Promise<void>((resolve, reject) => {
          const checkout = new window.Razorpay!({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
            amount: appt.razorpayAmount || 0,
            currency: appt.razorpayCurrency || 'INR',
            name: 'Sevasadan',
            description: 'Doctor appointment',
            order_id: appt.razorpayOrderId!,
            prefill: { name: patientName, email: currentUser?.email, contact: currentUser?.phone },
            handler: async (payment) => {
              try {
                await api.post('/appointments/verify-payment', {
                  appointmentId: appt.id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                });
                appt.paymentStatus = 'SUCCESS';
                appt.status = 'CONFIRMED';
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          });
          checkout.open();
        });
      }

      setCreatedAppointment(appt);
      setIsProcessingPayment(false);
      setStep(6); // Step 6: Booking Confirmed

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (error) {
      console.error('Failed to book appointment', error);
      setIsProcessingPayment(false);
      alert(getApiErrorMessage(error, 'Unable to complete the booking. Please try again.'));
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setCreatedAppointment(null);
    setUploadedFiles([]);
    setPreviewFile(null);
    closeBookingModal();
  };

  // Download Token Pass Function
  const downloadTokenPass = () => {
    if (!createdAppointment) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 760);
    grad.addColorStop(0, '#0B2545');
    grad.addColorStop(0.5, '#0F4C81');
    grad.addColorStop(1, '#0A365C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 760);

    // Border Frame
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, 570, 730);

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('JANSEVAAROGYAM CLINIC & TELE-OPD', 40, 65);

    ctx.fillStyle = '#10B981';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('SUPER SPECIALTY OPD & TELEHEALTH NETWORK', 40, 90);

    // Horizontal Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.lineTo(560, 110);
    ctx.stroke();

    // Token Pass Card Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(40, 130, 520, 115);
    ctx.strokeStyle = '#10B981';
    ctx.strokeRect(40, 130, 520, 115);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '700 12px sans-serif';
    ctx.fillText('APPOINTMENT TOKEN PASS NUMBER', 60, 160);

    ctx.fillStyle = '#FDE047';
    ctx.font = '900 40px monospace';
    ctx.fillText(createdAppointment.tokenNumber, 60, 208);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(createdAppointment.status.toUpperCase(), 420, 175);

    // Patient & Doctor Information
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('PATIENT NAME', 40, 280);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px sans-serif';
    ctx.fillText(createdAppointment.patientName, 40, 305);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('DOCTOR NAME', 320, 280);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px sans-serif';
    ctx.fillText(createdAppointment.doctorName, 320, 305);
    ctx.fillStyle = '#38BDF8';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(createdAppointment.doctorSpecialization, 320, 325);

    // Appointment Schedule & Venue
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('SCHEDULED DATE & TIME', 40, 365);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(`${createdAppointment.appointmentDate} at ${createdAppointment.timeSlot}`, 40, 390);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('VENUE / BRANCH', 320, 365);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(createdAppointment.clinicName, 320, 390);

    // Payment Info
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('PAYMENT METHOD & STATUS', 40, 440);
    ctx.fillStyle = '#10B981';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(`${createdAppointment.paymentMethod} — ${createdAppointment.paymentStatus}`, 40, 465);

    // Attached Docs Summary
    if (uploadedFiles.length > 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('ATTACHED DOCUMENTS', 320, 440);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '700 14px sans-serif';
      ctx.fillText(`${uploadedFiles.length} Document(s) Uploaded`, 320, 465);
    }

    // Instructions Box
    ctx.fillStyle = 'rgba(15, 76, 129, 0.4)';
    ctx.fillRect(40, 500, 520, 150);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(40, 500, 520, 150);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 13px sans-serif';
    ctx.fillText('IMPORTANT PATIENT INSTRUCTIONS:', 60, 528);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 12px sans-serif';
    ctx.fillText('1. Please report 15 minutes prior to your allocated token time slot.', 60, 555);
    ctx.fillText('2. Present this token pass at the clinic reception or video lobby.', 60, 580);
    ctx.fillText('3. 24x7 Helpline: 1800-SEVA-CLINIC (1800-7382-723)', 60, 605);
    ctx.fillText('4. Address: Sarangpur | Shujalpur | Rajgarh Branches', 60, 630);

    // Footer Branding
    ctx.fillStyle = '#64748B';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('JANSEVAAROGYAM — Verified OPD & Digital Telemedicine Network', 120, 695);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Jansevaarogyam_Token_${createdAppointment.tokenNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const feeAmount = appointmentMode === 'VIDEO' 
    ? (currentDoctor?.consultationFeeOnline || 450) 
    : (currentDoctor?.consultationFeeClinic || 300);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* File Replace Hidden Input */}
      <input 
        type="file" 
        ref={replaceInputRef} 
        onChange={handleReplaceFile} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] my-auto relative">
        
        {/* Header with Stepper Progress */}
        <div className="bg-linear-to-r from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] text-white p-6 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[#2DD4BF] text-[10px] font-black px-2.5 py-0.5 rounded bg-[#2DD4BF]/20 uppercase tracking-wider">
                {language === 'en' ? `Step ${step} of 6` : `चरण ${step} / 6`}
              </span>
              <h3 className="font-black text-xl tracking-tight mt-1">
                {step === 1 && (language === 'en' ? 'Select Booking Mode' : 'परामर्श प्रकार चुनें')}
                {step === 2 && (language === 'en' ? 'Select Branch & Doctor' : 'शाखा एवं डॉक्टर चुनें')}
                {step === 3 && (language === 'en' ? 'Date & Time Slot' : 'तारीख एवं समय का चयन')}
                {step === 4 && (language === 'en' ? 'Medical Intake & Upload Documents' : 'स्वास्थ्य विवरण एवं दस्तावेज़ अपलोड')}
                {step === 5 && (language === 'en' ? 'Razorpay Payment Gateway' : 'रेजरपे पेमेंट गेटवे')}
                {step === 6 && (language === 'en' ? 'Booking Confirmed!' : 'अपॉइंटमेंट की पुष्टि हो गई!')}
              </h3>
            </div>
            <button 
              onClick={resetAndClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper bar */}
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-linear-to-r from-[#10B981] to-[#0D9488]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow">

          {/* STEP 1: Mode Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm font-semibold text-slate-600 text-center">
                {language === 'en' 
                  ? 'Choose how you would like to consult with our specialized doctors:' 
                  : 'कृपया चुनें कि आप हमारे विशेषज्ञों से परामर्श कैसे लेना चाहते हैं:'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Physical In-Clinic Option */}
                <div 
                  onClick={() => setAppointmentMode('IN_CLINIC')}
                  className={`cursor-pointer border-2 p-5 rounded-3xl transition-all relative flex flex-col justify-between ${
                    appointmentMode === 'IN_CLINIC' 
                      ? 'border-[#0F4C81] bg-sky-50/70 shadow-md ring-2 ring-[#0F4C81]/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {appointmentMode === 'IN_CLINIC' && (
                    <span className="absolute top-4 right-4 bg-[#0F4C81] text-white p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-[#0F4C81]/10 text-[#0F4C81] rounded-2xl flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900">In-Clinic Physical Visit</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Physical doctor consultation at Sarangpur, Shujalpur, or Rajgarh branches with sequential Token Generation & OPD Queue tracking.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#0F4C81]">
                    <span>Token System Enabled</span>
                    <span>Fee: ₹300 - ₹500</span>
                  </div>
                </div>

                {/* Virtual Video OPD Option */}
                <div 
                  onClick={() => setAppointmentMode('VIDEO')}
                  className={`cursor-pointer border-2 p-5 rounded-3xl transition-all relative flex flex-col justify-between ${
                    appointmentMode === 'VIDEO' 
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-600/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {appointmentMode === 'VIDEO' && (
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900">Virtual Video Consultation</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Consult live with doctors from home over HD WebRTC video. Includes digital prescription PDF download & live whiteboard chat.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>Direct Magic Join Link</span>
                    <span>Fee: ₹400 - ₹600</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Branch & Doctor Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Branch Selector if In-Clinic */}
              {appointmentMode === 'IN_CLINIC' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Select Clinic Branch
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {clinics.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClinicId(c.id)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                          selectedClinicId === c.id 
                            ? 'border-[#0F4C81] bg-[#0F4C81]/10 text-[#0F4C81] font-extrabold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                        }`}
                      >
                        <p className="text-xs font-black truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.city}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. CHOOSE DOCTOR
                </label>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(() => {
                    const selectedClinic = clinics.find(c => c.id === selectedClinicId);
                    const matchingDoctors = doctors.filter(d => {
                      if (appointmentMode === 'VIDEO') return true;
                      if (!selectedClinicId) return true;
                      if (!d.clinicsCovered || d.clinicsCovered.length === 0) return false;
                      
                      const searchTerms = [
                        selectedClinicId.toLowerCase(),
                        selectedClinic?.id?.toLowerCase(),
                        selectedClinic?.name?.toLowerCase(),
                        selectedClinic?.city?.toLowerCase(),
                        selectedClinic?.fullName?.toLowerCase(),
                      ].filter(Boolean) as string[];

                      return d.clinicsCovered.some(cCovered => {
                        const term = String(cCovered).toLowerCase().replace(/\s*branch\s*/i, '').trim();
                        return searchTerms.some(st => {
                          const cleanSt = st.replace(/\s*branch\s*/i, '').trim();
                          return cleanSt && (term.includes(cleanSt) || cleanSt.includes(term));
                        });
                      });
                    });

                    if (matchingDoctors.length === 0) {
                      return (
                        <div className="py-8 px-4 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                            <SearchX className="w-5 h-5" />
                          </div>
                          <h6 className="font-extrabold text-sm text-slate-800">
                            Search Not Found
                          </h6>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                            No doctors assigned to {selectedClinic?.name || 'this Branch'} matching your selection.
                          </p>
                        </div>
                      );
                    }

                    return matchingDoctors.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-center gap-4 ${
                          selectedDoctorId === doc.id 
                            ? 'border-[#0F4C81] bg-sky-50/70 shadow-md ring-2 ring-[#0F4C81]/20' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img 
                          src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR} 
                          alt={doc.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0" 
                        />
                        <div className="grow min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-black text-sm text-slate-900 truncate">{doc.name}</h5>
                            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                              ₹{appointmentMode === 'VIDEO' ? doc.consultationFeeOnline : doc.consultationFeeClinic}
                            </span>
                          </div>
                          <p className="text-xs text-[#0F4C81] font-extrabold">{doc.specialization}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{doc.qualification} • {doc.experienceYears} Yrs Exp</p>

                          <div className="flex items-center gap-2 pt-1.5 mt-1 border-t border-slate-100 text-[10px]">
                            <span className="bg-sky-100 text-[#0F4C81] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>Assigned: {doc.clinicsCovered.map(cId => clinics.find(c => c.id === cId)?.name || cId).join(', ')}</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                              Available Today
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Date & Slot Picker */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Preferred Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Patient Classification
                  </label>
                  <CustomSelect
                    value={patientType}
                    onChange={(val) => setPatientType(val as PatientType)}
                    themeColor="teal"
                    options={[
                      { value: 'NEW', label: 'New Patient (First Visit)' },
                      { value: 'EXISTING', label: 'Existing Patient (Registered)' },
                    ]}
                  />
                </div>
              </div>

              {/* Existing Patient Selection Dropdown */}
              {patientType !== 'NEW' && (
                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 space-y-2">
                  <label className="block text-xs font-bold text-[#0F4C81]">
                    Select Registered Patient ({selectedDoctorId ? 'Doctor\'s Registered Patients' : 'All Patient Records'})
                  </label>
                  <CustomSelect
                    value={patientId || ''}
                    onChange={(selectedVal) => {
                      const p = registeredPatientsList.find(item => item.id === selectedVal || item.name === selectedVal);
                      if (p) {
                        setPatientId(p.id);
                        setPatientName(p.name);
                        setPatientAge(p.age);
                        setPatientGender(p.gender);
                      }
                    }}
                    placeholder="-- Select Registered Patient --"
                    showPlaceholderOption={true}
                    themeColor="teal"
                    options={registeredPatientsList.map(p => ({
                      value: p.id,
                      label: `${p.name}${p.age ? ` (${p.age} Yrs` : ''}${p.gender ? `, ${p.gender})` : ')'}${p.phone ? ` • +91 ${p.phone}` : ''}`
                    }))}
                  />
                </div>
              )}
              {patientType === 'NEW' ? (
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Age (Years) *</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Enter age"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender *</label>
                    <CustomSelect
                      value={patientGender}
                      onChange={(val) => setPatientGender(val)}
                      placeholder="Select Gender"
                      showPlaceholderOption={true}
                      themeColor="teal"
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                  </div>
                </div>
              ) : (
                patientName && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                    <span>Selected Patient: <span className="text-slate-900 font-black">{patientName}</span> {patientAge ? `(${patientAge} Yrs` : ''}{patientGender ? `, ${patientGender})` : ')'}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase font-black">Registered Patient</span>
                  </div>
                )
              )}

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Time Slots ({availableSlots.length} Available)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        timeSlot === slot 
                          ? 'border-[#2DD4BF] bg-[#2DD4BF]/15 text-[#0D9488] font-black shadow-xs ring-2 ring-[#2DD4BF]/30' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Medical Intake & Upload Documents */}
          {step === 4 && (
            <div className="space-y-6">
              
              {/* Symptoms */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Common Symptoms (Select all that apply - Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                        selectedSymptoms.includes(sym)
                          ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical Concerns */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Medical Intake & Specific Concerns *
                </label>
                <textarea
                  rows={3}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Describe your health issue, duration, or any current medications..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                />
              </div>

              {/* Voice Note Option */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-600" />
                    <span>Record Voice Note for Doctor (Optional)</span>
                  </label>
                  {isRecording && (
                    <span className="text-xs text-rose-600 font-mono font-bold animate-pulse">
                      Recording: {recordingTime}s
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{voiceNoteUrl ? 'Re-record Voice Note' : 'Record Voice Note'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {voiceNoteUrl && !isRecording && (
                    <div className="flex items-center gap-2 grow bg-white p-2 rounded-xl border border-slate-200">
                      <Volume2 className="w-4 h-4 text-[#0F4C81]" />
                      <audio src={voiceNoteUrl} controls className="h-8 grow" />
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 4: UPLOAD DOCUMENTS FEATURE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upload Medical Documents & Reports (Optional)
                  </label>
                  <span className="text-[11px] font-bold text-[#0F4C81] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {uploadedFiles.length} File(s) Attached
                  </span>
                </div>

                {/* Upload Action Zone */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#0F4C81]/30 hover:border-[#0F4C81] p-5 rounded-2xl text-center bg-sky-50/40 hover:bg-sky-50/80 transition cursor-pointer group"
                >
                  <UploadCloud className="w-8 h-8 text-[#0F4C81] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-slate-900">
                    Click to Upload Medical Reports or Drag & Drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Upload Lab Reports, Past Prescriptions, X-Rays (PDF, JPG, PNG up to 10MB)
                  </p>
                  <button 
                    type="button"
                    className="mt-3 bg-[#0F4C81] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Choose Documents</span>
                  </button>
                </div>

                {/* Uploaded File List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Uploaded Documents Preview & Controls
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {uploadedFiles.map((doc) => (
                        <div 
                          key={doc.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                              {doc.name.endsWith('.pdf') ? <FileText className="w-5 h-5 text-rose-600" /> : <ImageIcon className="w-5 h-5 text-emerald-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {doc.sizeFormatted} • Uploaded at {doc.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Preview Button */}
                            <button
                              type="button"
                              onClick={() => setPreviewFile(doc)}
                              className="p-1.5 text-slate-600 hover:text-[#0F4C81] hover:bg-sky-100 rounded-lg transition"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Replace Button */}
                            <button
                              type="button"
                              onClick={() => triggerReplace(doc.id)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition"
                              title="Replace Document"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(doc.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                              title="Remove Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 5: DUMMY RAZORPAY PAYMENT FRONTEND */}
          {step === 5 && (
            <div className="space-y-5">
              
              {/* Fee Summary Header */}
              <div className="bg-linear-to-r from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] text-white p-5 rounded-3xl shadow-lg border border-blue-900/50 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#2DD4BF] text-slate-950 font-black px-2.5 py-1 rounded-md text-xs tracking-wider uppercase">
                      PAYMENT OPTIONS
                    </div>
                    <span className="text-xs text-slate-300 font-bold">Secure Booking</span>
                  </div>
                  <span className="bg-[#0D9488]/20 text-[#2DD4BF] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#0D9488]/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>256-Bit SSL Secured</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">Center Name</p>
                    <h4 className="text-base font-black text-white">Jansevaarogyam Clinic</h4>
                    <p className="text-xs text-[#2DD4BF]">{appointmentMode === 'VIDEO' ? 'Virtual Video OPD Token' : `${currentClinic?.name}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">Amount Payable</p>
                    <p className="text-3xl font-black text-[#2DD4BF]">₹{feeAmount}</p>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payment Option
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Pay Online */}
                  <div 
                    onClick={() => setPaymentModeChoice('RAZORPAY')}
                    className={`cursor-pointer p-5 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                      paymentModeChoice === 'RAZORPAY' 
                        ? 'border-[#0D9488] bg-teal-50/70 shadow-md ring-2 ring-[#0D9488]/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {paymentModeChoice === 'RAZORPAY' && (
                      <span className="absolute top-4 right-4 bg-[#0D9488] text-white p-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-[#0B1F3A] text-[#2DD4BF] font-black text-xs px-2.5 rounded-xl flex items-center justify-center tracking-wider">
                        ONLINE
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900">Pay Online</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                          Instant digital payment via UPI, Credit/Debit Cards, or Netbanking.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#0D9488]">
                      <span>Instant Digital Token</span>
                      <span>₹{feeAmount}</span>
                    </div>
                  </div>

                  {/* Option 2: Pay Offline */}
                  <div 
                    onClick={() => { if (appointmentMode === 'IN_CLINIC') setPaymentModeChoice('CASH'); }}
                    className={`p-5 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                      appointmentMode === 'VIDEO' ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50' :
                      paymentModeChoice === 'CASH' 
                        ? 'border-[#0D9488] bg-teal-50/70 shadow-md ring-2 ring-[#0D9488]/20 cursor-pointer' 
                        : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                    }`}
                  >
                    {paymentModeChoice === 'CASH' && (
                      <span className="absolute top-4 right-4 bg-[#0D9488] text-white p-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-teal-100 text-[#0D9488] rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900">Pay Offline</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                          Generate OPD token pass now and pay in-person at clinic reception counter upon arrival.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#0D9488]">
                      <span>In-Person OPD Counter</span>
                      <span>Pay at Visit</span>
                    </div>
                  </div>
                </div>

                {appointmentMode === 'VIDEO' && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-semibold">
                    * Note: Online Razorpay payment is mandatory for Virtual Video Consultations to issue room links.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* STEP 6: Confirmation Receipt */}
          {step === 6 && createdAppointment && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-teal-100 text-[#0D9488] rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="font-black text-2xl text-slate-900">
                  {language === 'en' ? 'Booking Confirmed!' : 'अपॉइंटमेंट की पुष्टि हो गई!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Confirmation token dispatched via SMS & WhatsApp to <strong>+91 {createdAppointment.patientPhone}</strong>
                </p>
              </div>

              {/* Token Ticket Card */}
              <div className="bg-linear-to-br from-[#0B1F3A] via-[#0D2B4E] to-[#132D4D] text-white p-6 rounded-3xl shadow-xl text-left space-y-4 relative overflow-hidden border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#2DD4BF] tracking-wider">
                      {createdAppointment.appointmentMode === 'IN_CLINIC' ? 'Physical Token Pass' : 'Video Room Pass'}
                    </span>
                    <p className="text-3xl font-black text-amber-300 tracking-wider font-mono">
                      {createdAppointment.tokenNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-[#0D9488]/20 text-[#2DD4BF] px-3 py-1 rounded-full font-extrabold border border-[#0D9488]/30">
                      {createdAppointment.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#CBD5E1] text-[11px]">Doctor</span>
                    <p className="font-black text-white text-sm">{createdAppointment.doctorName}</p>
                    <p className="text-[10px] text-[#CBD5E1]">{createdAppointment.doctorSpecialization}</p>
                  </div>
                  <div>
                    <span className="text-[#CBD5E1] text-[11px]">Branch / Venue</span>
                    <p className="font-black text-white text-sm">{createdAppointment.clinicName}</p>
                    <p className="text-[10px] text-[#CBD5E1]">{createdAppointment.appointmentDate} at {createdAppointment.timeSlot}</p>
                  </div>
                </div>

                {/* Uploaded Files Summary on Ticket if any */}
                {uploadedFiles.length > 0 && (
                  <div className="pt-2 border-t border-white/10 text-xs text-[#2DD4BF] font-semibold">
                    <span>Attached Reports: {uploadedFiles.map(f => f.name).join(', ')}</span>
                  </div>
                )}

                {/* Direct Video Join Button if Video mode */}
                {createdAppointment.appointmentMode === 'VIDEO' && (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="text-xs text-[#2DD4BF] font-bold">
                      <span>30-Min Pre-call Magic Room Link Ready</span>
                    </div>
                    <a
                      href={`#/telemedicine?room=${createdAppointment.id}&token=${createdAppointment.roomJoinToken}`}
                      onClick={resetAndClose}
                      className="bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Enter Video Room</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons: Download Token & Done */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={downloadTokenPass}
                  className="w-full sm:w-auto bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Token Pass</span>
                </button>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto bg-slate-900 text-white font-black px-8 py-3 rounded-2xl text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Stepper Controls */}
        {step < 6 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1 bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmBooking}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer bg-linear-to-r from-[#10B981] to-[#0D9488] hover:opacity-95 text-white"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Booking...</span>
                  </span>
                ) : paymentModeChoice === 'CASH' ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Confirm Booking (Pay Cash at OPD)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{feeAmount} with Razorpay</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>

      {/* DOCUMENT PREVIEW MODAL OVERLAY */}
      {previewFile && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0F4C81]" />
                <h4 className="font-extrabold text-sm text-slate-900 truncate">{previewFile.name}</h4>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 min-h-55 flex items-center justify-center overflow-hidden">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-64 object-contain rounded-lg" />
              ) : (
                <div className="text-center space-y-2">
                  <FileCheck className="w-12 h-12 text-[#0F4C81] mx-auto" />
                  <p className="text-xs font-bold text-slate-800">{previewFile.name}</p>
                  <p className="text-[11px] text-slate-500">PDF Document ({previewFile.sizeFormatted})</p>
                  <a 
                    href={previewFile.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-[#0F4C81] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
                  >
                    Open Document Link
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
