import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  AppUser, 
  UserRole, 
  Language, 
  Clinic, 
  DoctorUser, 
  Appointment, 
  Prescription, 
  PaymentRecord,
  PatientUser,
  AppointmentStatus,
  AppointmentMode,
  PatientType,
  PaymentMethod,
  HealthPackage,
  HealthBlog,
  DeskStaffUser,
  CareService,
  SpecialtyDetail
} from '../types';
import { 
  DEMO_PATIENTS,
  INITIAL_HEALTH_PACKAGES,
  INITIAL_HEALTH_BLOGS,
  SPECIALTIES_DATA
} from '../data/mockData';
import { api, getApiErrorMessage, saveAuthToken, AUTH_TOKEN_KEY } from '../services/api';
import defaultProfilePhoto from '../assets/images/Default_profile.webp';

interface AppContextType {
  currentUser: AppUser | null;
  activeRole: UserRole;
  language: Language;
  activeBranchId: string;
  clinics: Clinic[];
  doctors: DoctorUser[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  payments: PaymentRecord[];
  healthPackages: HealthPackage[];
  healthBlogs: HealthBlog[];
  isAuthModalOpen: boolean;
  isBookingModalOpen: boolean;
  isDoctorProfileModalOpen: boolean;
  selectedDoctorForProfile: DoctorUser | null;
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;
  selectedSpecialtyFilter: string;
  setSelectedSpecialtyFilter: (spec: string) => void;
  preselectedDoctorId?: string;
  preselectedClinicId?: string;
  preselectedMode?: AppointmentMode;
  isAdminAuthenticated: boolean;
  isAdminAuthModalOpen: boolean;
  isStaffAuthModalOpen: boolean;
  openAdminAuthModal: () => void;
  closeAdminAuthModal: () => void;
  openStaffAuthModal: () => void;
  closeStaffAuthModal: () => void;
  sendAdminOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  loginAdminWithEmail: (email: string, otpCode: string) => Promise<{ success: boolean; message?: string }>;
  sendPatientOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  loginWithPatientEmailOtp: (email: string, otp: string, role?: UserRole, name?: string) => Promise<{ user: AppUser; isNew: boolean }>;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
  setSessionFromAuth: (user: any, token: string) => void;
  createArticle: (data: any) => Promise<any>;
  updateArticle: (id: string, data: any) => Promise<any>;
  deleteArticle: (id: string) => Promise<void>;
  refreshArticles: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  setActiveBranchId: (branchId: string) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openBookingModal: (doctorId?: string, clinicId?: string, mode?: AppointmentMode) => void;
  closeBookingModal: () => void;
  openDoctorProfileModal: (doctorOrId: DoctorUser | string) => void;
  closeDoctorProfileModal: () => void;
  bookAppointment: (data: {
    doctorId: string;
    clinicId: string | null;
    appointmentMode: 'IN_CLINIC' | 'VIDEO';
    appointmentDate: string;
    timeSlot: string;
    patientNotes?: string;
    symptoms?: string[];
    paymentMethod: PaymentMethod;
    patientType: PatientType;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    documents?: File[];
    voiceNote?: File;
  }) => Promise<Appointment>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  createPrescription: (rxData: Omit<Prescription, 'id' | 'createdAt'>) => Promise<Prescription>;
  updateDoctor: (doctorId: string, updates: Partial<DoctorUser> | FormData) => Promise<void>;
  addDoctor: (formData: FormData) => Promise<DoctorUser>;
  deleteDoctor: (doctorId: string) => Promise<void>;
  addClinic: (clinicData: Omit<Clinic, 'id'>) => Promise<Clinic>;
  updateClinic: (clinicId: string, updates: Partial<Clinic>) => Promise<void>;
  deleteClinic: (clinicId: string) => Promise<void>;
  deskStaffMembers: DeskStaffUser[];
  addDeskStaffMember: (formData: FormData) => Promise<DeskStaffUser>;
  updateDeskStaffMember: (staffId: string, formData: FormData) => Promise<DeskStaffUser>;
  deleteDeskStaffMember: (staffId: string) => Promise<void>;
  loginWithEmailAndPassword: (emailOrLoginId: string, password: string) => Promise<{ success: boolean; user?: AppUser; message?: string }>;
  careServices: CareService[];
  addCareService: (data: any) => Promise<CareService>;
  updateCareService: (id: string, updates: any) => Promise<void>;
  deleteCareService: (id: string) => Promise<void>;
  specialties: SpecialtyDetail[];
  addSpecialty: (data: any) => Promise<SpecialtyDetail>;
  updateSpecialty: (id: string, updates: any) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string) => Promise<void>;
  findPatientById: (patientId: string) => Promise<Partial<PatientUser>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'SEVASADAN_STATE_V1';

export const DEFAULT_DOCTOR_AVATAR = defaultProfilePhoto;

const mapDoctor = (doctor: any): DoctorUser => {
  const customPhoto = doctor.profilePhoto || doctor.avatarUrl;
  const hasValidCustomPhoto = customPhoto && typeof customPhoto === 'string' && customPhoto.trim() !== '' && (customPhoto.startsWith('http') || customPhoto.startsWith('data:')) && !customPhoto.includes('hero-doctor') && !customPhoto.includes('default-avatar') && !customPhoto.includes('default_profile');

  let clinicsCovered: string[] = [];
  if (Array.isArray(doctor.clinicsCovered) && doctor.clinicsCovered.length > 0) {
    clinicsCovered = doctor.clinicsCovered;
  } else if (typeof doctor.clinicsCovered === 'string' && doctor.clinicsCovered.trim()) {
    try {
      const parsed = JSON.parse(doctor.clinicsCovered);
      if (Array.isArray(parsed) && parsed.length > 0) clinicsCovered = parsed;
      else clinicsCovered = doctor.clinicsCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
    } catch {
      clinicsCovered = doctor.clinicsCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (doctor.branch) {
    clinicsCovered = [doctor.branch];
  }

  if (clinicsCovered.length === 0) {
    const dName = String(doctor.name || '').toLowerCase();
    if (dName.includes('rahul')) {
      clinicsCovered = ['sarangpur', 'shujalpur', 'rajgarh'];
    } else if (dName.includes('ankur')) {
      clinicsCovered = ['rajgarh', 'sarangpur'];
    } else if (dName.includes('test')) {
      clinicsCovered = ['shujalpur', 'rajgarh'];
    } else {
      clinicsCovered = ['sarangpur', 'shujalpur'];
    }
  }

  return {
    ...doctor,
    id: doctor.id || doctor._id,
    userId: doctor.userId || doctor.id || doctor._id,
    qualification: doctor.qualification || doctor.qualifications || '',
    regNumber: doctor.regNumber || '',
    bio: doctor.bio || doctor.clinicalBio || '',
    avatarUrl: hasValidCustomPhoto ? customPhoto : DEFAULT_DOCTOR_AVATAR,
    clinicsCovered,
    consultationFeeOnline: Number(doctor.consultationFeeOnline ?? doctor.videoFee ?? 400),
    consultationFeeClinic: Number(doctor.consultationFeeClinic ?? doctor.consultationFee ?? 300),
    experienceYears: Number(doctor.experienceYears ?? 8),
    languagesSpoken: doctor.languagesSpoken || ['Hindi', 'English'],
    opdScheduleSummary: doctor.opdScheduleSummary || 'Mon-Sat: 09:00 AM - 02:00 PM',
    rating: Number(doctor.rating ?? 4.8),
    totalReviews: Number(doctor.totalReviews ?? 124),
    role: 'DOCTOR',
  };
};

const mapClinic = (clinic: any): Clinic => ({
  ...clinic,
  id: clinic.id || clinic._id,
  name: clinic.name || clinic.title || '',
  fullName: clinic.fullName || clinic.title || clinic.name || '',
  phone: clinic.phone || clinic.receptionPhone || '',
  emergencyPhone: clinic.emergencyPhone || '1800-7382-723',
  slotDurationMinutes: Number(clinic.slotDurationMinutes ?? clinic.opdSlotInterval ?? 15),
  coordinates: clinic.coordinates || { lat: 0, lng: 0 },
  status: clinic.status || 'ACTIVE',
});

const mapStaff = (staff: any): DeskStaffUser => ({
  id: staff.id || staff._id,
  name: staff.name || '',
  email: staff.email || '',
  loginId: staff.loginId || staff.email || staff.id || '',
  phone: staff.phone || '',
  branchId: staff.branch || staff.branchId || 'sarangpur',
  role: 'DESK_STAFF',
  createdAt: staff.createdAt || new Date().toISOString(),
});

const mapAppointment = (appointment: any, doctors: DoctorUser[], clinics: Clinic[]): Appointment => {
  const doctor = doctors.find(item => item.id === appointment.doctorId);
  const clinic = clinics.find(item => item.id === appointment.branchId);

  return {
    ...appointment,
    id: appointment.id || appointment._id,
    patientId: appointment.patientId,
    patientName: appointment.patient?.name || appointment.patientName || '',
    patientPhone: appointment.patient?.phone || appointment.patientPhone || '',
    patientAge: Number(appointment.patient?.age ?? appointment.patientAge ?? 0),
    patientGender: appointment.patient?.gender || appointment.patientGender || '',
    patientType: appointment.patientClassification || appointment.patientType || 'NEW',
    doctorName: appointment.doctor?.name || appointment.doctorName || doctor?.name || '',
    doctorSpecialization: appointment.doctor?.specialization || appointment.doctorSpecialization || doctor?.specialization || '',
    clinicId: appointment.branchId || null,
    clinicName: appointment.branch?.name || appointment.branch?.title || appointment.clinicName || clinic?.name || 'Virtual Clinic',
    appointmentMode: appointment.bookingMode === 'VIRTUAL' ? 'VIDEO' : 'IN_CLINIC',
    tokenNumber: appointment.tokenNumber == null ? '' : String(appointment.tokenNumber),
    tokenSequence: Number(appointment.tokenNumber ?? 0),
    patientNotes: appointment.medicalConcerns || appointment.patientNotes || '',
    paymentMethod: appointment.paymentMode === 'CASH' ? 'CASH_AT_CLINIC' : 'RAZORPAY',
    amountPaid: appointment.paymentStatus === 'PAID' ? Number(appointment.fee || 0) : 0,
    consentAccepted: true,
    createdAt: appointment.createdAt || new Date().toISOString(),
  } as Appointment;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_USER`);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => currentUser?.role || 'PATIENT');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('SEVASADAN_LANGUAGE');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });
  const [activeBranchId, setActiveBranchId] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('SEVASADAN_LANGUAGE', language);
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_USER`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_USER`);
    }
  }, [currentUser]);
  
  const [clinics, setClinics] = useState<Clinic[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_CLINICS`);
    return [];
  });

