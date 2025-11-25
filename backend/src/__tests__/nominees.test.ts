import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock database service
jest.mock('../services/database.service', () => ({
  getNominees: jest.fn().mockResolvedValue({
    success: true,
    nominees: [
      {
        id: 'nominee-1',
        user_id: 'nominee-user-id',
        created_at: new Date().toISOString(),
        user: {
          id: 'nominee-user-id',
          email: 'nominee@example.com',
          role: 'nominee',
        }
      }
    ]
  }),
  linkNominee: jest.fn().mockResolvedValue({
    success: true,
    linkedNominee: {
      id: 'link-1',
      asset_id: 'asset-1',
      nominee_id: 'nominee-1',
      linked_at: new Date().toISOString(),
    }
  }),
  unlinkNominee: jest.fn().mockResolvedValue({
    success: true,
    message: 'Nominee unlinked successfully'
  }),
  getLinkedNominees: jest.fn().mockResolvedValue({
    success: true,
    linkedNominees: [
      {
        id: 'link-1',
        asset_id: 'asset-1',
        nominee_id: 'nominee-1',
        linked_at: new Date().toISOString(),
        nominee: {
          id: 'nominee-1',
          user_id: 'nominee-user-id',
          created_at: new Date().toISOString(),
          user: {
            id: 'nominee-user-id',
            email: 'nominee@example.com',
            role: 'nominee',
          }
        }
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

describe('Nominee Endpoints', () => {
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

  describe('GET /nominees', () => {
    it('should return list of nominees for owner', async () => {
      const response = await request(app)
        .get('/nominees')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.nominees)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/nominees');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /nominees/link', () => {
    it('should link nominee to asset for owner', async () => {
      const response = await request(app)
        .post('/nominees/link')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          assetId: 'asset-1',
          nomineeId: 'nominee-1'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.linkedNominee).toHaveProperty('id');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/nominees/link')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          assetId: 'asset-1'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for nominee trying to link', async () => {
      const response = await request(app)
        .post('/nominees/link')
        .set('Authorization', `Bearer ${nomineeToken}`)
        .send({
          assetId: 'asset-1',
          nomineeId: 'nominee-1'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/nominees/link')
        .send({
          assetId: 'asset-1',
          nomineeId: 'nominee-1'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /nominees/link/:id', () => {
    it('should unlink nominee for owner', async () => {
      const response = await request(app)
        .delete('/nominees/link/link-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for nominee trying to unlink', async () => {
      const response = await request(app)
        .delete('/nominees/link/link-1')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/nominees/link/link-1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /nominees/asset/:assetId', () => {
    it('should return linked nominees for asset owner', async () => {
      const response = await request(app)
        .get('/nominees/asset/asset-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.linkedNominees)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/nominees/asset/asset-1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
