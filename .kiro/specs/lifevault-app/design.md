# LifeVault Application Design Document

## Overview

LifeVault is a secure, production-ready digital asset management system built with a modern tech stack. The application follows a three-phase development approach: Frontend (React + TypeScript + Tailwind + shadcn/ui), Backend (Node.js + Express), and Database Integration (Supabase). The system implements banking-grade security with role-based access control, OTP authentication, PIN-based login, and encrypted document storage.

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React for icons
- Axios for HTTP requests
- React Router v6 for routing
- Zustand for state management

**Backend:**
- Node.js with Express
- TypeScript
- JWT for authentication
- Bcrypt for password hashing
- Zod for validation
- Multer for file uploads
- Express Rate Limit
- CORS middleware
- Supabase JS client

**Database & Services:**
- Supabase Auth (OTP authentication)
- Supabase Database (PostgreSQL with RLS)
- Supabase Storage (encrypted file storage)

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  React + TypeScript + Tailwind + shadcn/ui + React Router   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Vault   │  │ Nominee  │  │  Admin   │   │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│              Node.js + Express + TypeScript                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Assets  │  │ Nominees │  │  Admin   │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware (Auth, CORS, Rate Limit)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase Client SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Services                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Auth   │  │ Database │  │ Storage  │                 │
│  │   (OTP)  │  │   (RLS)  │  │ (Files)  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Registration/Login Flow:
1. User enters email → Backend sends OTP via Supabase Auth
2. User enters OTP → Backend verifies with Supabase
3. User sets 6-digit PIN → Backend hashes and stores in database
4. User selects role → Stored in Supabase user_metadata
5. User logs in with PIN → Backend generates JWT token
6. Frontend stores JWT → Used for all subsequent API calls
```

### Role-Based Access Control

```
Asset Owner:
- Create, read, update, delete own assets
- Upload documents to own assets
- Link/unlink nominees to own assets
- View own dashboard with statistics

Nominee:
- Read assets shared with them
- Download documents from shared assets
- View shared asset dashboard
- Cannot modify or delete assets

Administrator:
- Read all users and assets
- View system statistics
- Manage user accounts
- Access audit logs
- Cannot modify user assets directly
```

## Components and Interfaces

### Frontend Component Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── OTPForm.tsx
│   │   ├── PINSetup.tsx
│   │   └── RoleSelector.tsx
│   ├── vault/
│   │   ├── AssetCard.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── CategoryFilter.tsx
│   ├── nominee/
│   │   ├── NomineeSelector.tsx
│   │   ├── LinkedNomineesList.tsx
│   │   └── SharedAssetCard.tsx
│   └── admin/
│       ├── UserTable.tsx
│       ├── AssetTable.tsx
│       └── StatsCard.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── OTPVerificationPage.tsx
│   │   ├── PINSetupPage.tsx
│   │   └── RoleSelectorPage.tsx
│   ├── dashboard/
│   │   ├── OwnerDashboard.tsx
│   │   ├── NomineeDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── vault/
│   │   ├── VaultPage.tsx
│   │   ├── AssetDetailPage.tsx
│   │   └── UploadPage.tsx
│   ├── nominee/
│   │   ├── NomineeLinkingPage.tsx
│   │   └── SharedAssetsPage.tsx
│   └── admin/
│       ├── UsersManagementPage.tsx
│       └── AssetsManagementPage.tsx
├── lib/
│   ├── api.ts              # Axios instance with interceptors
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # Helper functions
├── store/
│   └── authStore.ts        # Zustand store for auth state
├── types/
│   └── index.ts            # TypeScript interfaces
└── App.tsx                 # Main app with routing
```

### Backend API Structure

```
src/
├── routes/
│   ├── auth.routes.ts      # Authentication endpoints
│   ├── assets.routes.ts    # Asset management endpoints
│   ├── nominees.routes.ts  # Nominee management endpoints
│   └── admin.routes.ts     # Admin endpoints
├── controllers/
│   ├── auth.controller.ts
│   ├── assets.controller.ts
│   ├── nominees.controller.ts
│   └── admin.controller.ts
├── middleware/
│   ├── auth.middleware.ts  # JWT verification
│   ├── role.middleware.ts  # Role-based access control
│   └── validate.middleware.ts  # Zod validation
├── services/
│   ├── auth.service.ts     # Supabase Auth integration
│   ├── storage.service.ts  # Supabase Storage integration
│   └── database.service.ts # Supabase DB queries
├── schemas/
│   ├── auth.schema.ts      # Zod schemas for auth
│   ├── asset.schema.ts     # Zod schemas for assets
│   └── nominee.schema.ts   # Zod schemas for nominees
├── types/
│   └── index.ts            # TypeScript interfaces
├── config/
│   ├── supabase.ts         # Supabase client configuration
│   └── env.ts              # Environment variables
└── server.ts               # Express app setup
```

