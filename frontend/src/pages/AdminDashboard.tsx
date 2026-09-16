import React, { useState } from 'react';
import { 
  Building2, 
  Settings, 
  Search, 
  Plus, 
  UserPlus, 
  Trash2, 
  DollarSign, 
  Stethoscope, 
  Phone, 
  MapPin, 
  X, 
  FileText,
  Clock,
  Lock,
  ShieldCheck,
  Mail,
  SearchX,
  Loader2
} from 'lucide-react';
import { useApp, DEFAULT_DOCTOR_AVATAR } from '../context/AppContext';
import { useEffect } from 'react';
import { api } from '../services/api';
import type { DoctorUser, Clinic, CareService, DeskStaffUser } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/ui/CustomSelect';

export const AdminDashboard: React.FC = () => {
  const { 
    clinics, 
    doctors, 
    appointments, 
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addClinic,
    updateClinic,
    deleteClinic,
    deskStaffMembers,
    addDeskStaffMember,
    updateDeskStaffMember,
    deleteDeskStaffMember,
    isAdminAuthenticated,
    openAdminAuthModal,
    activeRole,
    careServices,
    addCareService,
    updateCareService,
    deleteCareService,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANCHES' | 'DOCTORS' | 'STAFF' | 'REVENUE' | 'EMR' | 'CARE_SERVICES'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Doctor Form Modal State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorUser | null>(null);
  const [doctorPhotoFile, setDoctorPhotoFile] = useState<File | null>(null);
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General Physician & Diabetologist',
    qualification: 'MD (Internal Medicine)',
    experienceYears: 10,
    regNumber: 'MPMC-2026-999',
    consultationFeeClinic: 300,
    consultationFeeOnline: 450,
    bio: 'Dedicated medical specialist with extensive clinical experience.',
    clinicsCovered: ['sarangpur', 'shujalpur', 'rajgarh'],
    languagesSpoken: ['Hindi', 'English'],
    opdScheduleSummary: 'Mon-Sat: 09:00 AM - 02:00 PM',
    avatarUrl: DEFAULT_DOCTOR_AVATAR
  });

  // Desk Staff Form Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DeskStaffUser | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: 'sarangpur'
  });

  // Credentials Dispatcher Modal State
  const [adminSuccessMessage, setAdminSuccessMessage] = useState('');
  const [adminErrorMessage, setAdminErrorMessage] = useState('');

  // Branch Form Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Clinic | null>(null);
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    fullName: '',
    city: '',
    address: '',
    phone: '',
    emergencyPhone: '',
    operatingHours: 'Mon-Sat: 08:00 AM - 08:00 PM',
    activeDoctorCount: 5,
    slotDurationMinutes: 15
  });

  // Care Services Form Modal State
  const [isCareServiceModalOpen, setIsCareServiceModalOpen] = useState(false);
  const [editingCareService, setEditingCareService] = useState<CareService | null>(null);
  const [careServiceFormData, setCareServiceFormData] = useState({
    name: '',
    description: '',
    category: 'PHARMACY' as 'PHARMACY' | 'DIAGNOSTICS' | 'LABORATORY' | 'WELLNESS',
    price: 0,
    doctorId: '',
    isActive: true
  });

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [revenueAudit, setRevenueAudit] = useState<any>(null);
  const [transactionRecords, setTransactionRecords] = useState<any[]>([]);
  const [emrLogs, setEmrLogs] = useState<any[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'doctor' | 'staff' | 'branch' | 'service'; id: string; label: string } | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated && activeRole === 'ADMIN') {
      const fetchAdminStats = async () => {
        try {
          const [statsRes, revRes, transRes, emrRes] = await Promise.all([
            api.get('/admin/dashboard-stats'),
            api.get('/admin/revenue-audit'),
            api.get('/admin/transactions'),
            api.get('/admin/emr-logs')
          ]);
          setDashboardStats(statsRes.data);
          setRevenueAudit(revRes.data);
          setTransactionRecords(transRes.data?.transactions || []);
          setEmrLogs(emrRes.data?.logs || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchAdminStats();
    }
  }, [isAdminAuthenticated, activeRole, doctors.length, clinics.length, appointments.length, deskStaffMembers.length]);

  // Revenue metrics
  const totalRevenue = revenueAudit?.totalGrossRevenue || 0;
  const onlineRevenue = revenueAudit?.onlineCollections || 0;
  const cashRevenue = revenueAudit?.offlineCash || 0;
  const totalConsultations = dashboardStats?.totalConsultations ?? appointments.length;
  const totalDoctors = dashboardStats?.activeDoctorsCount ?? doctors.length;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    if (item.type === 'doctor') await deleteDoctor(item.id);
    if (item.type === 'staff') await deleteDeskStaffMember(item.id);
    if (item.type === 'branch') await deleteClinic(item.id);
    if (item.type === 'service') await deleteCareService(item.id);
  };

  const filteredEMR = emrLogs.filter(a => 
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.patientPhone?.includes(searchTerm) ||
    a.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAssignedBranches = (clinicsCovered?: string[], clinicsList: Clinic[] = []): string => {
    if (!clinicsCovered || !Array.isArray(clinicsCovered) || clinicsCovered.length === 0) return 'No Assigned Branch';
    const cleanIds = Array.from(new Set(
      clinicsCovered.map(item => String(item || '').toLowerCase().replace(/\s*branch\s*/i, '').trim()).filter(Boolean)
    ));
    const names = cleanIds.map(cId => {
      const found = clinicsList.find(c => {
        const cIdClean = c.id.toLowerCase().replace(/\s*branch\s*/i, '').trim();
        const cNameClean = c.name.toLowerCase().replace(/\s*branch\s*/i, '').trim();
        const cCityClean = (c.city || '').toLowerCase().replace(/\s*branch\s*/i, '').trim();
        return cIdClean === cId || cNameClean === cId || (cCityClean && cCityClean === cId);
      });
      if (found) return found.name.includes('Branch') ? found.name : `${found.name} Branch`;
      if (cId === 'sarangpur') return 'Sarangpur Branch';
      if (cId === 'shujalpur') return 'Shujalpur Branch';
      if (cId === 'rajgarh') return 'Rajgarh Branch';
      return cId.charAt(0).toUpperCase() + cId.slice(1) + ' Branch';
    });
    const uniqueNames = Array.from(new Set(names));
    return uniqueNames.length > 0 ? uniqueNames.join(', ') : 'No Assigned Branch';
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Doctor Modal for Add / Edit
  const openDoctorModal = (doc?: DoctorUser) => {
    if (doc) {
      setEditingDoctor(doc);

      let initialClinics: string[] = [];
      if (Array.isArray(doc.clinicsCovered) && doc.clinicsCovered.length > 0) {
        initialClinics = [...doc.clinicsCovered];
      } else if (typeof (doc as any).clinicsCovered === 'string' && ((doc as any).clinicsCovered as string).trim()) {
        try {
          const parsed = JSON.parse((doc as any).clinicsCovered);
          if (Array.isArray(parsed) && parsed.length > 0) initialClinics = parsed;
          else initialClinics = ((doc as any).clinicsCovered as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        } catch {
          initialClinics = ((doc as any).clinicsCovered as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } else if ((doc as any).clinicId) {
        initialClinics = [(doc as any).clinicId];
      } else if ((doc as any).branch) {
        initialClinics = [(doc as any).branch];
      }

      if (initialClinics.length === 0) {
        initialClinics = ['sarangpur'];
      }

      setDoctorFormData({
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        specialization: doc.specialization || '',
        qualification: doc.qualification || '',
        experienceYears: doc.experienceYears || 0,
        regNumber: doc.regNumber || '',
        consultationFeeClinic: doc.consultationFeeClinic || 0,
        consultationFeeOnline: doc.consultationFeeOnline || 0,
        bio: doc.bio || '',
        clinicsCovered: initialClinics,
        languagesSpoken: doc.languagesSpoken || ['Hindi', 'English'],
        opdScheduleSummary: doc.opdScheduleSummary || 'Mon-Sat: 09:00 AM - 02:00 PM',
        avatarUrl: doc.avatarUrl || DEFAULT_DOCTOR_AVATAR
      });
      setDoctorPhotoFile(null);
    } else {
      setEditingDoctor(null);
      setDoctorFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experienceYears: '' as any,
        regNumber: '',
        consultationFeeClinic: '' as any,
        consultationFeeOnline: '' as any,
        bio: '',
        clinicsCovered: [],
        languagesSpoken: ['Hindi', 'English'],
        opdScheduleSummary: '',
        avatarUrl: DEFAULT_DOCTOR_AVATAR
      });
      setDoctorPhotoFile(null);
    }
    setIsDoctorModalOpen(true);
  };

  // Save Doctor Submit
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mandatory 10-digit Indian Mobile Number Validation
    const cleanPhone = doctorFormData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setAdminErrorMessage('Mandatory: Please enter a valid 10-digit Indian mobile number (e.g. 9826012345)');
      return;
    }

    const doctorEmail = doctorFormData.email || `dr.${doctorFormData.name.toLowerCase().replace(/[^a-z]/g, '')}@sevasadanclinic.in`;

    const formData = new FormData();
    formData.append('name', doctorFormData.name);
    formData.append('email', doctorEmail);
    formData.append('phone', cleanPhone);
    formData.append('specialization', doctorFormData.specialization);
    formData.append('qualifications', doctorFormData.qualification);
    formData.append('regNumber', doctorFormData.regNumber);
    formData.append('consultationFee', doctorFormData.consultationFeeClinic.toString());
    formData.append('videoFee', doctorFormData.consultationFeeOnline.toString());
    formData.append('clinicalBio', doctorFormData.bio);
    formData.append('experienceYears', String(doctorFormData.experienceYears));
    formData.append('opdScheduleSummary', doctorFormData.opdScheduleSummary);
    formData.append('languagesSpoken', JSON.stringify(doctorFormData.languagesSpoken));
    formData.append('clinicsCovered', JSON.stringify(doctorFormData.clinicsCovered));
    if (doctorPhotoFile) formData.append('profilePhoto', doctorPhotoFile);

    setIsFormSubmitting(true);
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, formData);
        setAdminSuccessMessage('Doctor profile updated successfully.');
        setIsDoctorModalOpen(false);
      } else {
        await addDoctor(formData);
        setAdminSuccessMessage(`Roster added successfully. Doctor login details were sent to ${doctorEmail}.`);
        setIsDoctorModalOpen(false);
      }
    } catch (error) {
      setAdminErrorMessage(error instanceof Error ? error.message : 'Unable to save doctor profile.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Open Staff Modal for Add / Edit
  const openStaffModal = (staff?: DeskStaffUser) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        branchId: staff.branchId || 'sarangpur'
      });
    } else {
      setEditingStaff(null);
      setStaffFormData({
        name: '',
        email: '',
        phone: '',
        branchId: ''
      });
    }
    setIsStaffModalOpen(true);
  };

  // Save Desk Staff Submit
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory 10-digit Indian Mobile Number Validation
    const cleanPhone = staffFormData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setAdminErrorMessage('Mandatory: Please enter a valid 10-digit Indian mobile number (e.g. 9826101234)');
      return;
    }

    const formData = new FormData();
    formData.append('name', staffFormData.name);
    formData.append('email', staffFormData.email);
    formData.append('phone', cleanPhone);
    formData.append('branch', staffFormData.branchId);

    setIsFormSubmitting(true);
    try {
      if (editingStaff) {
        await updateDeskStaffMember(editingStaff.id, formData);
        setAdminSuccessMessage('Desk Staff profile updated successfully.');
        setIsStaffModalOpen(false);
      } else {
        await addDeskStaffMember(formData);
        setAdminSuccessMessage(`Staff member registered successfully. Credentials sent to ${staffFormData.email}.`);
        setIsStaffModalOpen(false);
      }
    } catch (error) {
      setAdminErrorMessage(error instanceof Error ? error.message : 'Unable to save staff member.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Open Branch Modal for Add / Edit
  const openBranchModal = (clinic?: Clinic) => {
    if (clinic) {
      setEditingBranch(clinic);
      setBranchFormData({
        name: clinic.name || '',
        fullName: clinic.fullName || clinic.name || '',
        city: clinic.city || '',
        address: clinic.address || '',
        phone: clinic.phone || (clinic as any).receptionPhone || '',
        emergencyPhone: clinic.emergencyPhone || '1800-7382-723',
        operatingHours: clinic.operatingHours || 'Mon-Sat: 08:00 AM - 08:00 PM',
        activeDoctorCount: clinic.activeDoctorCount || 5,
        slotDurationMinutes: clinic.slotDurationMinutes || 15
      });
    } else {
      setEditingBranch(null);
      setBranchFormData({
        name: '',
        fullName: '',
        city: '',
        address: '',
        phone: '',
        emergencyPhone: '',
        operatingHours: '',
        activeDoctorCount: 0,
        slotDurationMinutes: 15
      });
    }
    setIsBranchModalOpen(true);
  };

  // Save Branch Submit
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    try {
      if (editingBranch) {
        await updateClinic(editingBranch.id, branchFormData);
      } else {
        await addClinic({
          name: branchFormData.name,
          fullName: branchFormData.fullName,
          city: branchFormData.city,
          state: 'Madhya Pradesh',
          pincode: '465681',
          coordinates: { lat: 23.5976, lng: 76.6049 },
          address: branchFormData.address,
          phone: branchFormData.phone,
          email: 'info@sevasadanclinic.org',
          emergencyHelpline: '1800-7382-723',
          googleMapEmbedUrl: 'https://www.google.com/maps',
          imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800',
          emergencyPhone: branchFormData.emergencyPhone,
          operatingHours: branchFormData.operatingHours,
          activeDoctorCount: Number(branchFormData.activeDoctorCount),
          slotDurationMinutes: Number(branchFormData.slotDurationMinutes)
        });
      }
      setIsBranchModalOpen(false);
    } catch (error) {
      setAdminErrorMessage(error instanceof Error ? error.message : 'Unable to save branch.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Open Care Service Modal
  const openCareServiceModal = (service?: CareService) => {
    if (service) {
      setEditingCareService(service);
      setCareServiceFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        price: service.price,
        doctorId: service.doctorId,
        isActive: service.isActive
      });
    } else {
      setEditingCareService(null);
      setCareServiceFormData({
        name: '',
        description: '',
        category: '' as any,
        price: '' as any,
        doctorId: '',
        isActive: true
      });
    }
    setIsCareServiceModalOpen(true);
  };

  // Save Care Service Submit
  const handleCareServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    try {
      if (editingCareService) {
        await updateCareService(editingCareService.id, careServiceFormData);
      } else {
        await addCareService(careServiceFormData);
      }
      setIsCareServiceModalOpen(false);
    } catch (error) {
      setAdminErrorMessage(error instanceof Error ? error.message : 'Unable to save service.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  if (!isAdminAuthenticated || activeRole !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-slate-950/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Restricted Area
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Admin Email Authentication Required
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
              Access to the Central Hospital Administration Console is restricted. Please authenticate with your authorized hospital admin email ID and password.
            </p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Mail className="w-4 h-4 text-[#0F4C81]" />
              <span>Official Admin Mail Verification</span>
            </div>
            <p className="text-slate-500 text-[11px] font-medium">
              Authorized domain accounts (<code className="text-[#0F4C81] font-bold">@sevasadanclinic.in</code>) with 2FA email verification.
            </p>
          </div>

          <button
            onClick={openAdminAuthModal}
            className="w-full bg-[#0B2545] hover:bg-[#0F4C81] text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <span>Login with Admin Email</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {adminSuccessMessage && <div role="status" className="fixed right-6 top-24 z-99999 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 shadow-2xl">{adminSuccessMessage}<button onClick={() => setAdminSuccessMessage('')} className="ml-4 text-emerald-600 underline">Close</button></div>}
      {adminErrorMessage && <div role="alert" className="fixed right-6 top-24 z-99999 max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800 shadow-2xl">{adminErrorMessage}<button onClick={() => setAdminErrorMessage('')} className="ml-4 text-rose-600 underline">Close</button></div>}
      
      {/* Admin Header Banner - Dusty Terracotta (#9A5B3C -> #B37046) */}
      <div className="bg-gradient-to-r from-[#9A5B3C] via-[#B37046] to-[#9A5B3C] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-white/20 font-sans">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[rgba(255,255,255,0.15)] text-white font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-md">
              {language === 'en' ? 'Central Control Console' : 'सेंट्रल कंट्रोल कंसोल'}
            </span>
            <span className="text-xs text-white/90 font-medium">
              {language === 'en' ? 'SEVASADAN Multi-Branch Network Admin' : 'सेवासदन मल्टी-ब्रांच नेटवर्क एडमिन'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white mt-2">
            {language === 'en' ? 'Administrative Management Hub' : 'प्रशासनिक प्रबंधन हब'}
          </h1>
          <p className="text-xs text-white/85 mt-1 max-w-xl font-medium">
            {language === 'en'
              ? 'Manage hospital branches, doctor profiles, consultation fee structures, live OPD tokens, and financial revenue.'
              : 'अस्पताल शाखाओं, डॉक्टर प्रोफाइल, ओपीडी टोकन, और वित्तीय राजस्व का प्रबंधन करें।'}
          </p>
        </div>

        {/* Tab Navigation Segment - Segmented Pill Control */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[rgba(255,255,255,0.15)] backdrop-blur-md p-1.5 rounded-2xl border border-white/25 text-xs font-heading font-bold w-full lg:w-auto">
          {(['OVERVIEW', 'BRANCHES', 'DOCTORS', 'STAFF', 'CARE_SERVICES', 'REVENUE', 'EMR'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#7E452B] text-white font-extrabold border border-white/20 shadow-sm' 
                  : 'text-white/85 hover:text-white hover:bg-[rgba(255,255,255,0.12)] font-semibold'
              }`}
            >
              {tab === 'OVERVIEW' && (language === 'en' ? 'Overview' : 'अवलोकन')}
              {tab === 'BRANCHES' && (language === 'en' ? 'Branches & OPD' : 'शाखाएं एवं ओपीडी')}
              {tab === 'DOCTORS' && (language === 'en' ? 'Doctors Roster' : 'डॉक्टर सूची')}
              {tab === 'STAFF' && (language === 'en' ? 'Desk Staff' : 'डेस्क स्टाफ')}
              {tab === 'CARE_SERVICES' && (language === 'en' ? 'Lab & Care Services' : 'लैब एवं सेवाएं')}
              {tab === 'REVENUE' && (language === 'en' ? 'Revenue Audit' : 'राजस्व ऑडिट')}
              {tab === 'EMR' && (language === 'en' ? 'EMR Logs' : 'ईएमआर लॉग्स')}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 font-sans">
          
          {/* Key Stat Cards - Muted Purposeful Icon Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Total Network Revenue' : 'कुल नेटवर्क राजस्व'}</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-heading font-extrabold text-[#0B2545]">₹{totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-semibold">
                <span className="text-emerald-700">{language === 'en' ? 'Online' : 'ऑनलाइन'}: ₹{onlineRevenue}</span>
                <span>•</span>
                <span className="text-amber-700">{language === 'en' ? 'Cash' : 'नकद'}: ₹{cashRevenue}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Total Consultations' : 'कुल परामर्श'}</span>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0F4C81] border border-sky-200/60 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-heading font-extrabold text-emerald-600">{totalConsultations}</p>
              <p className="text-xs text-slate-500 font-medium">{language === 'en' ? 'In-Clinic Tokens & Digital Video OPDs' : 'ओपीडी टोकन और डिजिटल वीडियो परामर्श'}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Active Hospital Branches' : 'सक्रिय अस्पताल शाखाएं'}</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-heading font-extrabold text-amber-600">{clinics.length}</p>
              <p className="text-xs text-slate-500 font-medium truncate">
                {clinics.length > 0 ? clinics.map(c => language === 'en' ? c.name : (c.nameHi || c.name)).join(', ') : (language === 'en' ? 'No branches registered yet' : 'कोई शाखा पंजीकृत नहीं')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Board Certified Doctors' : 'प्रमाणित विशेषज्ञ डॉक्टर'}</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-heading font-extrabold text-purple-600">{totalDoctors}</p>
              <p className="text-xs text-slate-500 font-medium">
                {doctors.length > 0 ? (language === 'en' ? `${new Set(doctors.map(d => d.specialization)).size} Medical Specializations` : `${new Set(doctors.map(d => d.specialization)).size} चिकित्सा विशेषज्ञताएँ`) : (language === 'en' ? 'No doctors added yet' : 'कोई डॉक्टर नहीं')}
              </p>
            </div>

          </div>

          {/* Quick Admin Actions & Management Links - Unified Button Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shrink-0">
                      <Stethoscope className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-heading font-extrabold text-sm lg:text-base text-slate-900 leading-snug">{language === 'en' ? 'Doctors Management' : 'डॉक्टर प्रबंधन'}</h3>
                  </div>
                  <button
                    onClick={() => openDoctorModal()}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{language === 'en' ? 'Add Doctor' : 'डॉक्टर जोड़ें'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {language === 'en'
                    ? 'Quickly add, edit credentials, adjust clinic consultation fees, or assign doctors to registered hospital OPD branches.'
                    : 'डॉक्टरों को जोड़ें, क्रेडेंशियल संपादित करें, परामर्श शुल्क और शाखाएं आवंटित करें।'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('DOCTORS')}
                  className="w-full bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60 font-heading font-extrabold py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1"
                >
                  <span>{language === 'en' ? `Manage All ${totalDoctors} Doctors & Roster` : `सभी ${totalDoctors} डॉक्टर एवं रोस्टर प्रबंधित करें`}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-heading font-extrabold text-sm lg:text-base text-slate-900 leading-snug">{language === 'en' ? 'Branches Management' : 'शाखा प्रबंधन'}</h3>
                  </div>
                  <button
                    onClick={() => openBranchModal()}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'en' ? 'Add Branch' : 'शाखा जोड़ें'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {language === 'en'
                    ? 'Configure physical OPD operating hours, helpline numbers, address details, and slot interval timings for each hospital branch.'
                    : 'प्रत्येक अस्पताल शाखा के ओपीडी समय, हेल्पलाइन नंबर, पते और स्लॉट समय को कॉन्फ़िगर करें।'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('BRANCHES')}
                  className="w-full bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60 font-heading font-extrabold py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1"
                >
                  <span>{language === 'en' ? `Manage All ${clinics.length} Branches & Timings` : `सभी ${clinics.length} शाखाएं एवं समय प्रबंधित करें`}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-extrabold text-sm lg:text-base text-slate-900 leading-snug">{language === 'en' ? 'Care Services & Lab' : 'देखभाल सेवाएं एवं लैब'}</h3>
                  </div>
                  <button
                    onClick={() => openCareServiceModal()}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'en' ? 'Add Service' : 'सेवा जोड़ें'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {language === 'en'
                    ? 'Publish laboratory tests, pathology packages, diagnostics, and pharmacy items available to patients across the network.'
                    : 'प्रयोगशाला परीक्षण, पैथोलॉजी पैकेज, डायग्नोस्टिक्स और फार्मेसी वस्तुओं को प्रबंधित करें।'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('CARE_SERVICES')}
                  className="w-full bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60 font-heading font-extrabold py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1"
                >
                  <span>{language === 'en' ? `Manage All ${careServices.length} Lab & Care Services` : `सभी ${careServices.length} लैब एवं सेवाएं प्रबंधित करें`}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

          </div>

          {/* Branch Revenue Breakdown Cards */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0F4C81] flex items-center justify-center border border-sky-100 shrink-0">
                <Building2 className="w-5 h-5 text-[#0F4C81]" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  {language === 'en' ? 'Branch Revenue & OPD Performance Overview' : 'शाखा राजस्व एवं ओपीडी प्रदर्शन अवलोकन'}
                </h3>
                <p className="text-xs font-sans text-slate-500 font-medium">{language === 'en' ? 'Real-time revenue metrics, consultation volumes, and slot duration intervals across branches.' : 'सभी शाखाओं में रीयल-टाइम राजस्व डेटा, परामर्श संख्या और स्लॉट समय।'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clinics.map(c => {
                const branchAppts = appointments.filter(a => a.clinicId === c.id);
                const branchRev = branchAppts.reduce((acc, a) => acc + (a.paymentStatus === 'SUCCESS' ? a.amountPaid : 0), 0);
                const branchNameDisplay = language === 'en' ? c.name : (c.nameHi || (c.id === 'rajgarh' || c.name.toLowerCase().includes('rajgarh') ? 'राजगढ़ शाखा' : (c.id === 'sarangpur' || c.name.toLowerCase().includes('sarangpur') ? 'सारंगपुर शाखा' : (c.id === 'shujalpur' || c.name.toLowerCase().includes('shujalpur') ? 'शुजालपुर शाखा' : c.name.replace(/Branch/i, 'शाखा')))));

                return (
                  <div key={c.id} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-3.5 hover:border-slate-300 transition duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-extrabold text-slate-900 text-sm">{branchNameDisplay}</h4>
                      <span className="text-[10px] font-heading bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {language === 'en' ? 'Operational' : 'सक्रिय'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-sans">
                      <p className="flex justify-between text-slate-600">
                        <span>{language === 'en' ? 'Total Revenue:' : 'कुल राजस्व:'}</span>
                        <strong className="font-heading text-[#0F4C81] font-extrabold text-sm">₹{branchRev.toLocaleString()}</strong>
                      </p>
                      <p className="flex justify-between text-slate-600">
                        <span>{language === 'en' ? 'Appointments Count:' : 'कुल अपॉइंटमेंट:'}</span>
                        <strong className="text-slate-900 font-bold">{branchAppts.length}</strong>
                      </p>
                      <p className="flex justify-between text-slate-600">
                        <span>{language === 'en' ? 'Doctors Assigned:' : 'आवंटित डॉक्टर:'}</span>
                        <strong className="text-slate-900 font-bold">{doctors.filter(d => {
                          if (!d.clinicsCovered || !Array.isArray(d.clinicsCovered)) return false;
                          const cKey = (c.city || c.name || c.id).toLowerCase().replace(/\s*branch\s*/i, '').trim();
                          return d.clinicsCovered.some(item => {
                            const clean = String(item).toLowerCase().replace(/\s*branch\s*/i, '').trim();
                            return clean === cKey || clean === c.id.toLowerCase() || clean === c.name.toLowerCase() || (c.city && clean === c.city.toLowerCase());
                          });
                        }).length}</strong>
                      </p>
                      <p className="flex justify-between text-slate-600 pt-2 border-t border-slate-200/80">
                        <span>{language === 'en' ? 'OPD Slot Interval:' : 'ओपीडी स्लॉट समय:'}</span>
                        <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">{c.slotDurationMinutes} {language === 'en' ? 'mins' : 'मिनट'}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. BRANCHES MANAGEMENT TAB */}
      {activeTab === 'BRANCHES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900">Hospital Branches & OPD Schedules</h3>
              <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">Add new physical hospital branches, configure slot duration intervals, and emergency phone lines.</p>
            </div>
            <button
              onClick={() => openBranchModal()}
              className="bg-amber-500 hover:bg-amber-600 text-white font-heading font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {clinics.map(c => (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Top Deep Navy Hospital Header Banner */}
                <div className="bg-gradient-to-r from-[#0B2545] via-[#0F4C81] to-[#0A2540] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm backdrop-blur-md">
                      <Building2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-heading font-extrabold text-white text-lg sm:text-xl tracking-tight">{c.fullName || c.name}</h4>
                        <span className="text-[11px] font-heading font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {c.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-extrabold bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>OPERATIONAL</span>
                        </span>
                      </div>
                      <p className="text-xs font-sans text-sky-100/80 font-medium mt-0.5">Primary Multi-Specialty Hospital & OPD Clinic Branch in {c.city}, MP</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => openBranchModal(c)}
                      className="bg-white/15 hover:bg-white text-white hover:text-[#0B2545] border border-white/30 font-heading font-extrabold px-4 py-2 rounded-xl text-xs flex items-center transition cursor-pointer shadow-sm"
                    >
                      <span>Edit Branch</span>
                    </button>
                    {clinics.length > 1 && (
                      <button
                        onClick={() => setPendingDelete({ type: 'branch', id: c.id, label: c.name })}
                        className="bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-400/30 font-heading font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:border-sky-300 transition">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0F4C81] flex items-center justify-center border border-sky-100">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">{language === 'en' ? 'Clinic Address' : 'क्लिनिक का पता'}</span>
                    </div>
                    <p className="text-xs font-sans font-bold text-slate-800 line-clamp-2 leading-relaxed">{language === 'en' ? `${c.address}, ${c.city}` : (c.addressHi || c.address)}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:border-emerald-300 transition">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">{language === 'en' ? 'Helpline & Desk' : 'हेल्पलाइन एवं पूछताछ'}</span>
                    </div>
                    <p className="text-xs font-sans font-extrabold text-slate-900">Rec: {c.phone || (c as any).receptionPhone || '+91 73827 23000'}</p>
                    <p className="text-[10px] font-sans font-bold text-rose-600">24x7 Emerg: {c.emergencyPhone || '1800-7382-723'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:border-amber-300 transition">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">{language === 'en' ? 'OPD Timings' : 'ओपीडी समय'}</span>
                    </div>
                    <p className="text-xs font-sans font-bold text-slate-800">{c.operatingHours || 'Mon-Sat: 08:00 AM - 08:00 PM'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:border-purple-300 transition">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">{language === 'en' ? 'Slot Interval' : 'स्लॉट समय'}</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-purple-700 bg-purple-50 inline-block px-2.5 py-1 rounded-lg border border-purple-200">
                      {c.slotDurationMinutes ?? (c as any).opdSlotInterval ?? 15} {language === 'en' ? 'mins / token' : 'मिनट / टोकन'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DOCTORS ROSTER MANAGEMENT TAB */}
      {activeTab === 'DOCTORS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900">Doctor Roster & Credentials Management</h3>
              <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">Add doctors, edit consultation fees, medical council registration, and clinic assignments.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter doctor name or specialty..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={() => openDoctorModal()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-heading font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full py-12 px-4 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-amber-200">
                  <SearchX className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-extrabold text-slate-900 text-base">Search Not Found</h4>
                <p className="text-xs font-sans text-slate-500 max-w-sm mx-auto font-medium">
                  {searchTerm ? `No doctor matches your search term "${searchTerm}". Please try a different doctor name or specialty.` : 'No doctor records found.'}
                </p>
              </div>
            ) : (
              filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/70 flex flex-col justify-between gap-4 hover:border-slate-300 transition duration-200">
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={doc.avatarUrl || DEFAULT_DOCTOR_AVATAR}
                          alt={doc.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                        />
                        <div>
                          <h4 className="font-heading font-extrabold text-slate-900 text-base">{doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}</h4>
                          <p className="text-xs font-heading font-extrabold text-amber-700">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.regNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans bg-white p-3 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">In-Clinic Fee:</span>
                        <p className="font-heading font-extrabold text-slate-900 text-sm">₹{doc.consultationFeeClinic}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Video Consult Fee:</span>
                        <p className="font-heading font-extrabold text-emerald-600 text-sm">₹{doc.consultationFeeOnline}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Qualification:</span>
                        <p className="font-bold text-slate-800 truncate">{doc.qualification}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Experience:</span>
                        <p className="font-bold text-slate-800">{doc.experienceYears} Years</p>
                      </div>
                    </div>

                    <div className="text-xs font-sans text-slate-600">
                      <strong className="text-slate-800 font-bold">Assigned OPD Branches: </strong>
                      <span className="font-semibold text-amber-800">
                        {formatAssignedBranches(doc.clinicsCovered, clinics)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => openDoctorModal(doc)}
                      className="flex-1 bg-white hover:bg-slate-100 text-amber-800 border border-amber-300 font-heading font-extrabold py-2 rounded-xl text-xs flex items-center justify-center transition cursor-pointer"
                    >
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => setPendingDelete({ type: 'doctor', id: doc.id, label: `Dr. ${doc.name}` })}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-heading font-bold p-2 rounded-xl text-xs transition cursor-pointer"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CARE SERVICES & LAB TESTS MANAGEMENT TAB */}
      {activeTab === 'CARE_SERVICES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                Laboratory & Hospital Services Catalog
              </span>
              <h3 className="text-2xl font-heading font-extrabold text-slate-900 mt-1">Care Services & Lab Tests Management</h3>
              <p className="text-xs font-sans text-slate-500 font-medium">
                Create, edit, and publish diagnostic tests, pathology packages, and pharmacy items available to patients.
              </p>
            </div>

            <button
              onClick={() => openCareServiceModal()}
              className="bg-amber-500 hover:bg-amber-600 text-white font-heading font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Test / Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careServices.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-sans font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-heading font-extrabold text-slate-800 text-sm">No Care Services / Lab Tests Added Yet</p>
                <p className="text-xs text-slate-500 mt-1">Click "Add New Test / Service" above to publish lab tests and diagnostics.</p>
              </div>
            ) : (
              careServices.map(service => (
                <div key={service.id} className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/70 flex flex-col justify-between gap-4 hover:border-slate-300 transition duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                        service.category === 'LABORATORY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        service.category === 'DIAGNOSTICS' ? 'bg-sky-50 text-[#0F4C81] border-sky-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {service.category}
                      </span>
                      <span className="text-base font-heading font-extrabold text-[#0F4C81]">₹{service.price}</span>
                    </div>

                    <h4 className="font-heading font-extrabold text-slate-900 text-base">{service.name}</h4>
                    <p className="text-xs font-sans text-slate-500 line-clamp-2 leading-relaxed">{service.description || 'No description provided'}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => openCareServiceModal(service)}
                      className="flex-1 bg-white hover:bg-slate-100 text-[#0F4C81] border border-[#0F4C81]/30 font-heading font-extrabold py-2 rounded-xl text-xs flex items-center justify-center transition cursor-pointer"
                    >
                      <span>Edit Service</span>
                    </button>

                    <button
                      onClick={() => setPendingDelete({ type: 'service', id: service.id, label: service.name })}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-heading font-bold p-2 rounded-xl text-xs transition cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. REVENUE AUDIT TAB */}
      {activeTab === 'REVENUE' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-heading font-extrabold text-xl text-slate-900">Financial Revenue & Payment Audit</h3>
            <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">Breakdown of online gateway collections (Razorpay/UPI) versus counter cash transactions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-heading font-extrabold text-emerald-800 uppercase tracking-wider">Total Gross Revenue</span>
              <p className="text-3xl font-heading font-extrabold text-emerald-700">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs font-sans text-emerald-700 font-medium">100% Reconciliation Complete</p>
            </div>

            <div className="bg-sky-50/70 border border-sky-200/80 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-heading font-extrabold text-[#0F4C81] uppercase tracking-wider">Online Digital Collections</span>
              <p className="text-3xl font-heading font-extrabold text-[#0F4C81]">₹{onlineRevenue.toLocaleString()}</p>
              <p className="text-xs font-sans text-sky-700 font-medium">Razorpay, UPI & NetBanking</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-heading font-extrabold text-amber-800 uppercase tracking-wider">OPD Counter Cash</span>
              <p className="text-3xl font-heading font-extrabold text-amber-700">₹{cashRevenue.toLocaleString()}</p>
              <p className="text-xs font-sans text-amber-700 font-medium">In-Clinic Token Desk Collections</p>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="space-y-4">
            <h4 className="font-heading font-extrabold text-sm text-slate-900">Detailed Transaction Records ({transactionRecords.length})</h4>
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-700 font-heading font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Payment ID</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Doctor</th>
                    <th className="p-3.5">Branch</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactionRecords.map(p => {
                    const rawName = p.patientName?.trim();
                    const displayPatientName = rawName || (p.patientPhone ? `Patient (${p.patientPhone})` : 'N/A');

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono font-bold text-[#0F4C81]">{p.paymentId}</td>
                        <td className="p-3.5 font-bold text-slate-900">{displayPatientName}</td>
                        <td className="p-3.5 text-slate-700">{p.doctorName}</td>
                        <td className="p-3.5 text-slate-600">{p.branchName}</td>
                        <td className="p-3.5 font-semibold">{p.method}</td>
                        <td className="p-3.5 font-heading font-extrabold text-emerald-700">₹{p.amount}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full border ${
                            p.status === 'PAID' || p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {transactionRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium font-sans">
                        No transaction records available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMR AUDIT LOG TAB */}
      {activeTab === 'EMR' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900">Searchable EMR Audit Log</h3>
              <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">Real-time tracking of all patient OPD registrations and video room tokens.</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, token, doctor..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-700 font-heading font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Token #</th>
                  <th className="p-3.5">Patient Name</th>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEMR.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-[#0F4C81]">{a.tokenNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{a.patientName} ({a.patientPhone})</td>
                    <td className="p-3.5 text-slate-700">{a.doctorName}</td>
                    <td className="p-3.5 text-slate-600">{a.branchName}</td>
                    <td className="p-3.5 font-semibold">{a.mode}</td>
                    <td className="p-3.5 font-heading font-extrabold text-emerald-700">₹{a.amount || 0}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEMR.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium font-sans">
                      No EMR audit log records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCTOR ADD / EDIT MODAL */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#0F4C81]" />
                <span>{editingDoctor ? `Edit Profile: ${editingDoctor.name}` : 'Add New Doctor to Roster'}</span>
              </h3>
              <button onClick={() => setIsDoctorModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={doctorFormData.experienceYears}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorFormData.name}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="Dr. Full Name"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor Official Email * (For Credentials)</label>
                  <input
                    type="email"
                    required
                    value={doctorFormData.email}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#9A5B3C] focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="dr.name@sevasadanclinic.in"
                  />
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Protected login credentials will be emailed to this address.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Mobile Number * (10-digit Indian)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={doctorFormData.phone}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="98260XXXXX"
                  />
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Mandatory 10-digit number starting with 6-9.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={doctorFormData.specialization}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. Pediatrics & Child Specialist"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    value={doctorFormData.qualification}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. MBBS, MD, DNB"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medical Reg Number</label>
                  <input
                    type="text"
                    required
                    value={doctorFormData.regNumber}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, regNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="MPMC-XXXXXX"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">In-Clinic Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={doctorFormData.consultationFeeClinic || ''}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationFeeClinic: e.target.value ? Number(e.target.value) : '' as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. 300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Video Tele-OPD Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={doctorFormData.consultationFeeOnline || ''}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationFeeOnline: e.target.value ? Number(e.target.value) : '' as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. 400"
                  />
                </div>
              </div>

              {/* Assigned Branch / Clinics Covered Selector */}
              <div className="space-y-1.5 bg-[#9A5B3C]/10 p-4 rounded-2xl border border-[#9A5B3C]/20">
                <label className="block font-heading font-extrabold text-slate-800 text-xs">
                  Assigned Clinic Branches * (Select hospital branches assigned to this doctor)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {clinics.map(c => {
                    const cIdClean = c.id.toLowerCase().replace(/\s*branch\s*/i, '').trim();
                    const cNameClean = c.name.toLowerCase().replace(/\s*branch\s*/i, '').trim();
                    const cCityClean = (c.city || '').toLowerCase().replace(/\s*branch\s*/i, '').trim();

                    const isChecked = doctorFormData.clinicsCovered.some(item => {
                      if (!item) return false;
                      const itemClean = String(item).toLowerCase().replace(/\s*branch\s*/i, '').trim();
                      return itemClean === cIdClean || 
                             itemClean === cNameClean || 
                             itemClean === cCityClean ||
                             cIdClean.includes(itemClean) ||
                             itemClean.includes(cIdClean);
                    });
                    return (
                      <label 
                        key={c.id} 
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          isChecked 
                            ? 'bg-[#9A5B3C] text-white border-[#9A5B3C] shadow-xs ring-2 ring-[#9A5B3C]/20' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated: string[];
                            if (e.target.checked) {
                              updated = Array.from(new Set([...doctorFormData.clinicsCovered, c.id]));
                            } else {
                              updated = doctorFormData.clinicsCovered.filter(item => {
                                if (!item) return false;
                                const itemClean = String(item).toLowerCase().replace(/\s*branch\s*/i, '').trim();
                                return itemClean !== cIdClean && itemClean !== cNameClean && itemClean !== cCityClean && !cIdClean.includes(itemClean) && !itemClean.includes(cIdClean);
                              });
                            }
                            setDoctorFormData({ ...doctorFormData, clinicsCovered: updated });
                          }}
                          className="w-4 h-4 rounded text-[#9A5B3C] focus:ring-[#9A5B3C] cursor-pointer"
                        />
                        <span>{c.name} ({c.city})</span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Doctors will only be shown to patients booking appointments for their assigned branches.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Bio & Achievements</label>
                <textarea
                  rows={3}
                  value={doctorFormData.bio}
                  onChange={(e) => setDoctorFormData({ ...doctorFormData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">OPD Schedule Summary</label>
                <input
                  type="text"
                  value={doctorFormData.opdScheduleSummary}
                  onChange={(e) => setDoctorFormData({ ...doctorFormData, opdScheduleSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  placeholder="Mon-Sat: 09:00 AM - 02:00 PM"
                />
              </div>

              {/* Single Doctor Image Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700">Upload Doctor Profile Photo (Single Image)</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="relative group w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-[#9A5B3C] shadow-xs">
                    <img 
                      src={doctorFormData.avatarUrl || DEFAULT_DOCTOR_AVATAR} 
                      alt="Doctor Avatar Preview" 
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DOCTOR_AVATAR; }}
                      className="w-full h-full object-cover" 
                    />
                    {doctorPhotoFile && (
                      <button 
                        type="button"
                        onClick={() => {
                          setDoctorPhotoFile(null);
                          setDoctorFormData({ ...doctorFormData, avatarUrl: '' });
                        }}
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDoctorPhotoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDoctorFormData({ ...doctorFormData, avatarUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-heading file:font-extrabold file:bg-[#9A5B3C] file:text-white hover:file:opacity-90 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Select a single JPG or PNG photo. If no custom image is selected, standard default doctor avatar is used.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-heading font-extrabold shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isFormSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESK STAFF MANAGEMENT TAB CONTENT */}
      {activeTab === 'STAFF' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900">Hospital Reception & Desk Staff</h2>
              <p className="text-xs font-sans text-slate-500 font-medium mt-0.5">Manage receptionists, desk operators, and dispatch email login credentials.</p>
            </div>
            <button
              onClick={() => openStaffModal()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Desk Staff</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-heading font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Member Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Login ID</th>
                    <th className="py-4 px-6">Assigned Branch</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {deskStaffMembers.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 font-heading font-extrabold flex items-center justify-center text-xs border border-amber-200 shrink-0">
                          {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="font-heading font-extrabold">{staff.name}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-amber-700">{staff.email}</td>
                      <td className="py-4 px-6 font-mono font-bold text-amber-900">{staff.loginId || staff.email}</td>
                      <td className="py-4 px-6">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-heading font-extrabold uppercase text-[10px]">
                          {clinics.find(c => c.id === staff.branchId)?.name || staff.branchId || 'Sarangpur'} Branch
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold">{staff.phone || 'N/A'}</td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStaffModal(staff)}
                          className="px-2.5 py-1 text-amber-700 hover:bg-amber-50 rounded-lg font-heading font-bold text-xs transition cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setPendingDelete({ type: 'staff', id: staff.id, label: staff.name })}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deskStaffMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No desk staff registered yet. Click 'Register New Desk Staff' to add staff.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT DESK STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span>{editingStaff ? `Edit Desk Staff: ${editingStaff.name}` : 'Register New Desk Staff'}</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="e.g. Anjali Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address * {editingStaff ? '(Read-only)' : '(For Credentials Email)'}</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingStaff)}
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="staff.name@sevasadanclinic.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#9A5B3C] focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none disabled:opacity-60"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Protected login credentials will be emailed to this inbox.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number * (10-digit Indian Mobile)</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="98261XXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Mandatory 10-digit number starting with 6-9.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Branch *</label>
                <CustomSelect
                  required
                  themeColor="orange"
                  value={staffFormData.branchId}
                  onChange={(val) => setStaffFormData({ ...staffFormData, branchId: val })}
                  placeholder="Select Option"
                  options={
                    clinics.length > 0
                      ? clinics.map(c => ({ value: c.id, label: `${c.name} Branch (${c.city})` }))
                      : [
                          { value: 'sarangpur', label: 'Sarangpur Branch' },
                          { value: 'shujalpur', label: 'Shujalpur Branch' },
                          { value: 'rajgarh', label: 'Rajgarh Branch' }
                        ]
                  }
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9A5B3C] to-[#B37046] hover:opacity-95 text-white font-heading font-extrabold shadow-md shadow-[#9A5B3C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isFormSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>{editingStaff ? 'Update Staff Member' : 'Register & Email Credentials'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRANCH ADD / EDIT MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>{editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New Hospital Branch'}</span>
              </h3>
              <button onClick={() => setIsBranchModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.name}
                    onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. Sarangpur Branch"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Clinic Title</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.fullName}
                    onChange={(e) => setBranchFormData({ ...branchFormData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="SEVASADAN Multi-Specialty Clinic"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.city}
                    onChange={(e) => setBranchFormData({ ...branchFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. Sarangpur"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reception Phone</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">24x7 Emergency Phone</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.emergencyPhone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, emergencyPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">OPD Slot Interval (Mins)</label>
                  <input
                    type="number"
                    required
                    value={branchFormData.slotDurationMinutes}
                    onChange={(e) => setBranchFormData({ ...branchFormData, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Hours *</label>
                <CustomSelect
                  required
                  themeColor="orange"
                  value={branchFormData.operatingHours}
                  onChange={(val) => setBranchFormData({ ...branchFormData, operatingHours: val })}
                  placeholder="Select Option"
                  options={[
                    { value: 'Mon-Sat: 08:00 AM - 08:00 PM', label: 'Mon-Sat: 08:00 AM - 08:00 PM' },
                    { value: 'Mon-Sat: 09:00 AM - 09:00 PM', label: 'Mon-Sat: 09:00 AM - 09:00 PM' },
                    { value: 'Mon-Sat: 08:00 AM - 02:00 PM', label: 'Mon-Sat: 08:00 AM - 02:00 PM' },
                    { value: 'Mon-Sat: 09:00 AM - 06:00 PM', label: 'Mon-Sat: 09:00 AM - 06:00 PM' },
                    { value: 'Mon-Sun: 24 Hours Emergency', label: 'Mon-Sun: 24 Hours Emergency' }
                  ]}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9A5B3C] to-[#B37046] hover:opacity-95 text-white font-heading font-extrabold shadow-md shadow-[#9A5B3C]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isFormSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Save Branch Configuration</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CARE SERVICE ADD / EDIT MODAL */}
      {isCareServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#9A5B3C]" />
                <span>{editingCareService ? `Edit Care Service` : 'Add New Care Service'}</span>
              </h3>
              <button onClick={() => setIsCareServiceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCareServiceSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={careServiceFormData.name}
                    onChange={(e) => setCareServiceFormData({ ...careServiceFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <CustomSelect
                    required
                    themeColor="orange"
                    value={careServiceFormData.category}
                    onChange={(val) => setCareServiceFormData({ ...careServiceFormData, category: val as any })}
                    placeholder="Select Option"
                    options={[
                      { value: 'PHARMACY', label: 'Pharmacy (Medicines)' },
                      { value: 'DIAGNOSTICS', label: 'Diagnostics (X-Ray, Scans)' },
                      { value: 'LABORATORY', label: 'Laboratory (Blood Tests)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={careServiceFormData.price || ''}
                    onChange={(e) => setCareServiceFormData({ ...careServiceFormData, price: e.target.value ? Number(e.target.value) : '' as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                    placeholder="e.g. 250"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Doctor/Pathologist *</label>
                  <CustomSelect
                    required
                    themeColor="orange"
                    value={careServiceFormData.doctorId}
                    onChange={(val) => setCareServiceFormData({ ...careServiceFormData, doctorId: val })}
                    placeholder="Select Option"
                    options={doctors.map(d => ({
                      value: d.id,
                      label: `${d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`} (${d.specialization})`
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={careServiceFormData.description}
                  onChange={(e) => setCareServiceFormData({ ...careServiceFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:ring-2 focus:ring-[#9A5B3C] focus:border-[#9A5B3C] outline-none"
                  placeholder="Service details, instructions, etc."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={careServiceFormData.isActive}
                  onChange={(e) => setCareServiceFormData({ ...careServiceFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#9A5B3C] border-slate-300 rounded focus:ring-[#9A5B3C] cursor-pointer"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">Service is active and available for booking</label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCareServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-heading font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9A5B3C] to-[#B37046] hover:opacity-95 text-white font-heading font-extrabold shadow-md shadow-[#9A5B3C]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
                >
                  {isFormSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{editingCareService ? 'Update Service' : 'Add Service'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Confirm deletion"
        message={pendingDelete ? `Remove ${pendingDelete.label}? This action will hide it from active records.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

    </div>
  );
};
