import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock database service
jest.mock('../services/database.service', () => ({
  getAssetsByUserId: jest.fn().mockResolvedValue({
    success: true,
    assets: [
      {
        id: 'asset-1',
        owner_id: 'owner-user-id',
        title: 'Test Asset',
        category: 'Legal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  }),
  getAssetById: jest.fn().mockResolvedValue({
    success: true,
    asset: {
      id: 'asset-1',
      owner_id: 'owner-user-id',
      title: 'Test Asset',
      category: 'Legal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents: [],
      linked_nominees: [],
    }
  }),
  createAsset: jest.fn().mockResolvedValue({
    success: true,
    asset: {
      id: 'new-asset-id',
      owner_id: 'owner-user-id',
      title: 'New Asset',
      category: 'Personal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  updateAsset: jest.fn().mockResolvedValue({
    success: true,
    asset: {
      id: 'asset-1',
      owner_id: 'owner-user-id',
      title: 'Updated Asset',
      category: 'Legal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }),
  deleteAsset: jest.fn().mockResolvedValue({
    success: true,
    message: 'Asset deleted successfully'
  }),
  getAssetStats: jest.fn().mockResolvedValue({
    success: true,
    stats: {
      totalAssets: 10,
      totalDocuments: 25,
      storageUsed: 1024000,
      assetsByCategory: []
    }
  }),
  getUserById: jest.fn().mockResolvedValue({
    success: true,
    user: {
      id: 'owner-user-id',
      email: 'owner@example.com',
      role: 'owner',
    }
  }),
}));

describe('Asset Endpoints', () => {
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

  describe('GET /assets', () => {
    it('should return assets for owner', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.assets)).toBe(true);
    });

    it('should return shared assets for nominee', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.assets)).toBe(true);
    });

    it('should return all assets for admin', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.assets)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/assets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /assets', () => {
    it('should create asset for owner', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'New Asset',
          category: 'Personal'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset).toHaveProperty('id');
      expect(response.body.data.asset.title).toBe('New Asset');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'New Asset',
          category: 'InvalidCategory'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          category: 'Personal'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for nominee trying to create asset', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${nomineeToken}`)
        .send({
          title: 'New Asset',
          category: 'Personal'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assets/:id', () => {
    it('should return asset details for owner', async () => {
      const response = await request(app)
        .get('/assets/asset-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset).toHaveProperty('id');
      expect(response.body.data.asset).toHaveProperty('title');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/assets/asset-1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /assets/:id', () => {
    it('should update asset for owner', async () => {
      const response = await request(app)
        .patch('/assets/asset-1')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Updated Asset'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset.title).toBe('Updated Asset');
    });

    it('should return 403 for nominee trying to update asset', async () => {
      const response = await request(app)
        .patch('/assets/asset-1')
        .set('Authorization', `Bearer ${nomineeToken}`)
        .send({
          title: 'Updated Asset'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /assets/:id', () => {
    it('should delete asset for owner', async () => {
      const response = await request(app)
        .delete('/assets/asset-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for nominee trying to delete asset', async () => {
      const response = await request(app)
        .delete('/assets/asset-1')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assets/stats', () => {
    it('should return stats for admin', async () => {
      const response = await request(app)
        .get('/assets/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('totalAssets');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/assets/stats')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