### Key TypeScript Interfaces

```typescript
// User Interface
interface User {
  id: string;
  email: string;
  role: 'owner' | 'nominee' | 'admin';
  pin_hash: string;
  created_at: string;
  updated_at: string;
}

// Asset Interface
interface Asset {
  id: string;
  owner_id: string;
  title: string;
  category: 'Legal' | 'Financial' | 'Medical' | 'Personal' | 'Other';
  created_at: string;
  updated_at: string;
  owner?: User;
  documents?: Document[];
  linked_nominees?: LinkedNominee[];
}

// Document Interface
interface Document {
  id: string;
  asset_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

// Nominee Interface
interface Nominee {
  id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

// Linked Nominee Interface
interface LinkedNominee {
  id: string;
  asset_id: string;
  nominee_id: string;
  linked_at: string;
  nominee?: Nominee;
}

// JWT Payload Interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// API Response Interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Data Models

### Database Schema

```sql
-- Users table (managed by Supabase Auth, extended with custom fields)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'nominee', 'admin')),
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Legal', 'Financial', 'Medical', 'Personal', 'Other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nominees table
CREATE TABLE nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Linked nominees table (junction table)
CREATE TABLE linked_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, nominee_id)
);

-- Indexes for performance
CREATE INDEX idx_assets_owner_id ON assets(owner_id);
CREATE INDEX idx_documents_asset_id ON documents(asset_id);
CREATE INDEX idx_linked_nominees_asset_id ON linked_nominees(asset_id);
CREATE INDEX idx_linked_nominees_nominee_id ON linked_nominees(nominee_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_nominees ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Assets table policies
CREATE POLICY "Owners can view their own assets"
  ON assets FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Nominees can view shared assets"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM linked_nominees ln
      JOIN nominees n ON ln.nominee_id = n.id
      WHERE ln.asset_id = assets.id AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all assets"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Owners can insert their own assets"
  ON assets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own assets"
  ON assets FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own assets"
  ON assets FOR DELETE
  USING (owner_id = auth.uid());

-- Documents table policies
CREATE POLICY "Users can view documents of accessible assets"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets WHERE id = documents.asset_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM linked_nominees ln
          JOIN nominees n ON ln.nominee_id = n.id
          WHERE ln.asset_id = assets.id AND n.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Owners can insert documents to their assets"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets WHERE id = documents.asset_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete documents from their assets"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets WHERE id = documents.asset_id AND owner_id = auth.uid()
    )
  );

-- Linked nominees policies
CREATE POLICY "Owners can manage nominee links for their assets"
  ON linked_nominees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assets WHERE id = linked_nominees.asset_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their nominee links"
  ON linked_nominees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nominees WHERE id = linked_nominees.nominee_id AND user_id = auth.uid()
    )
  );
