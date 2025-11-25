import api from './api';
import type { User, ApiResponse } from '@/types';

// Auth API service functions

/**
 * Send OTP to user's email
 */
export const sendOTP = async (email: string): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>('/auth/send-otp', { email });
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (
  email: string,
  otp: string
): Promise<ApiResponse<{ tempToken: string }>> => {
  const response = await api.post<ApiResponse<{ tempToken: string }>>(
    '/auth/verify-otp',
    { email, otp }
  );
  return response.data;
};

/**
 * Set PIN and role for new user
 */
export const setPIN = async (
  tempToken: string,
  pin: string,
  role: 'owner' | 'nominee' | 'admin'
): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(
    '/auth/set-pin',
    { pin, role },
    {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    }
  );
  return response.data;
};

/**
 * Login with email and PIN
 */
export const loginPIN = async (
  email: string,
  pin: string
): Promise<ApiResponse<{ user: User; token: string }>> => {
  const response = await api.post<ApiResponse<{ user: User; token: string }>>(
    '/auth/login-pin',
    { email, pin }
  );
  return response.data;
};

/**
 * Get authenticated user profile
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/profile');
  return response.data;
};
