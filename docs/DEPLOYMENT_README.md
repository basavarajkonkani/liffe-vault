# LifeVault Deployment Documentation

This directory contains comprehensive deployment documentation for the LifeVault application.

## Quick Links

- **[Deployment Quick Start](./DEPLOYMENT_QUICK_START.md)** - Fast deployment guide for experienced developers
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions with detailed steps
- **[Production Readiness Checklist](./PRODUCTION_READINESS_CHECKLIST.md)** - 150+ item checklist for production deployment
- **[HTTPS Configuration](./HTTPS_CONFIGURATION.md)** - SSL/TLS setup guide for secure connections

## Deployment Files

### Frontend
- `frontend/.env.production` - Production environment configuration template
- `frontend/deploy.sh` - Automated deployment script

### Backend
- `backend/.env.production` - Production environment configuration template
- `backend/deploy.sh` - Automated deployment script
- `backend/ecosystem.config.js` - PM2 process manager configuration

## Getting Started

### For First-Time Deployment

1. **Read the Quick Start**: [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
2. **Follow the Full Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. **Complete the Checklist**: [PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md)
4. **Configure HTTPS**: [HTTPS_CONFIGURATION.md](./HTTPS_CONFIGURATION.md)

### For Quick Deployment

If you're experienced with deployments:

```bash
# 1. Configure environment files
cp frontend/.env.production frontend/.env.production.local
cp backend/.env.production backend/.env.production.local
# Edit the .local files with your actual values

# 2. Run deployment scripts
cd frontend && ./deploy.sh
cd ../backend && ./deploy.sh

# 3. Deploy to your hosting platform
# See DEPLOYMENT_QUICK_START.md for platform-specific commands
```

## Documentation Structure

### 1. Quick Start Guide
**File**: `DEPLOYMENT_QUICK_START.md`

**For**: Experienced developers who need a quick reference

**Contains**:
- Prerequisites checklist
- Step-by-step deployment commands
- Common issues and solutions
- Security checklist

**Time to read**: 5-10 minutes

### 2. Complete Deployment Guide
**File**: `DEPLOYMENT_GUIDE.md`

**For**: Detailed deployment with explanations

**Contains**:
- Pre-deployment checklist
- Environment configuration
- Database setup instructions
- Backend deployment (Railway, PM2, manual)
- Frontend deployment (Vercel, Netlify)
- Post-deployment verification
- Monitoring and maintenance
- Troubleshooting guide

**Time to read**: 30-45 minutes

### 3. Production Readiness Checklist
**File**: `PRODUCTION_READINESS_CHECKLIST.md`

**For**: Ensuring production readiness

**Contains**:
- 150+ checklist items
- Security verification
- Configuration validation
- Testing requirements
- Deployment verification
- Monitoring setup
- Sign-off template

**Time to complete**: 2-4 hours

### 4. HTTPS Configuration Guide
**File**: `HTTPS_CONFIGURATION.md`

**For**: Setting up SSL/TLS certificates

**Contains**:
- Platform-specific HTTPS setup (Vercel, Netlify, Railway, Render)
- Manual Nginx + Let's Encrypt configuration
- SSL verification steps
- Security best practices
- Troubleshooting SSL issues

**Time to read**: 20-30 minutes

## Deployment Scripts

### Frontend Deployment Script
**File**: `frontend/deploy.sh`

**Usage**:
```bash
cd frontend
./deploy.sh
```

**What it does**:
- Validates `.env.production` exists
- Installs dependencies
- Runs linter
- Builds production bundle
- Provides next steps

### Backend Deployment Script
**File**: `backend/deploy.sh`

**Usage**:
```bash
cd backend
./deploy.sh
```

**What it does**:
- Validates `.env.production` exists
- Validates critical environment variables
- Installs dependencies
- Runs tests
- Builds TypeScript
- Copies environment file to dist
- Provides next steps

### PM2 Configuration
**File**: `backend/ecosystem.config.js`

**Usage**:
```bash
pm2 start ecosystem.config.js --env production
```

**Features**:
- Cluster mode for load balancing
- Auto-restart on crash
- Memory limit monitoring
- Log management
- Environment file loading

## Environment Configuration

### Frontend Environment Variables

**File**: `frontend/.env.production`

**Required Variables**:
```env
VITE_API_URL=https://api.lifevault.com
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend Environment Variables

**File**: `backend/.env.production`

**Required Variables**:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-random-string
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=https://lifevault.com
```

**Important**: Never commit `.env.production` files with real credentials!

## Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Pre-Deployment Phase                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Review Production Readiness Checklist                    │
│ 2. Generate secure JWT secret                               │
│ 3. Create Supabase production project                       │
│ 4. Configure environment files                              │
│ 5. Run database migrations                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend Deployment                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Run backend/deploy.sh                                    │
│ 2. Deploy to hosting platform (Railway/Render/PM2)          │
│ 3. Configure HTTPS (see HTTPS_CONFIGURATION.md)             │
│ 4. Verify health check endpoint                             │
│ 5. Test database connection                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Deployment                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Update VITE_API_URL with backend URL                     │
│ 2. Run frontend/deploy.sh                                   │
│ 3. Deploy to hosting platform (Vercel/Netlify)              │
│ 4. Configure HTTPS (automatic on most platforms)            │
│ 5. Verify frontend loads correctly                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Post-Deployment Phase                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Test complete authentication flow                        │
│ 2. Verify CORS configuration                                │
│ 3. Test file upload and download                            │
│ 4. Set up monitoring and alerts                             │
│ 5. Monitor logs for 24-48 hours                             │
└─────────────────────────────────────────────────────────────┘
```

## Support and Troubleshooting

### Common Issues

| Issue | Documentation |
|-------|---------------|
| CORS errors | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#cors-errors) |
| SSL/HTTPS issues | [HTTPS_CONFIGURATION.md](./HTTPS_CONFIGURATION.md#troubleshooting) |
| Database connection | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#database-connection-errors) |
| Environment variables | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#environment-variables-not-loading) |
| File upload failures | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#file-upload-failures) |

### Getting Help

1. Check the troubleshooting sections in the deployment guides
2. Review application logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test API endpoints with curl or Postman
5. Consult the main README files in `frontend/` and `backend/` directories

## Security Reminders

- ✅ Always use HTTPS in production
- ✅ Generate secure JWT secrets (min 256 bits)
- ✅ Never commit `.env.production` files with real credentials
- ✅ Use service_role key for backend, anon key for frontend
- ✅ Configure CORS to allow only your frontend domain
- ✅ Enable RLS policies on all Supabase tables
- ✅ Set up rate limiting (already configured)
- ✅ Monitor logs for suspicious activity

## Maintenance

### Regular Tasks

**Weekly**:
- Review application logs
- Check uptime monitoring reports
- Monitor storage usage

**Monthly**:
- Update dependencies: `npm update`
- Review SSL certificate expiry
- Check for security updates

**Quarterly**:
- Perform security audit
- Review and update RLS policies
- Test disaster recovery procedures

### Monitoring Setup

Recommended monitoring tools:
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Logs**: PM2 logs, hosting platform logs
- **SSL**: SSL Labs, certificate expiry monitoring

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## Quick Reference

### Deployment Commands

```bash
# Frontend deployment
cd frontend
./deploy.sh
vercel --prod  # or netlify deploy --prod

# Backend deployment
cd backend
./deploy.sh
railway up  # or pm2 start ecosystem.config.js --env production

# Health checks
curl https://api.lifevault.com/health
curl https://lifevault.com
```

### Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Let's Encrypt**: https://letsencrypt.org

---

**Last Updated**: 2024
**Version**: 1.0.0

For questions or issues, refer to the detailed guides linked above.
