import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppUser, UserRole } from '../../types';
import { AUTH_TOKEN_KEY } from '../../services/api';

const LOCAL_STORAGE_KEY = 'SEVASADAN_STATE_V1';

interface AuthState {
  currentUser: AppUser | null;
  activeRole: UserRole;
  isAdminAuthenticated: boolean;
  isLoggingOut: boolean;
  isAuthModalOpen: boolean;
  isAdminAuthModalOpen: boolean;
  isStaffAuthModalOpen: boolean;
}

const getSavedUser = (): AppUser | null => {
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_USER`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialUser = getSavedUser();

const getInitialAdminAuth = (): boolean => {
  try {
    const isSavedAdmin = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ADMIN_AUTH`) === 'true' || initialUser?.role === 'ADMIN';
    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    return isSavedAdmin && hasToken;
  } catch {
    return false;
  }
};

const initialState: AuthState = {
  currentUser: initialUser,
  activeRole: initialUser?.role || 'PATIENT',
  isAdminAuthenticated: getInitialAdminAuth(),
  isLoggingOut: false,
  isAuthModalOpen: false,
  isAdminAuthModalOpen: false,
  isStaffAuthModalOpen: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<AppUser | null>) => {
      state.currentUser = action.payload;
    },
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
    },
    setIsAdminAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAdminAuthenticated = action.payload;
    },
    setIsLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setAdminAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAdminAuthModalOpen = action.payload;
    },
    setStaffAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isStaffAuthModalOpen = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  setActiveRole,
  setIsAdminAuthenticated,
  setIsLoggingOut,
  setAuthModalOpen,
  setAdminAuthModalOpen,
  setStaffAuthModalOpen,
} = authSlice.actions;

export default authSlice.reducer;
