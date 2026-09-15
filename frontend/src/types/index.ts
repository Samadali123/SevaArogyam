export type UserRole = 'PATIENT' | 'DOCTOR' | 'DESK_STAFF' | 'ADMIN';
export type PatientType = 'NEW' | 'EXISTING' | 'FOLLOW_UP';
export type AppointmentMode = 'IN_CLINIC' | 'VIDEO';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH_AT_CLINIC' | 'RAZORPAY';
export type PaymentGateway = 'RAZORPAY' | 'CASHFREE' | 'OFFLINE';
export type MealTiming = 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'ANYTIME';
export type Language = 'en' | 'hi';

export interface PatientUser {
  id: string;
  patientId?: string;
  phone: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  patientType: PatientType;
  emergencyContact: string;
  createdAt: string;
  email?: string;
  role: 'PATIENT';
}

export interface DoctorUser {
  id: string;
  userId: string;
  name: string;
  qualification: string;
  specialization: string;
  regNumber: string;
  bio: string;
  avatarUrl: string;
  clinicsCovered: string[]; // Clinic IDs
  consultationFeeOnline: number;
  consultationFeeClinic: number;
  rating: number;
  totalReviews: number;
  experienceYears: number;
  role: 'DOCTOR';
  awards?: string[];
  languagesSpoken?: string[];
  educationDetails?: string[];
  clinicalInterests?: string[];
  consultationsCount?: number;
  satisfactionRate?: number;
  opdScheduleSummary?: string;
  phone?: string;
  email?: string;
  loginId?: string;
  password?: string;
}

export interface CareService {
  id: string;
  doctorId: string;
  name: string;
  nameHi?: string;
  description?: string;
  descriptionHi?: string;
  category: 'PHARMACY' | 'DIAGNOSTICS' | 'LABORATORY' | 'WELLNESS';
  price: number;
  isActive: boolean;
  createdAt?: string;
  doctor?: { id: string; name: string };
}

export interface DeskStaffUser {
  id: string;
  name: string;
  email: string;
  loginId: string;
  phone: string;
  branchId: string;
  role: 'DESK_STAFF';
  createdAt: string;
  password?: string;
}

export interface SpecialtyDetail {
  id: string;
  nameEn: string;
  nameHi: string;
  category: string;
  tagline: string;
  iconName: string;
  description: string;
  descriptionHi?: string;
  conditionsTreated: string[];
  proceduresAndTech: string[];
  doctorIds: string[];
  bannerUrl: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  titleHi: string;
  category: 'Emergency & ICU' | 'Diagnostics & Imaging' | 'Surgery & OT' | 'Digital & Telehealth' | 'Patient Care & Amenities';
  description: string;
  iconName: string;
  imageUrl: string;
  availableBranches: string[];
  highlights: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  managedBranches: string[];
  phone?: string;
}

export type AppUser = PatientUser | DoctorUser | AdminUser | DeskStaffUser;

export interface Clinic {
  id: string;
  name: string; // 'Sarangpur' | 'Shujalpur' | 'Rajgarh'
  nameHi?: string;
  fullName: string;
  fullNameHi?: string;
  address: string;
  addressHi?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  emergencyPhone?: string;
  email: string;
  operatingHours: string;
  emergencyHelpline: string;
  activeDoctorCount: number;
  googleMapEmbedUrl: string;
  googleMapDirectUrl?: string;
  googleMapDirectionsUrl?: string;
  imageUrl: string;
  slotDurationMinutes?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  assignedDoctorIds?: string[];
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  clinicId: string | null; // null if video
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // '09:00'
  endTime: string; // '17:00'
  slotDurationMinutes: number;
  maxTokensPerDay: number;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId?: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg" or "1 TSP"
  frequency: string; // e.g. "1-0-1"
  durationDays: number;
  timing: MealTiming;
  timeOfDay: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
  specialInstructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorRegNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  clinicName: string;
  diagnosis: string;
  symptoms: string[];
  clinicalNotes: string;
  investigationsOrdered?: string[];
  adviceList?: string[];
  items: PrescriptionItem[];
  nextFollowUpDate?: string;
  pdfUrl?: string;
  createdAt: string;
  digitalSignatureStamp?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientType: PatientType;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  clinicId: string | null; // null if video
  clinicName: string;
  appointmentMode: AppointmentMode;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:30 AM"
  tokenNumber: string; // e.g. "SAR-014" or "VID-008"
  tokenSequence: number;
  status: AppointmentStatus;
  patientNotes?: string;
  symptoms?: string[];
  attachedFiles?: { name: string; url: string; size: string }[];
  consentAccepted: boolean;
  consentTimestamp?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  transactionId?: string;
  roomJoinToken?: string;
  createdAt: string;
  prescriptionId?: string;
  razorpayOrderId?: string;
  razorpayAmount?: number;
  razorpayCurrency?: string;
  isRescheduled?: boolean;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  transactionId: string;
  paymentStatus: PaymentStatus;
  receiptUrl?: string;
  createdAt: string;
}

export interface HealthPackage {
  id: string;
  title: string;
  titleHi: string;
  category: 'Full Body' | 'Cardiac' | 'Diabetes' | 'Women Care' | 'Child Health';
  originalPrice: number;
  discountedPrice: number;
  testCount: number;
  testsIncluded: string[];
  description: string;
  badge?: string;
  popular?: boolean;
}

export interface HealthBlog {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTimeMinutes: number;
  date: string;
  excerpt: string;
  imageUrl: string;
}
