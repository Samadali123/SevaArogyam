import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Language, DoctorUser, AppointmentMode } from '../../types';

interface UIState {
  language: Language;
  activeBranchId: string;
  isBookingModalOpen: boolean;
  isDoctorProfileModalOpen: boolean;
  selectedDoctorForProfile: DoctorUser | null;
  selectedBlogId: string | null;
  selectedSpecialtyFilter: string;
  preselectedDoctorId?: string;
  preselectedClinicId?: string;
  preselectedMode?: AppointmentMode;
}

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('SEVASADAN_LANGUAGE');
    return saved === 'en' || saved === 'hi' ? saved : 'hi';
  } catch {
    return 'hi';
  }
};

const initialState: UIState = {
  language: getInitialLanguage(),
  activeBranchId: 'all',
  isBookingModalOpen: false,
  isDoctorProfileModalOpen: false,
  selectedDoctorForProfile: null,
  selectedBlogId: null,
  selectedSpecialtyFilter: 'all',
  preselectedDoctorId: undefined,
  preselectedClinicId: undefined,
  preselectedMode: undefined,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setActiveBranchId: (state, action: PayloadAction<string>) => {
      state.activeBranchId = action.payload;
    },
    setBookingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isBookingModalOpen = action.payload;
    },
    setDoctorProfileModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDoctorProfileModalOpen = action.payload;
    },
    setSelectedDoctorForProfile: (state, action: PayloadAction<DoctorUser | null>) => {
      state.selectedDoctorForProfile = action.payload;
    },
    setSelectedBlogId: (state, action: PayloadAction<string | null>) => {
      state.selectedBlogId = action.payload;
    },
    setSelectedSpecialtyFilter: (state, action: PayloadAction<string>) => {
      state.selectedSpecialtyFilter = action.payload;
    },
    setPreselectedBooking: (
      state,
      action: PayloadAction<{ doctorId?: string; clinicId?: string; mode?: AppointmentMode }>
    ) => {
      state.preselectedDoctorId = action.payload.doctorId;
      state.preselectedClinicId = action.payload.clinicId;
      state.preselectedMode = action.payload.mode;
    },
  },
});

export const {
  setLanguage,
  setActiveBranchId,
  setBookingModalOpen,
  setDoctorProfileModalOpen,
  setSelectedDoctorForProfile,
  setSelectedBlogId,
  setSelectedSpecialtyFilter,
  setPreselectedBooking,
} = uiSlice.actions;

export default uiSlice.reducer;
