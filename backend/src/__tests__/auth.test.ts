import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock Supabase auth service
jest.mock('../services/auth.service', () => ({
  sendOTP: jest.fn().mockResolvedValue({ 
    success: true,
    message: 'OTP sent successfully'
  }),
  verifyOTP: jest.fn().mockResolvedValue({ 
    success: true,
    message: 'OTP verified successfully',
    userId: 'test-user-id',
    email: 'test@example.com'
  }),
}));

// Mock database service
jest.mock('../services/database.service', () => ({
  createUser: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'owner',
      pin_hash: 'hashed-pin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  getUserByEmail: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'owner',
      pin_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // bcrypt hash
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  getUserById: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Endpoints', () => {
  describe('POST /auth/send-otp', () => {
    it('should send OTP to valid email', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify valid OTP', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ 
          email: 'test@example.com',
          otp: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tempToken');
    });

    it('should return 400 for invalid OTP format', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ 
          email: 'test@example.com',
          otp: '12345' // Only 5 digits
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/set-pin', () => {
    it('should set PIN for authenticated user', async () => {
      // Generate a temporary token
      const tempToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'temp' },
        env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      const response = await request(app)
        .post('/auth/set-pin')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ 
          pin: '123456',
          role: 'owner'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('PIN set successfully');
    });

    it('should return 400 for invalid PIN format', async () => {
      const tempToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'temp' },
        env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      const response = await request(app)
        .post('/auth/set-pin')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ 
          pin: '12345', // Only 5 digits
          role: 'owner'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/auth/set-pin')
        .send({ 
          pin: '123456',
          role: 'owner'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login-pin', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({ 
          email: 'test@example.com',
          pin: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 400 for invalid PIN format', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({ 
          email: 'test@example.com',
          pin: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const token = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'owner' },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
