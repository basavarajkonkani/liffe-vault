# HTTPS Configuration Guide for LifeVault

This guide explains how to set up HTTPS/SSL for the LifeVault application in production.

## Why HTTPS is Required

LifeVault handles sensitive user data including:
- Authentication credentials (OTP, PIN)
- Personal documents and assets
- JWT tokens

**HTTPS is mandatory for production** to ensure:
- Data encryption in transit
- Protection against man-in-the-middle attacks
- Browser security features (secure cookies, service workers)
- User trust and confidence

## HTTPS Setup by Platform

### Frontend Hosting

#### Vercel (Automatic HTTPS)

Vercel provides automatic HTTPS for all deployments:

1. **Deploy your application**:
```bash
cd frontend
vercel --prod
```

2. **HTTPS is automatically enabled** for:
   - Default Vercel domain: `your-app.vercel.app`
   - Custom domains: Add in Vercel dashboard

3. **Add custom domain** (optional):
   - Go to Vercel Dashboard → Settings → Domains
   - Add your domain (e.g., `lifevault.com`)
   - Update DNS records as instructed
   - SSL certificate is automatically provisioned

**No additional configuration needed!**

#### Netlify (Automatic HTTPS)

Netlify also provides automatic HTTPS:

1. **Deploy your application**:
```bash
cd frontend
netlify deploy --prod
```

2. **HTTPS is automatically enabled** for:
   - Default Netlify domain: `your-app.netlify.app`
   - Custom domains: Add in Netlify dashboard

3. **Add custom domain** (optional):
   - Go to Netlify Dashboard → Domain Settings
   - Add your domain
   - Update DNS records
   - SSL certificate is automatically provisioned

**No additional configuration needed!**

### Backend Hosting

#### Railway (Automatic HTTPS)

Railway provides automatic HTTPS:

1. **Deploy your application**:
```bash
cd backend
railway up
```

2. **Get your HTTPS URL**:
```bash
railway domain
```

3. **Custom domain** (optional):
   - Go to Railway Dashboard → Settings → Domains
   - Add custom domain
   - Update DNS records
   - SSL is automatically configured

**No additional configuration needed!**

#### Render (Automatic HTTPS)

Render provides automatic HTTPS:

1. Deploy via Render dashboard or CLI
2. HTTPS is automatically enabled for:
   - Default Render domain: `your-app.onrender.com`
   - Custom domains: Add in Render dashboard

**No additional configuration needed!**

#### Manual Server Setup (Nginx + Let's Encrypt)

If deploying to your own server (AWS EC2, DigitalOcean, etc.):

##### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

##### 2. Configure Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/lifevault-api`:

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lifevault-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

##### 3. Install Certbot (Let's Encrypt)

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

##### 4. Obtain SSL Certificate

```bash
sudo certbot --nginx -d api.lifevault.com
```

Follow the prompts:
- Enter email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: yes)

##### 5. Verify HTTPS

```bash
curl https://api.lifevault.com/health
```

##### 6. Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

Certificates auto-renew via cron job at `/etc/cron.d/certbot`.

##### 7. Enhanced Nginx Configuration (Optional)

For better security, update your Nginx config:

```nginx
server {
    listen 443 ssl http2;
    server_name api.lifevault.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.lifevault.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.lifevault.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy Configuration
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.lifevault.com;
    return 301 https://$server_name$request_uri;
}
```

Restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Verification

### 1. Check SSL Certificate

```bash
# Check certificate details
openssl s_client -connect api.lifevault.com:443 -servername api.lifevault.com

# Check certificate expiry
echo | openssl s_client -connect api.lifevault.com:443 -servername api.lifevault.com 2>/dev/null | openssl x509 -noout -dates
```

### 2. Test HTTPS Connection

```bash
# Test backend API
curl -v https://api.lifevault.com/health

# Test frontend
curl -v https://lifevault.com
```

### 3. SSL Labs Test

Test your SSL configuration:
1. Go to [SSL Labs](https://www.ssllabs.com/ssltest/)
2. Enter your domain
3. Wait for analysis
4. Aim for A+ rating

### 4. Browser Test

1. Open your application in a browser
2. Check for padlock icon in address bar
3. Click padlock to view certificate details
4. Verify certificate is valid and trusted

## Environment Configuration

### Update Backend Environment

Ensure your backend `.env.production` uses HTTPS:

```env
# Frontend URL must use HTTPS in production
FRONTEND_URL=https://lifevault.com
```

### Update Frontend Environment

Ensure your frontend `.env.production` uses HTTPS:

```env
# API URL must use HTTPS in production
VITE_API_URL=https://api.lifevault.com
```

## Security Best Practices

### 1. Force HTTPS

Always redirect HTTP to HTTPS:

**Nginx**:
```nginx
server {
    listen 80;
    server_name api.lifevault.com;
    return 301 https://$server_name$request_uri;
}
```

**Express.js** (if not using reverse proxy):
```typescript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 2. HSTS (HTTP Strict Transport Security)

Add HSTS header to force browsers to use HTTPS:

**Nginx**:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Express.js**:
```typescript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});
```

### 3. Secure Cookies

If using cookies, ensure they're secure:

```typescript
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

### 4. Mixed Content

Ensure all resources (images, scripts, APIs) use HTTPS:

```typescript
// ❌ Bad - mixed content
const apiUrl = 'http://api.lifevault.com';

// ✅ Good - all HTTPS
const apiUrl = 'https://api.lifevault.com';
```

## Troubleshooting

### Certificate Not Trusted

**Symptom**: Browser shows "Not Secure" or certificate warning

**Solutions**:
- Verify certificate is from trusted CA (Let's Encrypt is trusted)
- Check certificate hasn't expired
- Ensure certificate matches domain name
- Clear browser cache and try again

### Mixed Content Errors

**Symptom**: Browser console shows mixed content warnings

**Solutions**:
- Update all HTTP URLs to HTTPS
- Check API calls use HTTPS
- Verify external resources use HTTPS
- Use relative URLs where possible

### CORS Errors with HTTPS

**Symptom**: CORS errors after enabling HTTPS

**Solutions**:
- Update `FRONTEND_URL` in backend to use `https://`
- Update `VITE_API_URL` in frontend to use `https://`
- Restart both frontend and backend
- Clear browser cache

### Certificate Renewal Fails

**Symptom**: Certbot renewal fails

**Solutions**:
```bash
# Check Certbot logs
sudo cat /var/log/letsencrypt/letsencrypt.log

# Manually renew
sudo certbot renew --force-renewal

# Check Nginx configuration
sudo nginx -t

# Ensure port 80 is accessible (needed for renewal)
sudo ufw allow 80/tcp
```

## Monitoring

### Certificate Expiry Monitoring

Set up monitoring for certificate expiry:

1. **Manual Check**:
```bash
echo | openssl s_client -connect api.lifevault.com:443 2>/dev/null | openssl x509 -noout -dates
```

2. **Automated Monitoring**:
   - Use [SSL Labs Monitoring](https://www.ssllabs.com/ssltest/)
   - Use [UptimeRobot](https://uptimerobot.com/) with SSL monitoring
   - Set up alerts 30 days before expiry

3. **Certbot Auto-Renewal**:
```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [OWASP Transport Layer Protection](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)

---

**Important**: HTTPS is not optional for LifeVault in production. All production deployments must use HTTPS to protect user data and maintain security.
