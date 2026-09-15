import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DoctorUser } from '../../types';

interface DoctorsState {
  doctors: DoctorUser[];
}

const initialState: DoctorsState = {
  doctors: [],
};

export const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<DoctorUser[]>) => {
      state.doctors = action.payload;
    },
    addDoctorLocal: (state, action: PayloadAction<DoctorUser>) => {
      state.doctors.unshift(action.payload);
    },
    updateDoctorLocal: (state, action: PayloadAction<DoctorUser>) => {
      const idx = state.doctors.findIndex(d => d.id === action.payload.id);
      if (idx !== -1) {
        state.doctors[idx] = action.payload;
      }
    },
    deleteDoctorLocal: (state, action: PayloadAction<string>) => {
      state.doctors = state.doctors.filter(d => d.id !== action.payload);
    },
  },
});

export const {
  setDoctors,
  addDoctorLocal,
  updateDoctorLocal,
  deleteDoctorLocal,
} = doctorsSlice.actions;

export default doctorsSlice.reducer;
