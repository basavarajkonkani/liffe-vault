import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock database service
jest.mock('../services/database.service', () => ({
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

describe('Middleware Tests', () => {
  describe('JWT Authentication Middleware', () => {
    it('should accept valid JWT token', async () => {
      const validToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'owner' },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'owner' },
        env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject token with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'owner' },
        'wrong-secret-key',
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within rate limit', async () => {
      // Make a few requests (well under the 100 request limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/health');

        expect(response.status).toBe(200);
      }
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });

    // Note: Testing actual rate limit blocking would require making 100+ requests
    // which is impractical in unit tests. This would be better tested in integration tests.
  });

  describe('Role-Based Access Control Middleware', () => {
    const ownerToken = jwt.sign(
      { userId: 'owner-user-id', email: 'owner@example.com', role: 'owner' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const nomineeToken = jwt.sign(
      { userId: 'nominee-user-id', email: 'nominee@example.com', role: 'nominee' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const adminToken = jwt.sign(
      { userId: 'admin-user-id', email: 'admin@example.com', role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should deny non-admin access to admin routes', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow owner to create assets', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Test Asset',
          category: 'Personal'
        });

      expect(response.status).not.toBe(403);
    });

    it('should deny nominee from creating assets', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${nomineeToken}`)
        .send({
          title: 'Test Asset',
          category: 'Personal'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handler Middleware', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle validation errors with 400 status', async () => {
      const validToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com', role: 'owner' },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          // Missing required fields
          title: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
