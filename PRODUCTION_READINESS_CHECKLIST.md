# LifeVault Production Readiness Checklist

Use this checklist to ensure your LifeVault deployment is production-ready and secure.

## Security

### Authentication & Authorization
- [ ] JWT_SECRET is a cryptographically secure random string (min 256 bits / 32 characters)
- [ ] JWT tokens expire after 24 hours
- [ ] PINs are hashed with bcrypt (cost factor 10)
- [ ] OTP codes expire after 10 minutes
- [ ] Account lockout after 3 failed login attempts (15-minute lockout)
- [ ] All API endpoints require authentication (except public routes)
- [ ] Role-based access control (RBAC) is enforced on all protected routes

### Data Protection
- [ ] All data in transit uses HTTPS/TLS
- [ ] Files stored in Supabase Storage are encrypted at rest
- [ ] Database connections use SSL
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested for all user roles (owner, nominee, admin)
- [ ] No sensitive data in logs or error messages
- [ ] Environment variables used for all secrets (no hardcoded credentials)

### Input Validation & Sanitization
- [ ] All API inputs validated with Zod schemas
- [ ] File upload size limited to 50 MB
- [ ] File upload types validated
- [ ] SQL injection prevented (using parameterized queries)
- [ ] XSS prevented (React's built-in escaping)
- [ ] CSRF protection in place (SameSite cookies if used)

### Network Security
- [ ] CORS configured to allow only production frontend domain
- [ ] Rate limiting active (100 requests per 15 minutes per IP)
- [ ] No CORS wildcard (*) in production
- [ ] Credentials properly configured in CORS
- [ ] Security headers configured (if using reverse proxy)

## Configuration

### Environment Variables
- [ ] Frontend `.env.production` created with production values
- [ ] Backend `.env.production` created with production values
- [ ] All `.env.production` files added to `.gitignore`
- [ ] No example/placeholder values in production configs
- [ ] Environment variables set in hosting platform
- [ ] `NODE_ENV=production` set in backend
- [ ] `FRONTEND_URL` matches actual frontend domain
- [ ] `VITE_API_URL` matches actual backend domain

### Database
- [ ] Production Supabase project created
- [ ] All migrations run successfully (001, 002, 003)
- [ ] Database schema verified (5 tables exist)
- [ ] RLS policies verified (all tables protected)
- [ ] Storage bucket "documents" created
- [ ] Storage policies configured correctly
- [ ] Database backups enabled (automatic daily backups)
- [ ] Connection pooling configured

### API Configuration
- [ ] Backend API accessible via HTTPS
- [ ] Health check endpoint working: `GET /health`
- [ ] All routes return proper HTTP status codes
- [ ] Error responses don't expose internal details
- [ ] API documentation up to date

## Code Quality

### Frontend
- [ ] TypeScript compilation successful: `npm run build`
- [ ] No TypeScript errors
- [ ] Linter passes: `npm run lint`
- [ ] No console.log statements with sensitive data
- [ ] All components use TypeScript strict mode
- [ ] Production build optimized and minified
- [ ] Bundle size reasonable (check with `npm run build`)

### Backend
- [ ] TypeScript compilation successful: `npm run build`
- [ ] No TypeScript errors
- [ ] All tests pass: `npm test`
- [ ] Test coverage adequate (aim for 80%+ on critical paths)
- [ ] No console.log statements with sensitive data
- [ ] Error handling middleware in place
- [ ] All async operations use try-catch or .catch()

## Testing

### Functional Testing
- [ ] Complete authentication flow tested (OTP → PIN setup → Login)
- [ ] Asset creation and management tested
- [ ] Document upload and download tested (up to 50 MB)
- [ ] Nominee linking and access tested
- [ ] Admin functionality tested
- [ ] Role-based access control tested for all roles
- [ ] Error scenarios tested (invalid OTP, wrong PIN, unauthorized access)

### Integration Testing
- [ ] Frontend successfully connects to backend API
- [ ] Backend successfully connects to Supabase
- [ ] File uploads work end-to-end
- [ ] Signed URLs for downloads work correctly
- [ ] CORS working from production frontend domain
- [ ] Rate limiting triggers correctly

### Performance Testing
- [ ] API response times acceptable (< 2 seconds for auth, < 5 seconds for uploads)
- [ ] Frontend loads quickly (< 3 seconds initial load)
- [ ] Large file uploads work (test with 40-50 MB files)
- [ ] Multiple concurrent users tested
- [ ] Database queries optimized (indexes in place)

### Browser Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Mobile responsive (320px to 2560px)
- [ ] Touch interactions work on mobile

## Deployment

### Infrastructure
- [ ] Frontend deployed to production hosting (Vercel/Netlify/etc.)
- [ ] Backend deployed to production hosting (Railway/Render/AWS/etc.)
- [ ] Custom domains configured (optional but recommended)
- [ ] SSL certificates installed and valid
- [ ] DNS records configured correctly
- [ ] CDN configured for static assets (if applicable)

### Process Management
- [ ] Backend runs with process manager (PM2 recommended)
- [ ] Auto-restart on crash enabled
- [ ] Graceful shutdown configured
- [ ] Multiple instances for load balancing (if needed)
- [ ] Memory limits configured

### Monitoring & Logging
- [ ] Application logs configured
- [ ] Error tracking set up (Sentry or similar)
- [ ] Uptime monitoring configured (UptimeRobot or similar)
- [ ] Performance monitoring set up (optional)
- [ ] Log rotation configured
- [ ] Alerts configured for critical errors

## Documentation

### Code Documentation
- [ ] README files updated with deployment info
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] Deployment guide reviewed

