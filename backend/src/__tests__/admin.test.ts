import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock database service
jest.mock('../services/database.service', () => ({
  getAllUsers: jest.fn().mockResolvedValue({
    success: true,
    users: [
      {
        id: 'user-1',
        email: 'user1@example.com',
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        role: 'nominee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    total: 2,
    page: 1,
    limit: 10,
  }),
  getAllAssets: jest.fn().mockResolvedValue({
    success: true,
    assets: [
      {
        id: 'asset-1',
        owner_id: 'user-1',
        title: 'Asset 1',
        category: 'Legal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'asset-2',
        owner_id: 'user-2',
        title: 'Asset 2',
        category: 'Financial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    total: 2,
    page: 1,
    limit: 10,
  }),
  getUserById: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'user-1',
      email: 'user1@example.com',
      role: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  updateUserStatus: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'user-1',
      email: 'user1@example.com',
      role: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  getSystemStats: jest.fn().mockResolvedValue({
    success: true,
    stats: {
      totalUsers: 10,
      totalAssets: 25,
      totalDocuments: 50,
      storageUsed: 1024000,
    }
  }),
}));

describe('Admin Endpoints', () => {
  const adminToken = jwt.sign(
    { userId: 'admin-user-id', email: 'admin@example.com', role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );

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

  describe('GET /admin/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/admin/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/assets', () => {
    it('should return all assets for admin', async () => {
      const response = await request(app)
        .get('/admin/assets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('assets');
      expect(Array.isArray(response.body.data.assets)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/admin/assets?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/admin/assets')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/admin/assets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user details for admin', async () => {
      const response = await request(app)
        .get('/admin/users/user-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/admin/users/user-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user for admin', async () => {
      const response = await request(app)
        .patch('/admin/users/user-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'nominee'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/admin/users/user-1')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          role: 'nominee'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/stats', () => {
    it('should return system stats for admin', async () => {
      const response = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('totalUsers');
      expect(response.body.data.stats).toHaveProperty('totalAssets');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
