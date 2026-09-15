import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DeskStaffUser } from '../../types';

interface StaffState {
  deskStaffMembers: DeskStaffUser[];
}

const initialState: StaffState = {
  deskStaffMembers: [],
};

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setDeskStaffMembers: (state, action: PayloadAction<DeskStaffUser[]>) => {
      state.deskStaffMembers = action.payload;
    },
    addStaffLocal: (state, action: PayloadAction<DeskStaffUser>) => {
      state.deskStaffMembers.unshift(action.payload);
    },
    updateStaffLocal: (state, action: PayloadAction<DeskStaffUser>) => {
      const idx = state.deskStaffMembers.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.deskStaffMembers[idx] = action.payload;
      }
    },
    deleteStaffLocal: (state, action: PayloadAction<string>) => {
      state.deskStaffMembers = state.deskStaffMembers.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  setDeskStaffMembers,
  addStaffLocal,
  updateStaffLocal,
  deleteStaffLocal,
} = staffSlice.actions;

export default staffSlice.reducer;
