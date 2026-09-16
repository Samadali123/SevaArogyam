import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CareService, SpecialtyDetail } from '../../types';
import { SPECIALTIES_DATA } from '../../data/mockData';

export interface ServicesState {
  careServices: CareService[];
  specialties: SpecialtyDetail[];
}

const initialState: ServicesState = {
  careServices: [],
  specialties: SPECIALTIES_DATA,
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setCareServices: (state, action: PayloadAction<CareService[]>) => {
      state.careServices = action.payload;
    },
    addCareServiceLocal: (state, action: PayloadAction<CareService>) => {
      state.careServices.unshift(action.payload);
    },
    updateCareServiceLocal: (state, action: PayloadAction<CareService>) => {
      const idx = state.careServices.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.careServices[idx] = action.payload;
      }
    },
    deleteCareServiceLocal: (state, action: PayloadAction<string>) => {
      state.careServices = state.careServices.filter(s => s.id !== action.payload);
    },
    setSpecialties: (state, action: PayloadAction<SpecialtyDetail[]>) => {
      state.specialties = action.payload;
    },
    addSpecialtyLocal: (state, action: PayloadAction<SpecialtyDetail>) => {
      state.specialties.unshift(action.payload);
    },
    updateSpecialtyLocal: (state, action: PayloadAction<SpecialtyDetail>) => {
      const idx = state.specialties.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.specialties[idx] = action.payload;
      }
    },
    deleteSpecialtyLocal: (state, action: PayloadAction<string>) => {
      state.specialties = state.specialties.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  setCareServices,
  addCareServiceLocal,
  updateCareServiceLocal,
  deleteCareServiceLocal,
  setSpecialties,
  addSpecialtyLocal,
  updateSpecialtyLocal,
  deleteSpecialtyLocal,
} = servicesSlice.actions;

export default servicesSlice.reducer;
