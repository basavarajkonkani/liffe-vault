/**
 * Integration tests for LifeVault backend
 * Tests all endpoints with Supabase connection and RLS enforcement
 * 
 * @jest-environment node
 */

// Load integration test setup
import '../__tests__/integration-setup';

import request from 'supertest';
import { app } from '../server';
import { supabase } from '../config/supabase';

describe('LifeVault Integration Tests', () => {
  let ownerToken: string;
  let nomineeToken: string;
  let adminToken: string;
  let ownerId: string;
  let nomineeId: string;
  let adminId: string;
  let assetId: string;
  let documentId: string;
  let linkedNomineeId: string;

  // Test user credentials
  const ownerEmail = `owner-${Date.now()}@test.com`;
  const nomineeEmail = `nominee-${Date.now()}@test.com`;
  const adminEmail = `admin-${Date.now()}@test.com`;
  const testPin = '123456';

  beforeAll(async () => {
    console.log('🧪 Starting integration tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    if (ownerId) {
      await supabase.from('users').delete().eq('id', ownerId);
    }
    if (nomineeId) {
      await supabase.from('users').delete().eq('id', nomineeId);
    }
    if (adminId) {
      await supabase.from('users').delete().eq('id', adminId);
    }
    console.log('✅ Integration tests completed');
  });

  describe('Authentication Flow', () => {
    it('should send OTP to owner email', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ email: ownerEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
    });

    it('should send OTP to nominee email', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ email: nomineeEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should send OTP to admin email', async () => {
      const response = await request(app)
        .post('/auth/send-otp')
        .send({ email: adminEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    // Note: In real tests, we would need actual OTP codes
    // For integration testing, we'll create users directly via Supabase
    it('should create test users directly', async () => {
      // Create owner
      const { data: ownerAuth, error: ownerError } = await supabase.auth.admin.createUser({
        email: ownerEmail,
        email_confirm: true,
        user_metadata: { role: 'owner' }
      });
      expect(ownerError).toBeNull();
      expect(ownerAuth.user).toBeDefined();
      ownerId = ownerAuth.user!.id;

      // Create nominee
      const { data: nomineeAuth, error: nomineeError } = await supabase.auth.admin.createUser({
        email: nomineeEmail,
        email_confirm: true,
        user_metadata: { role: 'nominee' }
      });
      expect(nomineeError).toBeNull();
      expect(nomineeAuth.user).toBeDefined();
      nomineeId = nomineeAuth.user!.id;

      // Create admin
      const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      expect(adminError).toBeNull();
      expect(adminAuth.user).toBeDefined();
      adminId = adminAuth.user!.id;
    });

    it('should set PIN for owner', async () => {
      const response = await request(app)
        .post('/auth/set-pin')
        .send({
          userId: ownerId,
          pin: testPin,
          role: 'owner'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set PIN for nominee', async () => {
      const response = await request(app)
        .post('/auth/set-pin')
        .send({
          userId: nomineeId,
          pin: testPin,
          role: 'nominee'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set PIN for admin', async () => {
      const response = await request(app)
        .post('/auth/set-pin')
        .send({
          userId: adminId,
          pin: testPin,
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should login owner with PIN', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({
          email: ownerEmail,
          pin: testPin
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      ownerToken = response.body.data.token;
    });

    it('should login nominee with PIN', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({
          email: nomineeEmail,
          pin: testPin
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      nomineeToken = response.body.data.token;
    });

    it('should login admin with PIN', async () => {
      const response = await request(app)
        .post('/auth/login-pin')
        .send({
          email: adminEmail,
          pin: testPin
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      adminToken = response.body.data.token;
    });

    it('should get owner profile', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(ownerEmail);
      expect(response.body.data.role).toBe('owner');
    });
  });

  describe('Asset CRUD Operations with RLS', () => {
    it('should create asset as owner', async () => {
      const response = await request(app)
        .post('/assets')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Test Asset',
          category: 'Legal'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      assetId = response.body.data.id;
    });

    it('should get assets as owner (only own assets)', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].owner_id).toBe(ownerId);
    });

    it('should get specific asset as owner', async () => {
      const response = await request(app)
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(assetId);
      expect(response.body.data.title).toBe('Test Asset');
    });

    it('should NOT get owner asset as nominee (RLS enforcement)', async () => {
      const response = await request(app)
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(404);
    });

    it('should update asset as owner', async () => {
      const response = await request(app)
        .patch(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Updated Test Asset'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Test Asset');
    });

    it('should get all assets as admin', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Nominee Linking and Access Control', () => {
    it('should get available nominees as owner', async () => {
      const response = await request(app)
        .get('/nominees')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should link nominee to asset as owner', async () => {
      const response = await request(app)
        .post('/nominees/link')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          assetId: assetId,
          nomineeEmail: nomineeEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      linkedNomineeId = response.body.data.id;
    });

    it('should get linked nominees for asset', async () => {
      const response = await request(app)
        .get(`/nominees/asset/${assetId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should NOW get shared asset as nominee (after linking)', async () => {
      const response = await request(app)
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(assetId);
    });

    it('should get shared assets as nominee', async () => {
      const response = await request(app)
        .get('/assets')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should NOT allow nominee to update shared asset', async () => {
      const response = await request(app)
        .patch(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${nomineeToken}`)
        .send({
          title: 'Nominee Trying to Update'
        });

      expect(response.status).toBe(403);
    });

    it('should unlink nominee from asset', async () => {
      const response = await request(app)
        .delete(`/nominees/link/${linkedNomineeId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should NOT get asset as nominee after unlinking', async () => {
      const response = await request(app)
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Document Upload and Download', () => {
    it('should upload document to asset as owner', async () => {
      const response = await request(app)
        .post(`/assets/${assetId}/documents`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', Buffer.from('Test document content'), 'test-document.txt');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      documentId = response.body.data.id;
    });

    it('should get documents for asset', async () => {
      const response = await request(app)
        .get(`/assets/${assetId}/documents`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should generate signed URL for document download', async () => {
      const response = await request(app)
        .get(`/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
      expect(response.body.data.url).toContain('supabase');
    });

    it('should delete document as owner', async () => {
      const response = await request(app)
        .delete(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Admin Endpoints', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get all assets as admin', async () => {
      const response = await request(app)
        .get('/admin/assets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get specific user as admin', async () => {
      const response = await request(app)
        .get(`/admin/users/${ownerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(ownerId);
    });

    it('should NOT access admin endpoints as owner', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
    });

    it('should NOT access admin endpoints as nominee', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Cleanup', () => {
    it('should delete asset as owner', async () => {
      const response = await request(app)
        .delete(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
