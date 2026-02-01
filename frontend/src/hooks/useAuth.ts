'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { login, register, logout, loadUser, updateProfile, clearError } from '@/store/slices/authSlice';
import { User } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: (email: string, password: string) => dispatch(login({ email, password })),
    register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
      dispatch(register(data)),
    logout: () => dispatch(logout()),
    loadUser: () => dispatch(loadUser()),
    updateProfile: (data: Partial<User>) => dispatch(updateProfile(data)),
    clearError: () => dispatch(clearError()),
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
  };
};
