import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock storage service
jest.mock('../services/storage.service', () => ({
  uploadDocument: jest.fn().mockResolvedValue({
    success: true,
    document: {
      id: 'doc-1',
      asset_id: 'asset-1',
      file_name: 'test.pdf',
      file_path: 'asset-1/test.pdf',
      file_size: 1024,
      uploaded_at: new Date().toISOString(),
    }
  }),
  getDocumentsByAssetId: jest.fn().mockResolvedValue({
    success: true,
    documents: [
      {
        id: 'doc-1',
        asset_id: 'asset-1',
        file_name: 'test.pdf',
        file_path: 'asset-1/test.pdf',
        file_size: 1024,
        uploaded_at: new Date().toISOString(),
      }
    ]
  }),
  getDocumentDownloadUrl: jest.fn().mockResolvedValue({
    success: true,
    url: 'https://storage.example.com/signed-url'
  }),
  deleteDocument: jest.fn().mockResolvedValue({
    success: true,
    message: 'Document deleted successfully'
  }),
}));

// Mock database service
jest.mock('../services/database.service', () => ({
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
  getDocumentById: jest.fn().mockResolvedValue({
    success: true,
    document: {
      id: 'doc-1',
      asset_id: 'asset-1',
      file_name: 'test.pdf',
      file_path: 'asset-1/test.pdf',
      file_size: 1024,
      uploaded_at: new Date().toISOString(),
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

describe('Document Endpoints', () => {
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

  describe('POST /assets/:id/documents', () => {
    it('should upload document for asset owner', async () => {
      const response = await request(app)
        .post('/assets/asset-1/documents')
        .set('Authorization', `Bearer ${ownerToken}`)
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('file_name');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/assets/asset-1/documents')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 without file', async () => {
      const response = await request(app)
        .post('/assets/asset-1/documents')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assets/:id/documents', () => {
    it('should return documents for asset owner', async () => {
      const response = await request(app)
        .get('/assets/asset-1/documents')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.documents)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/assets/asset-1/documents');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /documents/:id/download', () => {
    it('should return download URL for authorized user', async () => {
      const response = await request(app)
        .get('/documents/doc-1/download')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data).toHaveProperty('expiresIn');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/documents/doc-1/download');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /documents/:id', () => {
    it('should delete document for asset owner', async () => {
      const response = await request(app)
        .delete('/documents/doc-1')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for nominee trying to delete document', async () => {
      const response = await request(app)
        .delete('/documents/doc-1')
        .set('Authorization', `Bearer ${nomineeToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/documents/doc-1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
