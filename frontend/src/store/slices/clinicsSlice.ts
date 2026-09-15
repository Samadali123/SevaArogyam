import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Clinic } from '../../types';

interface ClinicsState {
  clinics: Clinic[];
}

const initialState: ClinicsState = {
  clinics: [],
};

export const clinicsSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    setClinics: (state, action: PayloadAction<Clinic[]>) => {
      state.clinics = action.payload;
    },
    addClinicLocal: (state, action: PayloadAction<Clinic>) => {
      state.clinics.push(action.payload);
    },
    updateClinicLocal: (state, action: PayloadAction<Clinic>) => {
      const idx = state.clinics.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.clinics[idx] = action.payload;
      }
    },
    deleteClinicLocal: (state, action: PayloadAction<string>) => {
      state.clinics = state.clinics.filter(c => c.id !== action.payload);
    },
  },
});

export const {
  setClinics,
  addClinicLocal,
  updateClinicLocal,
  deleteClinicLocal,
} = clinicsSlice.actions;

export default clinicsSlice.reducer;
