# LifeVault - Secure Digital Asset Management System

LifeVault is a production-ready digital asset management application that enables users to securely store, manage, and share important documents with designated nominees. Built with banking-grade security and modern web technologies.

## 🚀 Features

- **Secure Authentication**: OTP-based registration with PIN login
- **Role-Based Access**: Asset Owners, Nominees, and Administrators
- **Document Management**: Upload, organize, and share documents securely
- **Nominee System**: Designate trusted individuals to access specific assets
- **Admin Dashboard**: System-wide user and asset management
- **Banking-Grade Security**: JWT authentication, bcrypt hashing, RLS policies
- **Modern UI**: Glassmorphism design with blue theme, fully responsive

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 19 + TypeScript
- Vite (Rolldown) for build tooling
- Tailwind CSS + shadcn/ui components
- React Router for routing
- Axios for API calls
- Zustand for state management

**Backend**:
- Node.js + Express + TypeScript
- JWT authentication
- Zod validation
- Bcrypt password hashing
- Rate limiting and CORS protection

**Database & Services**:
- Supabase Auth (OTP authentication)
- Supabase Database (PostgreSQL with RLS)
- Supabase Storage (encrypted file storage)

## 📁 Project Structure

```
Liffe-Vault/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and API client
│   │   ├── store/           # Zustand state management
│   │   └── types/           # TypeScript interfaces
│   ├── .env.production      # Production environment config
│   └── deploy.sh            # Deployment script
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── services/        # Business logic
│   │   ├── schemas/         # Zod validation schemas
│   │   └── config/          # Configuration
│   ├── migrations/          # Database migrations
│   ├── .env.production      # Production environment config
│   ├── deploy.sh            # Deployment script
│   └── ecosystem.config.js  # PM2 configuration
│
├── .kiro/specs/lifevault-app/  # Project specifications
│   ├── requirements.md      # Detailed requirements
│   ├── design.md            # System design document
│   └── tasks.md             # Implementation tasks
│
└── Deployment Documentation
    ├── DEPLOYMENT_README.md              # Deployment docs overview
    ├── DEPLOYMENT_QUICK_START.md         # Quick deployment guide
    ├── DEPLOYMENT_GUIDE.md               # Complete deployment guide
    ├── PRODUCTION_READINESS_CHECKLIST.md # 150+ item checklist
    └── HTTPS_CONFIGURATION.md            # SSL/TLS setup guide
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Development Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Liffe-Vault
```

2. **Set up Frontend**:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Set up Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Set up Database**:
   - Create a Supabase project
   - Run migrations from `backend/migrations/`
   - See `backend/migrations/README.md` for details

### Running the Application

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm run dev
```

**Backend** (http://localhost:3000):
```bash
cd backend
npm run dev
```

## 📚 Documentation

### For Developers

- **[Frontend README](./frontend/README.md)** - Frontend setup and development
- **[Backend README](./backend/README.md)** - Backend setup and API documentation
- **[Requirements](./kiro/specs/lifevault-app/requirements.md)** - Detailed requirements
- **[Design Document](./.kiro/specs/lifevault-app/design.md)** - System architecture and design
- **[Tasks](./.kiro/specs/lifevault-app/tasks.md)** - Implementation task list

### For Deployment

- **[Deployment Overview](./DEPLOYMENT_README.md)** - Start here for deployment
- **[Quick Start Guide](./DEPLOYMENT_QUICK_START.md)** - Fast deployment (5-10 min read)
- **[Complete Guide](./DEPLOYMENT_GUIDE.md)** - Detailed deployment (30-45 min read)
- **[Production Checklist](./PRODUCTION_READINESS_CHECKLIST.md)** - 150+ verification items
- **[HTTPS Setup](./HTTPS_CONFIGURATION.md)** - SSL/TLS configuration

## 🔒 Security Features

- **Authentication**: OTP verification + 6-digit PIN
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: HTTPS/TLS for data in transit, encryption at rest
- **Password Security**: Bcrypt hashing with cost factor 10
- **Token Security**: JWT with 24-hour expiry
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Database Security**: Row Level Security (RLS) policies
- **Input Validation**: Zod schemas for all inputs
- **CORS Protection**: Whitelist-based origin validation

## 🧪 Testing

### Backend Unit Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### End-to-End Tests

LifeVault includes comprehensive E2E tests using Playwright that cover:
- Authentication flow (OTP, PIN setup, login)
- Asset management (upload, view, edit, delete)
- Nominee linking and shared asset access
- Role-based access control

**Prerequisites**: Start both backend and frontend servers before running E2E tests.

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Run E2E tests
npm run test:e2e              # Run all E2E tests (headless)
npm run test:e2e:headed       # Run with visible browser
npm run test:e2e:ui           # Run in interactive UI mode
npm run test:e2e:debug        # Run in debug mode
npm run test:e2e:report       # View test report

# Or use the helper script
./run-e2e-tests.sh            # Checks services and runs tests
./run-e2e-tests.sh headed     # Run with visible browser
./run-e2e-tests.sh ui         # Run in UI mode
```