  const [doctors, setDoctors] = useState<DoctorUser[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_DOCTORS`);
    return [];
  });

  const [deskStaffMembers, setDeskStaffMembers] = useState<DeskStaffUser[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_DESK_STAFF`);
    return [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_APPOINTMENTS`);
    return [];
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_PRESCRIPTIONS`);
    return [];
  });

  const [careServices, setCareServices] = useState<CareService[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyDetail[]>(SPECIALTIES_DATA);

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_PAYMENTS`);
    return [];
  });

  const [healthPackages] = useState<HealthPackage[]>(INITIAL_HEALTH_PACKAGES);
  const [healthBlogs, setHealthBlogs] = useState<HealthBlog[]>(INITIAL_HEALTH_BLOGS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isStaffAuthModalOpen, setIsStaffAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_ADMIN_AUTH`) === 'true' && Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  });
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isDoctorProfileModalOpen, setIsDoctorProfileModalOpen] = useState<boolean>(false);
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<DoctorUser | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicsRes, doctorsRes, staffRes, servicesRes, specialtiesRes, articlesRes] = await Promise.all([
          api.get('/public/branches').catch(() => ({ data: { branches: [] } })),
          (isAdminAuthenticated ? api.get('/admin/doctors') : api.get('/public/doctors')).catch(() => ({ data: { doctors: [] } })),
          isAdminAuthenticated ? api.get('/admin/staff').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          api.get('/public/care-services').catch(() => ({ data: { services: [] } })),
          api.get('/public/specialties').catch(() => ({ data: { specialties: [] } })),
          api.get('/public/articles').catch(() => ({ data: { articles: [] } }))
        ]);

        const fetchedBranches = clinicsRes.data?.branches || (Array.isArray(clinicsRes.data) ? clinicsRes.data : []);
        setClinics(fetchedBranches.map(mapClinic));

        const fetchedDoctors = doctorsRes.data?.doctors || (Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
        setDoctors(fetchedDoctors.map(mapDoctor));

        const fetchedStaff = staffRes.data?.staff || (Array.isArray(staffRes.data) ? staffRes.data : []);
        setDeskStaffMembers(fetchedStaff.map(mapStaff));

        const rawServices = servicesRes.data?.data?.services || servicesRes.data?.services || servicesRes.data?.data || servicesRes.data || [];
        const fetchedServices = Array.isArray(rawServices) ? rawServices : [];
        setCareServices(fetchedServices);

        const fetchedSpecialties = specialtiesRes.data?.specialties || (Array.isArray(specialtiesRes.data) ? specialtiesRes.data : []);
        setSpecialties(fetchedSpecialties.length > 0 ? fetchedSpecialties : SPECIALTIES_DATA);

        const fetchedArticles = articlesRes.data?.articles || (Array.isArray(articlesRes.data) ? articlesRes.data : []);
        setHealthBlogs(fetchedArticles);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchData();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (currentUser && currentUser.role === 'PATIENT' && localStorage.getItem(AUTH_TOKEN_KEY)) {
        try {
          const res = await api.get('/patient/appointments');
          if (res.data?.appointments) {
            const mapped = res.data.appointments.map((appointment: any) => {
              const mAppt = mapAppointment(appointment, doctors, clinics);
              if (appointment.prescription && typeof appointment.prescription === 'object') {
                const rx = appointment.prescription;
                const newRx: Prescription = {
                  id: rx.id || `RX-${appointment.id}`,
                  appointmentId: appointment.id,
                  patientId: appointment.patientId,
                  doctorId: appointment.doctorId,
                  doctorName: rx.doctorName || mAppt.doctorName,
                  doctorSpecialization: rx.doctorSpecialization || mAppt.doctorSpecialization,
                  doctorRegNumber: rx.doctorRegNumber || 'MP-REG',
                  patientName: rx.patientName || mAppt.patientName,
                  patientAge: rx.patientAge || mAppt.patientAge,
                  patientGender: rx.patientGender || mAppt.patientGender,
                  patientPhone: rx.patientPhone || mAppt.patientPhone,
                  clinicName: rx.clinicName || mAppt.clinicName,
                  diagnosis: rx.diagnosis || 'General Checkup',
                  symptoms: rx.symptoms || mAppt.symptoms || [],
                  clinicalNotes: rx.clinicalNotes || '',
                  investigationsOrdered: rx.investigationsOrdered || [],
                  adviceList: rx.adviceList || [],
                  items: rx.items || [],
                  nextFollowUpDate: rx.nextFollowUpDate || '',
                  createdAt: rx.createdAt || appointment.createdAt || new Date().toISOString()
                };
                setPrescriptions(prev => {
                  if (prev.some(p => p.appointmentId === appointment.id)) {
                    return prev.map(p => p.appointmentId === appointment.id ? newRx : p);
                  }
                  return [...prev, newRx];
                });
              }
              return mAppt;
            });
            setAppointments(mapped);
          }
        } catch (err) {
          console.error('Failed to load patient appointments:', err);
        }
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [currentUser, doctors, clinics]);

  useEffect(() => {
    const fetchOperationalQueue = async () => {
      if (currentUser?.role === 'DOCTOR') {
        try {
          const response = await api.get('/doctor/appointments?status=ALL');
          const records = response.data?.appointments || [];
          const mapped = records.map((appointment: any) => {
            const mAppt = mapAppointment(appointment, doctors, clinics);
            if (appointment.prescription && typeof appointment.prescription === 'object') {
              const rx = appointment.prescription;
              const newRx: Prescription = {
                id: rx.id || `RX-${appointment.id}`,
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                doctorName: rx.doctorName || mAppt.doctorName,
                doctorSpecialization: rx.doctorSpecialization || mAppt.doctorSpecialization,
                doctorRegNumber: rx.doctorRegNumber || 'MP-REG',
                patientName: rx.patientName || mAppt.patientName,
                patientAge: rx.patientAge || mAppt.patientAge,
                patientGender: rx.patientGender || mAppt.patientGender,
                patientPhone: rx.patientPhone || mAppt.patientPhone,
                clinicName: rx.clinicName || mAppt.clinicName,
                diagnosis: rx.diagnosis || 'General Checkup',
                symptoms: rx.symptoms || mAppt.symptoms || [],
                clinicalNotes: rx.clinicalNotes || '',
                investigationsOrdered: rx.investigationsOrdered || [],
                adviceList: rx.adviceList || [],
                items: rx.items || [],
                nextFollowUpDate: rx.nextFollowUpDate || '',
                createdAt: rx.createdAt || appointment.createdAt || new Date().toISOString()
              };
              setPrescriptions(prev => {
                if (prev.some(p => p.appointmentId === appointment.id)) {
                  return prev.map(p => p.appointmentId === appointment.id ? newRx : p);
                }
                return [...prev, newRx];
              });
            }
            return mAppt;
          });
          setAppointments(mapped);
        } catch (error) {
          console.error('Failed to load doctor queue:', error);
        }
      } else if (currentUser?.role === 'DESK_STAFF') {
        try {
          const response = await api.get('/staff/queue');
          const records = response.data?.queue || [];
          setAppointments(records.map((appointment: any) => mapAppointment(appointment, doctors, clinics)));
        } catch (error) {
          console.error('Failed to load desk queue:', error);
        }
      }
    };

    fetchOperationalQueue();
    const interval = setInterval(fetchOperationalQueue, 5000);
    return () => clearInterval(interval);
  }, [currentUser, doctors, clinics]);

  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('all');
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>(undefined);
  const [preselectedClinicId, setPreselectedClinicId] = useState<string | undefined>(undefined);
  const [preselectedMode, setPreselectedMode] = useState<AppointmentMode | undefined>(undefined);

  const openAdminAuthModal = () => setIsAdminAuthModalOpen(true);
  const closeAdminAuthModal = () => setIsAdminAuthModalOpen(false);

  const openStaffAuthModal = () => setIsStaffAuthModalOpen(true);
  const closeStaffAuthModal = () => setIsStaffAuthModalOpen(false);

  // Sync state to LocalStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem(`${LOCAL_STORAGE_KEY}_USER`, JSON.stringify(currentUser));
    else localStorage.removeItem(`${LOCAL_STORAGE_KEY}_USER`);
  }, [currentUser]);

  // Real-time multi-tab synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('sevasadan_sync_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          const savedAppts = localStorage.getItem(`${LOCAL_STORAGE_KEY}_APPOINTMENTS`);
          const savedRxs = localStorage.getItem(`${LOCAL_STORAGE_KEY}_PRESCRIPTIONS`);
          const savedPays = localStorage.getItem(`${LOCAL_STORAGE_KEY}_PAYMENTS`);
          if (savedAppts) setAppointments(JSON.parse(savedAppts));
          if (savedRxs) setPrescriptions(JSON.parse(savedRxs));
          if (savedPays) setPayments(JSON.parse(savedPays));
        }
      };
      return () => channel.close();
    }
  }, []);

  const notifyOtherTabs = () => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('sevasadan_sync_channel');
      channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      channel.close();
    }
  };

  const sendPatientOtp = async (email: string) => {
    try {
      const response = await api.post('/auth/patient/send-otp', { email });
      return { success: true, message: response.message || 'OTP sent successfully' };
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to send OTP'));
    }
  };

  const loginWithPatientEmailOtp = async (email: string, otp: string, _rolePreference?: UserRole, nameInput?: string) => {
    try {
      const response = await api.post('/auth/patient/verify-otp', { email, otp, name: nameInput });
      const { user, accessToken, token, isNew } = response.data;
      
      saveAuthToken(accessToken || token);
      
      const mappedUser: PatientUser = {
        id: user._id || user.id,
        patientId: user.patientId,
        phone: user.phone || '9826000000',
        email: user.email,
        name: user.name || `Patient`,
        age: user.age || 32,
        gender: user.gender || 'Male',
        bloodGroup: user.bloodGroup || 'O+',
        address: user.address || 'Sarangpur, MP',
        patientType: user.patientType || 'NEW',
        emergencyContact: user.emergencyContact || '9826000000',
        createdAt: user.createdAt || new Date().toISOString(),
        role: 'PATIENT'
      };

      setCurrentUser(mappedUser);
      setActiveRole('PATIENT');
      return { user: mappedUser, isNew: !!isNew };
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'OTP is incorrect'));
    }
  };

  const sendAdminOtp = async (email: string) => {
    try {
      const response = await api.post('/auth/admin/send-otp', { email });
      return { success: true, message: response.message || 'OTP sent successfully' };
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to send OTP to Admin email'));
    }
  };

  const loginAdminWithEmail = async (email: string, otpCode: string) => {
    try {
      const response = await api.post('/auth/admin/verify-otp', { email, otp: otpCode });
      const { user, accessToken, token } = response.data;

      saveAuthToken(accessToken || token);
      
      const adminUser: AppUser = {
        id: user._id || user.id || 'admin-1',
        name: user.name || 'Super Admin (SEVASADAN Central)',
        email: user.email,
        role: 'ADMIN',
        managedBranches: ['sarangpur', 'shujalpur', 'rajgarh']
      };

      setCurrentUser(adminUser);
      setActiveRole('ADMIN');
      setIsAdminAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_ADMIN_AUTH`, 'true');

      return { success: true, message: 'Admin logged in successfully' };
    } catch (error: any) {
      return { success: false, message: getApiErrorMessage(error, 'OTP is incorrect. Please try again.') };
    }
  };

  const loginWithEmailAndPassword = async (emailOrLoginId: string, passwordInput: string) => {
    try {
      const response = await api.post('/auth/login', { email: emailOrLoginId, password: passwordInput });
      const payload = response.data?.data || response.data;
      const rawUser = payload?.user || response.data?.user || payload;
      const accessToken = payload?.accessToken || payload?.token || response.data?.accessToken;

      if (accessToken) {
        saveAuthToken(accessToken);
      }

      const role: UserRole = (rawUser?.role === 'DOCTOR' || emailOrLoginId.toLowerCase().includes('dr')) 
        ? 'DOCTOR' 
        : (rawUser?.role === 'ADMIN' ? 'ADMIN' : 'DESK_STAFF');
      
      const mappedUser: AppUser = {
        ...rawUser,
        id: rawUser?.id || rawUser?._id || `user-${Date.now()}`,
        name: rawUser?.name || emailOrLoginId,
        email: rawUser?.email || emailOrLoginId,
        role: role
      };

      setCurrentUser(mappedUser);
      setActiveRole(role);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_USER`, JSON.stringify(mappedUser));
      
      return { success: true, user: mappedUser };
    } catch (error: any) {
      return { success: false, message: getApiErrorMessage(error, 'Login failed.') };
    }
  };

  const setSessionFromAuth = (userData: any, accessToken: string) => {
    if (accessToken) {
      saveAuthToken(accessToken);
    }
    const role: UserRole = userData.role === 'DOCTOR' 
      ? 'DOCTOR' 
      : (userData.role === 'STAFF' || userData.role === 'DESK_STAFF' ? 'DESK_STAFF' : userData.role);

    const mappedUser: AppUser = {
      ...userData,
      id: userData.id || userData._id,
      role: role
    };

    setCurrentUser(mappedUser);
    setActiveRole(role);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_USER`, JSON.stringify(mappedUser));
    if (role === 'ADMIN') {
      setIsAdminAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_ADMIN_AUTH`, 'true');
    }
  };

  const refreshArticles = async () => {
    try {
      const isDoctor = currentUser?.role === 'DOCTOR';
      const endpoint = isDoctor ? '/doctor/articles' : '/public/articles';
      const res = await api.get(endpoint);
      if (res.data?.articles) {
        setHealthBlogs(res.data.articles);
      }
    } catch (err) {
      console.error('Failed to refresh articles:', err);
    }
  };

  const createArticle = async (data: any) => {
    try {
      const res = await api.post('/doctor/articles', data);
      const newArt = res.data?.article || res.data;
      setHealthBlogs(prev => [newArt, ...prev]);
      return newArt;
    } catch (err1: any) {
      try {
        const res2 = await api.post('/public/articles', data);
        const newArt2 = res2.data?.article || res2.data;
        setHealthBlogs(prev => [newArt2, ...prev]);
        return newArt2;
      } catch (err2: any) {
        const localArt = {
          id: `art-local-${Date.now()}`,
          title: data.title,
          category: data.category || 'General Medicine',
          authorName: currentUser?.name || 'Dr. SevaArogyam Medical Team',
          authorRole: (currentUser as any)?.specialization || 'Medical Specialist',
          readTimeMinutes: Number(data.readTimeMinutes) || 5,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          excerpt: data.excerpt,
          content: data.content || data.excerpt,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
          published: true
        };
        setHealthBlogs(prev => [localArt, ...prev]);
        return localArt;
      }
    }
  };

  const updateArticle = async (id: string, data: any) => {
    try {
      const res = await api.put(`/doctor/articles/${id}`, data);
      const updated = res.data?.article || res.data;
      setHealthBlogs(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      return updated;
    } catch (err1: any) {
      try {
        const res2 = await api.put(`/public/articles/${id}`, data);
        const updated2 = res2.data?.article || res2.data;
        setHealthBlogs(prev => prev.map(a => a.id === id ? { ...a, ...updated2 } : a));
        return updated2;
      } catch {
        setHealthBlogs(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
      }
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await api.delete(`/doctor/articles/${id}`);
    } catch {
      try {
        await api.delete(`/public/articles/${id}`);
      } catch {
        // Fallback to state update
      }
    }
    setHealthBlogs(prev => prev.filter(a => a.id !== id));
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout', {});
    } catch(e) {
      console.warn('Logout API call failed', e);
    } finally {
      setCurrentUser(null);
      setIsAdminAuthenticated(false);
      setActiveRole('PATIENT');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_USER`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_ADMIN_AUTH`);
      setIsLoggingOut(false);
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'DOCTOR' && currentUser?.role !== 'DOCTOR') {
      setCurrentUser(doctors[0]);
    } else if (role === 'ADMIN' && currentUser?.role !== 'ADMIN') {
      setCurrentUser({
        id: 'admin-1',
        name: 'Central Admin',
        email: 'admin@sevasadanclinic.in',
        role: 'ADMIN',
        managedBranches: ['sarangpur', 'shujalpur', 'rajgarh']
      });
    } else if (role === 'PATIENT' && currentUser?.role !== 'PATIENT') {
      setCurrentUser(DEMO_PATIENTS[0]);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openBookingModal = (doctorId?: string, clinicId?: string, mode?: AppointmentMode) => {
    const isStaff = currentUser?.role === 'DESK_STAFF' || (currentUser?.role as string) === 'STAFF';
    if (!currentUser && !localStorage.getItem(AUTH_TOKEN_KEY)) {
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser?.role !== 'PATIENT' && !isStaff && !isAdminAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setPreselectedDoctorId(doctorId);
    setPreselectedClinicId(clinicId);
    setPreselectedMode(mode);
    setIsBookingModalOpen(true);
  };
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setPreselectedDoctorId(undefined);
    setPreselectedClinicId(undefined);
    setPreselectedMode(undefined);
  };

  const openDoctorProfileModal = (doctorOrId: DoctorUser | string) => {
    if (typeof doctorOrId === 'string') {
      const doc = doctors.find(d => d.id === doctorOrId) || doctors[0];
      setSelectedDoctorForProfile(doc);
    } else {
      setSelectedDoctorForProfile(doctorOrId);
    }
    setIsDoctorProfileModalOpen(true);
  };

  const closeDoctorProfileModal = () => {
    setIsDoctorProfileModalOpen(false);
    setSelectedDoctorForProfile(null);
  };

  const bookAppointment = async (data: {
    doctorId: string;
    clinicId: string | null;
    appointmentMode: 'IN_CLINIC' | 'VIDEO';
    appointmentDate: string;
    timeSlot: string;
    patientNotes?: string;
    symptoms?: string[];
    paymentMethod: PaymentMethod;
    patientType: PatientType;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    documents?: File[];
    voiceNote?: File;
  }): Promise<Appointment> => {
    const formData = new FormData();
    formData.append('doctorId', data.doctorId);
    if (data.clinicId) formData.append('branchId', data.clinicId);
    formData.append('bookingMode', data.appointmentMode === 'VIDEO' ? 'VIRTUAL' : 'PHYSICAL');
    formData.append('appointmentDate', data.appointmentDate);
    formData.append('timeSlot', data.timeSlot);
    formData.append('symptoms', JSON.stringify(data.symptoms || []));
    if (data.patientNotes) formData.append('medicalConcerns', data.patientNotes);
    formData.append('paymentMode', data.paymentMethod === 'CASH_AT_CLINIC' ? 'CASH' : 'ONLINE');

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
    }
    if (data.voiceNote) formData.append('voiceNote', data.voiceNote);

    const response = await api.post('/appointments/book', formData);
    
    // The backend returns { status: 'success', data: { appointment, order } }
    const newAppointment = {
      ...mapAppointment(response.data.appointment, doctors, clinics),
      razorpayOrderId: response.data.razorpayOrderId,
      razorpayAmount: response.data.amount,
      razorpayCurrency: response.data.currency,
      patientName: data.patientName || currentUser?.name || 'Patient',
      doctorName: doctors.find(d => d.id === data.doctorId)?.name || 'Doctor',
      clinicName: clinics.find(c => c.id === data.clinicId)?.name || 'Virtual Clinic',
    };

    const doc = doctors.find(d => d.id === data.doctorId) || doctors[0];
    const fee = data.appointmentMode === 'VIDEO' ? doc.consultationFeeOnline : doc.consultationFeeClinic;
    const isPaidOnline = data.paymentMethod !== 'CASH_AT_CLINIC';

    const newPayment: PaymentRecord = {
      id: `PAY-REC-${Date.now().toString().slice(-5)}`,
      appointmentId: newAppointment.id,
      patientId: newAppointment.patientId || currentUser?.id || 'pat-guest',
      patientName: newAppointment.patientName,
      doctorName: newAppointment.doctorName,
      clinicName: newAppointment.clinicName,
      amount: fee,
      currency: 'INR',
      paymentMethod: data.paymentMethod,
      paymentGateway: isPaidOnline ? 'RAZORPAY' : 'OFFLINE',
      transactionId: newAppointment.transactionId || 'TXN-GEN',
      paymentStatus: isPaidOnline ? 'SUCCESS' : 'PENDING',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setPayments(prev => [newPayment, ...prev]);
    notifyOtherTabs();
    return newAppointment;
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    if (activeRole === 'PATIENT' && status === 'CANCELLED') {
      await api.put(`/patient/appointments/${appointmentId}/cancel`, {});
    } else if (activeRole === 'DOCTOR') {
      await api.put(`/doctor/appointments/${appointmentId}/status`, { status });
    } else if (activeRole === 'DESK_STAFF' || activeRole === 'ADMIN') {
      await api.put(`/staff/appointments/${appointmentId}/status`, { status });
    }
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status } : a));
    notifyOtherTabs();
  };

  const createPrescription = async (rxData: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> => {
    await api.put(`/doctor/appointments/${rxData.appointmentId}/prescription`, rxData);
    const newRx: Prescription = {
      ...rxData,
      id: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      digitalSignatureStamp: `${rxData.doctorName} [Digitally Verified ${rxData.doctorRegNumber}]`
    };

    setPrescriptions(prev => [newRx, ...prev]);
    
    setAppointments(prev => prev.map(a => 
      a.id === rxData.appointmentId 
        ? { ...a, prescriptionId: newRx.id, status: 'COMPLETED' } 
        : a
    ));

    notifyOtherTabs();
    return newRx;
  };

  const updateDoctor = async (doctorId: string, updates: Partial<DoctorUser> | FormData) => {
    const response = await api.put(`/admin/doctors/${doctorId}`, updates);
    const updatedDoc = mapDoctor({ ...(response.data.doctor || response.data), id: response.data.doctor?._id || response.data.doctor?.id || response.data._id || response.data.id });
    setDoctors(prev => prev.map(d => d.id === doctorId ? updatedDoc : d));
    notifyOtherTabs();
  };

  const addDoctor = async (formData: FormData): Promise<DoctorUser> => {
    const response = await api.post('/admin/doctors', formData);
    const newDoc = mapDoctor({
      ...(response.data.doctor || response.data),
      id: response.data.doctor?._id || response.data.doctor?.id || response.data._id || response.data.id
    });
    setDoctors(prev => [newDoc, ...prev]);
    notifyOtherTabs();
    return newDoc;
  };

  const deleteDoctor = async (doctorId: string) => {
    await api.delete(`/admin/doctors/${doctorId}`);
    setDoctors(prev => prev.filter(d => d.id !== doctorId));
    notifyOtherTabs();
  };

  const updateClinic = async (clinicId: string, updates: Partial<Clinic>) => {
    const response = await api.put(`/branches/${clinicId}`, {
      name: updates.name,
      title: updates.fullName || updates.name,
      city: updates.city,
      receptionPhone: updates.phone,
      emergencyPhone: updates.emergencyPhone,
      opdSlotInterval: updates.slotDurationMinutes,
      address: updates.address,
      operatingHours: updates.operatingHours,
    });
    const updatedClinic = { ...(response.data.branch || response.data), id: response.data.branch?._id || response.data.branch?.id || response.data._id || response.data.id };
    setClinics(prev => prev.map(c => c.id === clinicId ? updatedClinic : c));
    notifyOtherTabs();
  };

  const addClinic = async (clinicData: Omit<Clinic, 'id'>): Promise<Clinic> => {
    const response = await api.post('/branches', {
      name: clinicData.name,
      title: clinicData.fullName || clinicData.name,
      city: clinicData.city,
      receptionPhone: clinicData.phone,
      emergencyPhone: clinicData.emergencyPhone || '',
      opdSlotInterval: clinicData.slotDurationMinutes || 15,
      address: clinicData.address,
      operatingHours: clinicData.operatingHours,
    });
    const newClinic = { ...(response.data.branch || response.data), id: response.data.branch?._id || response.data.branch?.id || response.data._id || response.data.id };
    setClinics(prev => [newClinic, ...prev]);
    notifyOtherTabs();
    return newClinic;
  };

  const deleteClinic = async (clinicId: string) => {
    await api.delete(`/branches/${clinicId}`);
    setClinics(prev => prev.filter(c => c.id !== clinicId));
    notifyOtherTabs();
  };

  const addDeskStaffMember = async (formData: FormData): Promise<DeskStaffUser> => {
    const response = await api.post('/admin/staff', formData);
    const newStaff = mapStaff(response.data?.staff || response.data);
    setDeskStaffMembers(prev => [newStaff, ...prev]);
    notifyOtherTabs();
    return newStaff;
  };

  const updateDeskStaffMember = async (staffId: string, formData: FormData): Promise<DeskStaffUser> => {
    const response = await api.put(`/admin/staff/${staffId}`, formData);
    const updatedStaff = mapStaff(response.data?.staff || response.data);
    setDeskStaffMembers(prev => prev.map(s => s.id === staffId ? updatedStaff : s));
    notifyOtherTabs();
    return updatedStaff;
  };

  const deleteDeskStaffMember = async (staffId: string) => {
    await api.delete(`/admin/staff/${staffId}`);
    setDeskStaffMembers(prev => prev.filter(s => s.id !== staffId));
    notifyOtherTabs();
  };

  const addCareService = async (data: any): Promise<CareService> => {
    const res = await api.post('/admin/care-services', data);
    const serviceObj = res.data?.data || res.data;
    setCareServices(prev => [serviceObj, ...prev]);
    notifyOtherTabs();
    return serviceObj;
  };

  const updateCareService = async (id: string, updates: any) => {
    const res = await api.put(`/admin/care-services/${id}`, updates);
    const updatedObj = res.data?.data || res.data;
    setCareServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedObj } : s));
    notifyOtherTabs();
  };

  const deleteCareService = async (id: string) => {
    await api.delete(`/admin/care-services/${id}`);
    setCareServices(prev => prev.filter(s => s.id !== id));
    notifyOtherTabs();
  };

  const addSpecialty = async (data: any): Promise<SpecialtyDetail> => {
    const res = await api.post('/admin/specialties', data);
    const newSpec = res.data;
    setSpecialties(prev => [newSpec, ...prev]);
    notifyOtherTabs();
    return newSpec;
  };

  const updateSpecialty = async (id: string, updates: any) => {
    const res = await api.put(`/admin/specialties/${id}`, updates);
    setSpecialties(prev => prev.map(s => s.id === id ? { ...s, ...res.data } : s));
    notifyOtherTabs();
  };

  const deleteSpecialty = async (id: string) => {
    await api.delete(`/admin/specialties/${id}`);
    setSpecialties(prev => prev.filter(s => s.id !== id));
    notifyOtherTabs();
  };

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTimeSlot: string) => {
    try {
      await api.put(`/patient/appointments/${appointmentId}/reschedule`, { appointmentDate: newDate, timeSlot: newTimeSlot });
    } catch (e) {
      console.warn('Backend reschedule API error, updating local state', e);
    }
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, appointmentDate: newDate, timeSlot: newTimeSlot, isRescheduled: true } : a));
    notifyOtherTabs();
  };

  const findPatientById = async (patientId: string): Promise<Partial<PatientUser>> => {
    const response = await api.get(`/patient/id/${encodeURIComponent(patientId)}`);
    return response.data.patient || response.data;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        language,
        activeBranchId,
        clinics,
        doctors,
        appointments,
        prescriptions,
        careServices,
        addCareService,
        updateCareService,
        deleteCareService,
        specialties,
        addSpecialty,
        updateSpecialty,
        deleteSpecialty,
        rescheduleAppointment,
        findPatientById,
        payments,
        healthPackages,
        healthBlogs,
        isAuthModalOpen,
        isAdminAuthModalOpen,
        isStaffAuthModalOpen,
        isBookingModalOpen,
        isAdminAuthenticated,
        openAdminAuthModal,
        closeAdminAuthModal,
        openStaffAuthModal,
        closeStaffAuthModal,
        sendAdminOtp,
        loginAdminWithEmail,
        isDoctorProfileModalOpen,
        selectedDoctorForProfile,
        selectedBlogId,
        setSelectedBlogId,
        selectedSpecialtyFilter,
        setSelectedSpecialtyFilter,
        preselectedDoctorId,
        preselectedClinicId,
        preselectedMode,
        sendPatientOtp,
        loginWithPatientEmailOtp,
        isLoggingOut,
        logout,
        switchRole,
        setLanguage,
        setActiveBranchId,
        openAuthModal,
        closeAuthModal,
        openBookingModal,
        closeBookingModal,
        openDoctorProfileModal,
        closeDoctorProfileModal,
        bookAppointment,
        updateAppointmentStatus,
        createPrescription,
        updateDoctor,
        addDoctor,
        deleteDoctor,
        updateClinic,
        addClinic,
        deleteClinic,
        deskStaffMembers,
        addDeskStaffMember,
        updateDeskStaffMember,
        deleteDeskStaffMember,
        loginWithEmailAndPassword,
        setSessionFromAuth,
        createArticle,
        updateArticle,
        deleteArticle,
        refreshArticles
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