### Operational Documentation
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented
- [ ] Backup and recovery procedures documented
- [ ] Monitoring and alerting documented
- [ ] Troubleshooting guide available

## Compliance & Legal

### Data Privacy
- [ ] Privacy policy created (if required)
- [ ] Terms of service created (if required)
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data retention policies defined
- [ ] User data deletion process defined

### Audit & Compliance
- [ ] Admin actions logged for audit
- [ ] Security audit performed
- [ ] Penetration testing completed (if required)
- [ ] Compliance requirements met (if applicable)

## Post-Deployment

### Verification
- [ ] Health check endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login with PIN
- [ ] Can upload document
- [ ] Can download document
- [ ] Can link nominee
- [ ] Admin can view all users and assets
- [ ] CORS working correctly
- [ ] Rate limiting working

### Monitoring Setup
- [ ] Uptime monitoring active
- [ ] Error tracking receiving events
- [ ] Log aggregation working
- [ ] Alerts configured and tested
- [ ] Dashboard for metrics (optional)

### Backup Verification
- [ ] Database backup tested
- [ ] Backup restoration tested
- [ ] Backup schedule confirmed
- [ ] Off-site backup configured (optional)

## Maintenance Plan

### Regular Tasks
- [ ] Weekly log review scheduled
- [ ] Monthly dependency updates scheduled
- [ ] Quarterly security audits scheduled
- [ ] SSL certificate renewal process defined
- [ ] Database maintenance scheduled

### Incident Response
- [ ] Incident response plan created
- [ ] On-call rotation defined (if applicable)
- [ ] Escalation procedures documented
- [ ] Communication plan for outages

## Final Checks

### Pre-Launch
- [ ] All items in this checklist completed
- [ ] Stakeholders notified of launch
- [ ] Support team trained (if applicable)
- [ ] Rollback plan ready
- [ ] Launch date and time confirmed

### Launch Day
- [ ] Deploy backend first, then frontend
- [ ] Monitor logs during deployment
- [ ] Test critical user flows immediately after deployment
- [ ] Monitor error rates for first 24 hours
- [ ] Be ready to rollback if issues arise

### Post-Launch
- [ ] Monitor application for 48 hours
- [ ] Review error logs daily for first week
- [ ] Gather user feedback
- [ ] Address any issues promptly
- [ ] Document lessons learned

---

## Checklist Summary

**Total Items**: 150+

**Critical Items** (Must be completed):
- All Security items
- All Configuration items
- All Functional Testing items
- All Deployment items
- All Post-Deployment Verification items

**Recommended Items** (Should be completed):
- Code Quality items
- Performance Testing items
- Monitoring & Logging items
- Documentation items

**Optional Items** (Nice to have):
- Advanced monitoring
- CDN configuration
- Multiple backend instances
- Penetration testing

---

## Sign-Off

Once all critical items are completed, have the following stakeholders sign off:

- [ ] **Developer**: All code quality and testing items completed
- [ ] **DevOps**: All infrastructure and deployment items completed
- [ ] **Security**: All security items reviewed and approved
- [ ] **Product Owner**: All functional requirements met

**Deployment Approved By**: ___________________

**Date**: ___________________

---

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