**Documentation**: See [E2E Testing Guide](./E2E_TESTING_GUIDE.md) for detailed instructions.

### Frontend Build Verification

```bash
cd frontend
npm run lint
npm run build  # Verify build succeeds
```

## 🚀 Deployment

### Quick Deployment

1. **Configure environment files**:
```bash
# Frontend
cp frontend/.env.production frontend/.env.production.local
# Edit with your production values

# Backend
cp backend/.env.production backend/.env.production.local
# Edit with your production values
```

2. **Run deployment scripts**:
```bash
# Frontend
cd frontend && ./deploy.sh

# Backend
cd backend && ./deploy.sh
```

3. **Deploy to hosting platforms**:
   - **Frontend**: Vercel, Netlify, or static hosting
   - **Backend**: Railway, Render, AWS, or VPS with PM2

### Detailed Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Step-by-step instructions
- Platform-specific guides
- Database setup
- HTTPS configuration
- Troubleshooting

## 📊 API Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/set-pin` - Set user PIN
- `POST /auth/login-pin` - Login with PIN
- `GET /auth/profile` - Get user profile

### Assets
- `GET /assets` - Get user assets
- `POST /assets` - Create new asset
- `GET /assets/:id` - Get asset details
- `PATCH /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### Documents
- `POST /assets/:id/documents` - Upload document
- `GET /assets/:id/documents` - Get asset documents
- `GET /documents/:id/download` - Download document
- `DELETE /documents/:id` - Delete document

### Nominees
- `GET /nominees` - Get all nominees
- `POST /nominees/link` - Link nominee to asset
- `DELETE /nominees/link/:id` - Unlink nominee
- `GET /nominees/asset/:assetId` - Get linked nominees

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/assets` - Get all assets
- `GET /admin/users/:id` - Get user details
- `PATCH /admin/users/:id` - Update user

## 🛠️ Development Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run verify:env   # Verify environment config
```

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run verify:env   # Verify environment config
npm run test:cors    # Test CORS configuration
```

## 🤝 Contributing

1. Review the [Requirements](./.kiro/specs/lifevault-app/requirements.md) and [Design](./.kiro/specs/lifevault-app/design.md) documents
2. Check the [Tasks](./.kiro/specs/lifevault-app/tasks.md) for implementation status
3. Follow the existing code style and patterns
4. Write tests for new features
5. Update documentation as needed

## 📝 License

ISC

## 🆘 Support

### Documentation
- Check the README files in `frontend/` and `backend/` directories
- Review the deployment guides in the root directory
- Consult the specifications in `.kiro/specs/lifevault-app/`

### Troubleshooting
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting) for common issues
- Check application logs for detailed error messages
- Verify environment variables are set correctly
- Test API endpoints with curl or Postman

## 🎯 Project Status

**Current Phase**: Production Ready

**Completed**:
- ✅ Frontend UI (React + TypeScript + Tailwind)
- ✅ Backend API (Express + TypeScript)
- ✅ Database Integration (Supabase)
- ✅ Authentication & Authorization
- ✅ File Upload & Storage
- ✅ Role-Based Access Control
- ✅ Deployment Configuration

**Remaining** (Optional):
- ⏳ Remove unused files and optimize
- ✅ End-to-end tests with Playwright
- ⏳ Production deployment

See [tasks.md](./.kiro/specs/lifevault-app/tasks.md) for detailed task list.

---

**Built with ❤️ using modern web technologies**
