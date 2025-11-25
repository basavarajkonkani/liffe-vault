import { Router } from 'express';
import {
  sendOTP,
  verifyOTP,
  setPIN,
  loginPIN,
  getProfile,
} from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  sendOTPSchema,
  verifyOTPSchema,
  setPINSchema,
  loginPINSchema,
} from '../schemas/auth.schema';

const router = Router();

/**
 * POST /auth/send-otp
 * Send OTP to user's email for authentication
 */
router.post('/send-otp', validateBody(sendOTPSchema), sendOTP);

/**
 * POST /auth/verify-otp
 * Verify OTP code and return temporary token for PIN setup
 */
router.post('/verify-otp', validateBody(verifyOTPSchema), verifyOTP);

/**
 * POST /auth/set-pin
 * Set 6-digit PIN for user with selected role
 */
router.post('/set-pin', validateBody(setPINSchema), setPIN);

/**
 * POST /auth/login-pin
 * Login with email and PIN, returns JWT token
 */
router.post('/login-pin', validateBody(loginPINSchema), loginPIN);

/**
 * GET /auth/profile
 * Get authenticated user profile (requires JWT token)
 */
router.get('/profile', authenticateToken, getProfile);

export default router;
