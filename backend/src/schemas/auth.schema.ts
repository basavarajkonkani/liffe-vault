import { z } from 'zod';

// Schema for sending OTP
export const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type SendOTPRequest = z.infer<typeof sendOTPSchema>;

// Schema for verifying OTP
export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export type VerifyOTPRequest = z.infer<typeof verifyOTPSchema>;

// Schema for setting PIN
export const setPINSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only digits'),
  role: z.enum(['owner', 'nominee', 'admin'], { message: 'Role must be one of: owner, nominee, admin' }),
});

export type SetPINRequest = z.infer<typeof setPINSchema>;

// Schema for PIN login
export const loginPINSchema = z.object({
  email: z.string().email('Invalid email address'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only digits'),
});

export type LoginPINRequest = z.infer<typeof loginPINSchema>;
