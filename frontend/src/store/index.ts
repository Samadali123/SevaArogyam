import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import doctorsReducer from './slices/doctorsSlice';
import clinicsReducer from './slices/clinicsSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import staffReducer from './slices/staffSlice';
import servicesReducer from './slices/servicesSlice';
import articlesReducer from './slices/articlesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    doctors: doctorsReducer,
    clinics: clinicsReducer,
    appointments: appointmentsReducer,
    staff: staffReducer,
    services: servicesReducer,
    articles: articlesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
