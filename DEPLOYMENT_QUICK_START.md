# LifeVault Deployment Quick Start

This is a condensed deployment guide for experienced developers. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites

- Supabase production project created
- Node.js 18+ installed
- Hosting accounts ready (Vercel/Netlify for frontend, Railway/Render for backend)

## 1. Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32
```

## 2. Configure Supabase

1. Create production project at [supabase.com](https://supabase.com)
2. Get credentials from Settings → API:
   - Project URL
   - anon public key (for frontend)
   - service_role key (for backend)

## 3. Run Database Migrations

In Supabase SQL Editor, run in order:
1. `backend/migrations/001_initial_schema.sql`
2. `backend/migrations/002_rls_policies.sql`
3. `backend/migrations/003_storage_buckets.sql`

## 4. Configure Backend

Create `backend/.env.production`:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=<your-generated-secret>
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
FRONTEND_URL=https://your-frontend-domain.com
```

## 5. Configure Frontend

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 6. Deploy Backend

### Option A: Railway
```bash
cd backend
railway login
railway init
railway variables set PORT=3000 NODE_ENV=production JWT_SECRET="..." SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..." FRONTEND_URL="..."
railway up
```

### Option B: Manual with PM2
```bash
cd backend
npm ci --production=false
npm run build
# Copy dist/ to server
pm2 start ecosystem.config.js --env production
```

## 7. Deploy Frontend

### Option A: Vercel
```bash
cd frontend
vercel --prod
# Set environment variables in Vercel dashboard
```

### Option B: Netlify
```bash
cd frontend
netlify deploy --prod
# Set environment variables in Netlify dashboard
```

## 8. Verify Deployment

```bash
# Test backend health
curl https://your-backend-domain.com/health

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -X OPTIONS \
     https://your-backend-domain.com/auth/send-otp

# Open frontend in browser and test authentication flow
```

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `FRONTEND_URL` matches frontend domain exactly |
| 401 errors | Check JWT_SECRET is set and tokens are being sent |
| Database errors | Verify SUPABASE_SERVICE_KEY (not anon key) |
| Upload failures | Check storage bucket exists and RLS policies |

## Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] JWT_SECRET is secure random string (32+ characters)
- [ ] Environment files not committed to git
- [ ] CORS configured for production domain only
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting active (100 req/15min)

## Next Steps

1. Set up monitoring (UptimeRobot, Sentry)
2. Configure automated backups
3. Set up SSL certificate auto-renewal
4. Review logs for errors
5. Test complete user flows

For detailed instructions, troubleshooting, and best practices, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
