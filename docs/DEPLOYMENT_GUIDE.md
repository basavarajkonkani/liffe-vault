# LifeVault Deployment Guide

This guide provides comprehensive instructions for deploying the LifeVault application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying LifeVault to production, ensure you have:

- **Supabase Account**: Create a production project at [supabase.com](https://supabase.com)
- **Hosting Accounts**:
  - Frontend: Vercel, Netlify, or similar static hosting
  - Backend: Railway, Render, AWS EC2, or similar Node.js hosting
- **Domain Names** (optional but recommended):
  - Frontend: `app.lifevault.com` or `lifevault.com`
  - Backend API: `api.lifevault.com`
- **SSL Certificates**: Most hosting providers include free SSL
- **Node.js 18+**: Required for backend deployment

---

## Pre-Deployment Checklist

Before deploying, complete these tasks:

### Security Checklist

- [ ] Generate a secure JWT secret (min 256 bits)
- [ ] Obtain production Supabase credentials
- [ ] Configure production domain names
- [ ] Review and update CORS settings
- [ ] Ensure all sensitive data is in environment variables
- [ ] Remove any console.log statements with sensitive data
- [ ] Review and test all RLS policies in Supabase

### Code Quality Checklist

- [ ] Run frontend linter: `cd frontend && npm run lint`
- [ ] Run backend tests: `cd backend && npm test`
- [ ] Build frontend successfully: `cd frontend && npm run build`
- [ ] Build backend successfully: `cd backend && npm run build`
- [ ] Test complete user flows in development
- [ ] Review all API endpoints for security

### Database Checklist

- [ ] Run all database migrations in production Supabase
- [ ] Verify RLS policies are enabled on all tables
- [ ] Create storage buckets with proper policies
- [ ] Test database connections from backend
- [ ] Backup development data if needed

---

## Environment Configuration

### 1. Generate Secure JWT Secret

Generate a cryptographically secure random string:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save this value - you'll need it for the backend configuration.

### 2. Configure Supabase Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project for production
3. Navigate to **Settings → API**
4. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: For frontend (safe for browser)
   - **service_role key**: For backend (keep secret!)

### 3. Frontend Environment Configuration

Create `frontend/.env.production`:

```env
# Production API URL - Update with your backend domain
VITE_API_URL=https://api.lifevault.com

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key-here
```

**Important**: 
- Replace `api.lifevault.com` with your actual backend domain
- Use the **anon public key** (not service_role key)
- Never commit this file with real credentials

### 4. Backend Environment Configuration

Create `backend/.env.production`:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration - Use the secure secret you generated
JWT_SECRET=your-secure-random-string-from-step-1

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-production-service-role-key-here

# Frontend URL for CORS - Update with your frontend domain
FRONTEND_URL=https://lifevault.com
```

**Important**:
- Use the **service_role key** (not anon key)
- Update `FRONTEND_URL` to match your actual frontend domain
- Never commit this file with real credentials

---

## Database Setup

### 1. Run Database Migrations

Execute the following SQL migrations in your production Supabase project:

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Run each migration file in order:

1. migrations/001_initial_schema.sql    # Creates tables and indexes
2. migrations/002_rls_policies.sql      # Enables Row Level Security
3. migrations/003_storage_buckets.sql   # Creates storage buckets
```

**Detailed Instructions**:

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your production project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `backend/migrations/001_initial_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`
8. Repeat for migrations 002 and 003

### 2. Verify Database Setup

Run the verification queries:

```bash
# In Supabase SQL Editor, run:
backend/migrations/verify_schema.sql
backend/migrations/verify_rls_policies.sql
backend/migrations/verify_storage_policies.sql
```

Expected results:
- 5 tables created: users, assets, documents, nominees, linked_nominees
- RLS enabled on all tables
- Storage bucket "documents" created with policies

### 3. Create Storage Buckets

If not created by migration 003:

1. Navigate to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `documents`
4. Public: **No** (private bucket)
5. File size limit: `52428800` (50 MB)
6. Click **Create Bucket**

---

## Backend Deployment

### Option 1: Railway Deployment (Recommended)

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Initialize Project**:
```bash
cd backend
railway init
```

4. **Set Environment Variables**:
```bash
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-secure-jwt-secret"
railway variables set SUPABASE_URL="https://your-project-id.supabase.co"
railway variables set SUPABASE_SERVICE_KEY="your-service-role-key"
railway variables set FRONTEND_URL="https://lifevault.com"
```

5. **Deploy**:
```bash
railway up
```

6. **Get Deployment URL**:
```bash
railway domain
```

### Option 2: Manual Deployment with PM2

1. **Build the Backend**:
```bash
cd backend
npm ci --production=false
npm run build
```

2. **Copy Files to Server**:
```bash
# Using SCP
scp -r dist package.json package-lock.json .env.production user@server:/var/www/lifevault-api/

# Or using rsync
rsync -avz dist package.json package-lock.json .env.production user@server:/var/www/lifevault-api/
```

3. **Install Dependencies on Server**:
```bash
ssh user@server
cd /var/www/lifevault-api
npm ci --production
```

4. **Install PM2**:
```bash
npm install -g pm2
```

5. **Start Application**:
```bash
# Copy ecosystem config
scp backend/ecosystem.config.js user@server:/var/www/lifevault-api/

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

6. **Configure Nginx Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name api.lifevault.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable SSL with Certbot**:
```bash
sudo certbot --nginx -d api.lifevault.com
```

### Option 3: Using Deployment Script

```bash
cd backend
./deploy.sh
```

This script will:
- Validate environment configuration
- Install dependencies
- Run tests
- Build TypeScript
- Prepare deployment package

---

## Frontend Deployment

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd frontend
vercel --prod
```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add:
     - `VITE_API_URL`: Your backend API URL
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

5. **Redeploy** to apply environment variables:
```bash
vercel --prod
```

### Option 2: Netlify Deployment

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Build and Deploy**:
```bash
cd frontend
netlify deploy --prod
```

4. **Set Environment Variables**:
   - Go to Netlify Dashboard
   - Navigate to **Site Settings → Environment Variables**
   - Add the same variables as Vercel option

### Option 3: Using Deployment Script

```bash
cd frontend
./deploy.sh
```

This script will:
- Validate environment file exists
- Install dependencies
- Run linter
- Build production bundle
- Output deployment instructions

Then upload the `dist/` directory to your hosting provider.

---

## Post-Deployment Verification

### 1. Backend Health Check

Test the backend API is running:

```bash
curl https://api.lifevault.com/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "message": "LifeVault API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. CORS Verification

Test CORS from your frontend domain:

```bash
curl -H "Origin: https://lifevault.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.lifevault.com/auth/send-otp
```

Should return CORS headers without errors.

### 3. Frontend Verification

1. Open your frontend URL in a browser
2. Check browser console for errors
3. Verify API calls are reaching the backend
4. Test the complete authentication flow:
   - Send OTP
   - Verify OTP
   - Set PIN
   - Login with PIN

### 4. Database Connection

Verify backend can connect to Supabase:

```bash
# Check backend logs for connection messages
pm2 logs lifevault-api

# Or check Railway/Render logs in their dashboard
```

### 5. File Upload Test

1. Login as an Asset Owner
2. Upload a test document
3. Verify file appears in Supabase Storage
4. Download the file to verify signed URLs work

---

## Monitoring and Maintenance

### Application Monitoring

**Backend Monitoring**:
- Use PM2 monitoring: `pm2 monit`
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Track error rates

**Frontend Monitoring**:
- Set up error tracking (Sentry)
- Monitor page load times
- Track user analytics (Google Analytics, Plausible)

### Log Management

**Backend Logs**:
```bash
# View PM2 logs
pm2 logs lifevault-api

# View specific log files
tail -f /var/www/lifevault-api/logs/error.log
tail -f /var/www/lifevault-api/logs/out.log
```

**Supabase Logs**:
- Navigate to Supabase Dashboard → Logs
- Monitor database queries
- Check authentication events
- Review storage access logs

### Database Backups

Supabase provides automatic daily backups. To create manual backups:

1. Go to Supabase Dashboard → Database → Backups
2. Click **Create Backup**
3. Download backup for local storage

### SSL Certificate Renewal

If using Certbot, certificates auto-renew. To manually renew:

```bash
sudo certbot renew
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
- Verify `FRONTEND_URL` in backend `.env.production` matches your frontend domain exactly
- Check for trailing slashes (should not have them)
- Ensure backend is restarted after environment changes
- Test with: `npm run test:cors` in backend directory

#### 2. 401 Unauthorized Errors

**Symptom**: All API requests return 401

**Solution**:
- Verify JWT_SECRET is set correctly in backend
- Check token is being sent in Authorization header
- Verify token hasn't expired (24-hour expiry)
- Check browser localStorage for token

#### 3. Database Connection Errors

**Symptom**: Backend logs show Supabase connection errors

**Solution**:
- Verify SUPABASE_URL is correct
- Ensure SUPABASE_SERVICE_KEY is the service_role key (not anon key)
- Check Supabase project is not paused
- Verify network connectivity to Supabase

#### 4. File Upload Failures

**Symptom**: Document uploads fail or return errors

**Solution**:
- Verify storage bucket "documents" exists in Supabase
- Check RLS policies on storage bucket
- Ensure file size is under 50 MB limit
- Verify SUPABASE_SERVICE_KEY has storage permissions

#### 5. Environment Variables Not Loading

**Symptom**: Application uses default/example values

**Solution**:
- Verify `.env.production` file exists
- Check file is in the correct directory
- Ensure environment variables are set in hosting platform
- Restart application after changes

### Getting Help

If you encounter issues not covered here:

1. Check application logs for detailed error messages
2. Review Supabase logs for database/auth errors
3. Test API endpoints with Postman or curl
4. Verify all environment variables are set correctly
5. Consult the main README files in frontend/ and backend/ directories

---

## Security Best Practices

### Production Security Checklist

- [ ] Use HTTPS for all connections
- [ ] Keep JWT_SECRET secure and never commit to version control
- [ ] Use strong, unique passwords for all services
- [ ] Enable 2FA on Supabase, hosting accounts
- [ ] Regularly update dependencies: `npm audit fix`
- [ ] Monitor for security vulnerabilities
- [ ] Review RLS policies regularly
- [ ] Implement rate limiting (already configured)
- [ ] Set up automated backups
- [ ] Use environment variables for all secrets
- [ ] Restrict database access to backend only
- [ ] Monitor authentication logs for suspicious activity

### Regular Maintenance Tasks

**Weekly**:
- Review application logs for errors
- Check uptime monitoring reports
- Monitor storage usage in Supabase

**Monthly**:
- Update dependencies: `npm update`
- Review and rotate JWT secrets if needed
- Check SSL certificate expiry
- Review user access logs

**Quarterly**:
- Perform security audit
- Review and update RLS policies
- Test disaster recovery procedures
- Update documentation

---

## Rollback Procedures

If deployment fails or issues arise:

### Backend Rollback

**Using PM2**:
```bash
pm2 stop lifevault-api
# Restore previous version
pm2 start ecosystem.config.js --env production
```

**Using Railway/Render**:
- Navigate to deployment dashboard
- Select previous successful deployment
- Click "Redeploy"

### Frontend Rollback

**Vercel**:
```bash
vercel rollback
```

**Netlify**:
- Go to Deploys tab in dashboard
- Find previous successful deploy
- Click "Publish deploy"

### Database Rollback

```bash
# In Supabase SQL Editor, run rollback scripts:
backend/migrations/rollback_003.sql
backend/migrations/rollback_002.sql
backend/migrations/rollback_001.sql
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## Support

For issues specific to LifeVault:
- Review the main README files
- Check the requirements and design documents in `.kiro/specs/lifevault-app/`
- Consult the migration guides in `backend/migrations/`

---

**Last Updated**: 2024
**Version**: 1.0.0