```

### Supabase Storage Buckets

```
Bucket: documents
- Public: false
- File size limit: 50MB
- Allowed MIME types: application/pdf, image/*, application/msword, 
  application/vnd.openxmlformats-officedocument.*, text/*

RLS Policies for Storage:
- Owners can upload to their asset folders
- Owners and nominees can download from accessible asset folders
- Admins can access all folders
```

## Error Handling

### Frontend Error Handling

```typescript
// Axios interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      authStore.logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission denied message
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      toast.error('Too many requests. Please try again later');
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later');
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your connection');
    } else {
      // Generic error
      toast.error(error.response?.data?.error || 'An error occurred');
    }
    return Promise.reject(error);
  }
);
```

### Backend Error Handling

```typescript
// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Generic error response (don't expose internal details)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
```

## Testing Strategy

### Frontend Testing

**Unit Tests:**
- Test utility functions in `lib/` directory
- Test custom hooks
- Test form validation logic
- Use Vitest as test runner

**Component Tests:**
- Test individual components with React Testing Library
- Test user interactions (clicks, form submissions)
- Test conditional rendering based on props
- Mock API calls with MSW (Mock Service Worker)

**Integration Tests:**
- Test complete user flows (login → dashboard → upload)
- Test routing and navigation
- Test state management with Zustand

**E2E Tests (Optional):**
- Use Playwright for critical user journeys
- Test authentication flow end-to-end
- Test file upload and download
- Test role-based access control

### Backend Testing

**Unit Tests:**
- Test service functions in isolation
- Test validation schemas with Zod
- Test utility functions
- Mock Supabase client calls

**Integration Tests:**
- Test API endpoints with supertest
- Test middleware chain
- Test database operations with test database
- Test file upload to Supabase Storage

**Security Tests:**
- Test JWT token validation
- Test rate limiting
- Test CORS configuration
- Test RLS policies in Supabase

### Testing Tools

- **Frontend:** Vitest, React Testing Library, MSW, Playwright
- **Backend:** Jest, Supertest, Supabase test client
- **Coverage:** Aim for 80%+ coverage on critical paths

## Security Considerations

### Authentication Security

1. **OTP Security:**
   - OTPs expire after 10 minutes
   - Maximum 3 attempts before account lockout
   - OTPs are 6 digits, cryptographically random

2. **PIN Security:**
   - PINs are hashed with bcrypt (cost factor 10)
   - Never stored in plain text
   - Maximum 3 failed attempts before lockout
   - Lockout duration: 15 minutes

3. **JWT Security:**
   - Tokens expire after 24 hours
   - Signed with strong secret key (min 256 bits)
   - Include user ID, email, and role in payload
   - Validated on every protected route

### Data Security

1. **Encryption:**
   - All data in transit encrypted with HTTPS/TLS
   - Files stored in Supabase Storage are encrypted at rest
   - Database connections use SSL

2. **Access Control:**
   - RLS policies enforce data isolation
   - Role-based access control on all endpoints
   - Principle of least privilege

3. **Input Validation:**
   - All inputs validated with Zod schemas
   - SQL injection prevented by parameterized queries
   - XSS prevented by React's built-in escaping
   - File upload validation (type, size, content)

### Infrastructure Security

1. **Environment Variables:**
   - All secrets stored in .env files
   - Never committed to version control
   - Different configs for dev/staging/prod

2. **Rate Limiting:**
   - 100 requests per 15 minutes per IP
   - Prevents brute force attacks
   - Prevents DoS attacks

3. **CORS:**
   - Whitelist only frontend domain
   - Credentials allowed only from trusted origins

## UI/UX Design Principles

### Color Scheme

**Primary Colors:**
- Primary Blue: `#0066CC` (trust, security)
- Light Blue: `#E6F2FF` (backgrounds)
- Dark Blue: `#003D7A` (text, emphasis)

**Neutral Colors:**
- White: `#FFFFFF` (backgrounds)
- Light Gray: `#F5F7FA` (secondary backgrounds)
- Medium Gray: `#8B95A5` (secondary text)
- Dark Gray: `#2D3748` (primary text)

**Status Colors:**
- Success: `#10B981` (green)
- Error: `#EF4444` (red)
- Warning: `#F59E0B` (amber)
- Info: `#3B82F6` (blue)

### Design Patterns

**Glassmorphism:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

**Shadows:**
```css
.shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
.shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
.shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
.shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

**Animations:**
```css
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Responsive Breakpoints

```
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large desktop
```

### Component Design Guidelines

1. **Cards:** Use glassmorphism with subtle shadows
2. **Buttons:** Primary (blue), Secondary (gray), Destructive (red)
3. **Forms:** Clear labels, inline validation, helpful error messages
4. **Tables:** Striped rows, hover effects, sortable columns
5. **Modals:** Centered, backdrop blur, smooth animations
6. **Navigation:** Fixed navbar, collapsible sidebar on mobile
7. **Icons:** Lucide React, consistent size (20px default)
8. **Typography:** Inter font family, clear hierarchy

## Performance Optimization

### Frontend Optimization

1. **Code Splitting:**
   - Lazy load routes with React.lazy()
   - Split vendor bundles
   - Dynamic imports for heavy components

2. **Asset Optimization:**
   - Compress images (WebP format)
   - Minify CSS and JavaScript
   - Use CDN for static assets

3. **Caching:**
   - Cache API responses with React Query
   - Service worker for offline support
   - Browser caching headers

4. **Rendering:**
   - Use React.memo for expensive components
   - Virtualize long lists with react-window
   - Debounce search inputs

### Backend Optimization

1. **Database:**
   - Index frequently queried columns
   - Use connection pooling
   - Implement pagination for large datasets
   - Cache frequent queries with Redis (future enhancement)

2. **File Handling:**
   - Stream large files instead of loading into memory
   - Generate signed URLs for direct downloads
   - Implement chunked uploads for large files

3. **API:**
   - Compress responses with gzip
   - Implement ETags for caching
   - Use HTTP/2 for multiplexing

## Deployment Strategy

### Frontend Deployment

**Platform:** Vercel or Netlify

**Build Process:**
```bash
npm run build
# Outputs optimized static files to dist/
```

**Environment Variables:**
```
VITE_API_URL=https://api.lifevault.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Backend Deployment

**Platform:** Railway, Render, or AWS EC2

**Build Process:**
```bash
npm run build
# Compiles TypeScript to JavaScript in dist/
```

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
JWT_SECRET=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
FRONTEND_URL=https://lifevault.com
```

**Process Manager:** PM2 for production

### Database Setup

**Supabase Project:**
1. Create new Supabase project
2. Run SQL migrations to create tables
3. Configure RLS policies
4. Create storage buckets
5. Set up authentication providers

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build production bundle
      - Deploy to Vercel

  backend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build TypeScript
      - Deploy to Railway
```

## Phase Implementation Order

### Phase 1: Frontend (Week 1-2)

1. Project setup with Vite + React + TypeScript
2. Install and configure Tailwind CSS
3. Install shadcn/ui components
4. Create routing structure with React Router
5. Build authentication pages (Login, OTP, PIN, Role)
6. Build dashboard layouts for all roles
7. Build vault pages (upload, view, download)
8. Build nominee linking pages
9. Build admin management pages
10. Implement state management with Zustand
11. Create API client with Axios
12. Add animations and glassmorphism effects
13. Test responsive design on all breakpoints

### Phase 2: Backend (Week 3)

1. Project setup with Express + TypeScript
2. Configure Supabase client
3. Implement authentication routes
4. Implement JWT middleware
5. Implement role-based access middleware
6. Implement asset management routes
7. Implement document upload/download routes
8. Implement nominee management routes
9. Implement admin routes
10. Add Zod validation schemas
11. Configure CORS and rate limiting
12. Add error handling middleware
13. Test all endpoints with Postman/Thunder Client

### Phase 3: Database Integration (Week 4)

1. Create Supabase project
2. Run SQL migrations for tables
3. Configure RLS policies
4. Create storage buckets
5. Test RLS policies with different users
6. Connect backend to Supabase
7. Connect frontend to backend
8. Test complete authentication flow
9. Test file upload and download
10. Test role-based access control
11. Fix CORS and environment issues
12. Perform end-to-end testing
13. Optimize and prepare for production

## Monitoring and Maintenance

### Logging

**Frontend:**
- Console errors in development
- Sentry for production error tracking
- Analytics with Google Analytics or Plausible

**Backend:**
- Winston or Pino for structured logging
- Log levels: error, warn, info, debug
- Log rotation for disk space management

### Monitoring

**Application:**
- Uptime monitoring with UptimeRobot
- Performance monitoring with New Relic or Datadog
- API response time tracking

**Database:**
- Supabase dashboard for query performance
- Monitor connection pool usage
- Track storage usage

### Backup Strategy

**Database:**
- Supabase automatic daily backups
- Point-in-time recovery available
- Export critical data weekly

**Files:**
- Supabase Storage automatic replication
- Consider additional backup to S3

## Future Enhancements

1. **Two-Factor Authentication:** Add TOTP-based 2FA
2. **Document Versioning:** Track document changes over time
3. **Audit Logs:** Detailed activity logs for compliance
4. **Email Notifications:** Notify nominees when assets are shared
5. **Mobile Apps:** Native iOS and Android applications
6. **Document Preview:** In-browser preview for PDFs and images
7. **Advanced Search:** Full-text search across documents
8. **Encryption at Rest:** Client-side encryption before upload
9. **Biometric Authentication:** Face ID / Touch ID support
10. **Multi-language Support:** Internationalization (i18n)
