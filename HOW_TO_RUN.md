# How to Run LifeVault Application

## Quick Start Guide

### Prerequisites

Make sure you have installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Supabase account with project set up

### 1. Run Backend Server

**Option A: Development Mode (with auto-reload)**

```bash
cd backend
npm run dev
```

The backend will start on **http://localhost:3000**

You should see:
```
🚀 LifeVault API server is running on port 3000
📝 Environment: development
🔒 CORS enabled for: http://localhost:5174
⏱️  Rate limit: 100 requests per 15 minutes
```

**Option B: Production Mode**

```bash
cd backend
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

### 2. Run Frontend Server

**In a new terminal:**

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:5173** or **http://localhost:5174**

You should see:
```
VITE v7.2.2  ready in XXX ms
➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

### 3. Access the Application

Open your browser and go to:
**http://localhost:5174** (or the port shown in your terminal)

## Detailed Instructions

### First Time Setup

If this is your first time running the application:

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-256-bits
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5174
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Run Database Migrations

```bash
cd backend/migrations

# Test connection
node test_connection.js

# Apply schema migration
node -e "const { Client } = require('pg'); const fs = require('fs'); const client = new Client({ connectionString: process.env.DATABASE_URL }); client.connect().then(() => { const sql = fs.readFileSync('001_initial_schema.sql', 'utf8'); return client.query(sql); }).then(() => { console.log('✅ Schema migration complete'); client.end(); }).catch(err => { console.error('❌ Migration failed:', err); client.end(); });"

# Apply RLS policies
node apply_rls_migration.js

# Apply storage configuration
node apply_storage_migration.js
```

### Running the Application

#### Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Production Mode

**Build both applications:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

**Run production servers:**
```bash
# Backend
cd backend
npm start

# Frontend (using a static server)
cd frontend
npx serve -s dist -p 5174
```

## Available Scripts

### Backend Scripts

```bash
npm run dev          # Start development server with auto-reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled production server
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Troubleshooting

### Port Already in Use

**Problem:** Port 3000 or 5173 is already in use

**Solution:**
```bash
# Find and kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

Or update the port in your `.env` files.

### CORS Errors

**Problem:** CORS errors in browser console

**Solution:**
1. Check `backend/.env` has correct `FRONTEND_URL`
2. Make sure it matches the port your frontend is running on
3. Restart backend server

### Database Connection Errors

**Problem:** Cannot connect to Supabase

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `backend/.env`
2. Check your Supabase project is active
3. Verify network connection
4. Test connection: `cd backend/migrations && node test_connection.js`

### Module Not Found Errors

**Problem:** Cannot find module errors

**Solution:**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Checking Server Status

### Backend Health Check

```bash
curl http://localhost:3000/health
```

Should return server status information.

### Frontend Check

Open http://localhost:5174 in your browser. You should see the login page.

## Stopping the Servers

Press `Ctrl + C` in each terminal window to stop the servers.

## Running Tests

### Backend Tests

```bash
cd backend
npm test
```

### E2E Tests

```bash
# Make sure both backend and frontend are running first
npm run test:e2e
```

Or use the script:
```bash
./run-e2e-tests.sh
```

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `JWT_SECRET` | Secret for JWT tokens | Min 32 characters |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | From Supabase dashboard |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5174` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | From Supabase dashboard |

## Quick Commands Cheat Sheet

```bash
# Start everything (run in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev

# Build everything
cd backend && npm run build
cd frontend && npm run build

# Run tests
cd backend && npm test
npm run test:e2e

# Check logs
cd backend && tail -f logs/app.log  # if logging to file

# Restart servers
# Press Ctrl+C in each terminal, then run npm run dev again
```

## Production Deployment

For production deployment, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `DEPLOYMENT_QUICK_START.md` - Quick deployment guide
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-deployment checklist

## Need Help?

- Check `README.md` for project overview
- See `ROUTING_AND_CORS_FIX.md` for common issues
- Review `BACKEND_TEST_SETUP.md` for testing setup
- Check GitHub issues: https://github.com/basavarajkonkani/liffe-vault/issues

## Summary

**To run the application:**

1. **Backend:** `cd backend && npm run dev`
2. **Frontend:** `cd frontend && npm run dev`
3. **Access:** Open http://localhost:5174 in your browser

That's it! 🚀
