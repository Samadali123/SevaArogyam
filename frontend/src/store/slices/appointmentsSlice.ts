import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Appointment, Prescription, PaymentRecord, AppointmentStatus } from '../../types';

interface AppointmentsState {
  appointments: Appointment[];
  prescriptions: Prescription[];
  payments: PaymentRecord[];
}

const initialState: AppointmentsState = {
  appointments: [],
  prescriptions: [],
  payments: [],
};

export const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    setPrescriptions: (state, action: PayloadAction<Prescription[]>) => {
      state.prescriptions = action.payload;
    },
    setPayments: (state, action: PayloadAction<PaymentRecord[]>) => {
      state.payments = action.payload;
    },
    addAppointmentLocal: (state, action: PayloadAction<Appointment>) => {
      state.appointments.unshift(action.payload);
    },
    updateAppointmentStatusLocal: (
      state,
      action: PayloadAction<{ appointmentId: string; status: AppointmentStatus }>
    ) => {
      const idx = state.appointments.findIndex(a => a.id === action.payload.appointmentId);
      if (idx !== -1) {
        state.appointments[idx].status = action.payload.status;
      }
    },
    addPrescriptionLocal: (state, action: PayloadAction<Prescription>) => {
      const existingIdx = state.prescriptions.findIndex(p => p.appointmentId === action.payload.appointmentId);
      if (existingIdx !== -1) {
        state.prescriptions[existingIdx] = action.payload;
      } else {
        state.prescriptions.unshift(action.payload);
      }
      const apptIdx = state.appointments.findIndex(a => a.id === action.payload.appointmentId);
      if (apptIdx !== -1) {
        state.appointments[apptIdx].prescriptionId = action.payload.id;
        state.appointments[apptIdx].status = 'COMPLETED';
      }
    },
    addPaymentLocal: (state, action: PayloadAction<PaymentRecord>) => {
      state.payments.unshift(action.payload);
    },
    rescheduleAppointmentLocal: (
      state,
      action: PayloadAction<{ appointmentId: string; newDate: string; newTimeSlot: string }>
    ) => {
      const idx = state.appointments.findIndex(a => a.id === action.payload.appointmentId);
      if (idx !== -1) {
        state.appointments[idx].appointmentDate = action.payload.newDate;
        state.appointments[idx].timeSlot = action.payload.newTimeSlot;
        state.appointments[idx].isRescheduled = true;
      }
    },
  },
});

export const {
  setAppointments,
  setPrescriptions,
  setPayments,
  addAppointmentLocal,
  updateAppointmentStatusLocal,
  addPrescriptionLocal,
  addPaymentLocal,
  rescheduleAppointmentLocal,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
