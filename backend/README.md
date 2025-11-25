# LifeVault Backend API

Secure digital asset management system backend built with Node.js, Express, and TypeScript.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** JWT + Supabase Auth
- **Validation:** Zod
- **Security:** bcrypt, express-rate-limit, CORS

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API route definitions
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── services/       # Business logic and external services
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # TypeScript interfaces
│   ├── config/         # Configuration files
│   └── server.ts       # Express app setup
├── dist/               # Compiled JavaScript (generated)
├── .env                # Environment variables (not in git)
├── .env.example        # Environment variables template
├── tsconfig.json       # TypeScript configuration
├── nodemon.json        # Nodemon configuration
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `JWT_SECRET` to a secure random string (min 256 bits)
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from your Supabase project
   - Set `FRONTEND_URL` to your frontend application URL

4. Run database migrations:
   - See [Database Setup](#database-setup) section below

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Production

Run the compiled application:
```bash
npm start
```

## Database Setup

### Running Migrations

The database schema must be created before the backend can function properly.

1. **Test your Supabase connection:**
```bash
node migrations/test_connection.js
```

2. **Run the migration in Supabase Dashboard:**
   - Open https://app.supabase.com
   - Navigate to SQL Editor
   - Copy contents of `migrations/001_initial_schema.sql`
   - Paste and run in SQL Editor
   - See `migrations/EXECUTION_GUIDE.md` for detailed instructions

3. **Verify the migration:**
   - Run `migrations/verify_schema.sql` in SQL Editor
   - Check that all 5 tables exist: users, assets, documents, nominees, linked_nominees
   - Verify indexes and constraints are created

4. **Use the migration checklist:**
   - Follow `migrations/MIGRATION_CHECKLIST.md` for a complete verification process

### Database Schema

The application uses the following tables:

- **users** - User accounts with roles (owner, nominee, admin) and PIN hashes
- **assets** - Digital assets owned by users
- **documents** - Document metadata for files in Supabase Storage
- **nominees** - Users designated as nominees
- **linked_nominees** - Junction table linking assets to nominees

For detailed schema information, see `migrations/001_initial_schema.sql`.

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Authentication (Coming Soon)
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/set-pin` - Set user PIN
- `POST /auth/login-pin` - Login with PIN
- `GET /auth/profile` - Get user profile

### Assets (Coming Soon)
- `GET /assets` - Get user assets
- `POST /assets` - Create new asset
- `GET /assets/:id` - Get asset details
- `PATCH /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### Documents (Coming Soon)
- `POST /assets/:id/documents` - Upload document
- `GET /assets/:id/documents` - Get asset documents
- `GET /documents/:id/download` - Download document
- `DELETE /documents/:id` - Delete document

### Nominees (Coming Soon)
- `GET /nominees` - Get all nominees
- `POST /nominees/link` - Link nominee to asset
- `DELETE /nominees/link/:id` - Unlink nominee
- `GET /nominees/asset/:assetId` - Get linked nominees

### Admin (Coming Soon)
- `GET /admin/users` - Get all users
- `GET /admin/assets` - Get all assets
- `GET /admin/users/:id` - Get user details
- `PATCH /admin/users/:id` - Update user

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-min-256-bits` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGc...` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |

### Verify Environment Configuration

Run the verification script to ensure all environment variables are properly configured:

```bash
npm run verify:env
```

This will check:
- All required variables are set
- Values are in the correct format
- JWT_SECRET is secure
- FRONTEND_URL is properly configured

## CORS Configuration

The backend is configured with CORS to allow requests from the frontend application. See `../CORS_AND_ENV_CONFIGURATION.md` for detailed information.

### Test CORS Configuration

```bash
npm run test:cors
```

This will test:
- Valid frontend origin is allowed
- Invalid origins are blocked
- Preflight requests work correctly
- Credentials are properly configured

### Quick CORS Reference

- **Allowed Origins (Development):** `http://localhost:5173`, `http://localhost:5174`, `http://127.0.0.1:5173`
- **Allowed Origins (Production):** Only the URL specified in `FRONTEND_URL`
- **Credentials:** Enabled (cookies and auth headers allowed)
- **Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With

For troubleshooting, see `../QUICK_CORS_REFERENCE.md`.

## Security Features

- JWT-based authentication with 24-hour expiry
- PIN hashing with bcrypt (cost factor 10)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation with Zod schemas
- Row Level Security (RLS) in Supabase

## Development Guidelines

- Use TypeScript strict mode
- Follow RESTful API conventions
- Validate all inputs with Zod schemas
- Handle errors gracefully
- Use async/await for asynchronous operations
- Keep controllers thin, move logic to services
- Write meaningful commit messages

## Deployment

For production deployment instructions, see the comprehensive [Deployment Guide](../DEPLOYMENT_GUIDE.md).

### Quick Deployment

Use the deployment script:

```bash
./deploy.sh
```

This will:
- Validate environment configuration
- Install dependencies
- Run tests
- Build TypeScript
- Prepare deployment package

### Production Environment

Create `.env.production` with your production configuration:

```bash
cp .env.example .env.production
# Edit .env.production with production values
```

### Process Management

Use PM2 for production process management:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

For detailed deployment instructions, platform-specific guides, and troubleshooting, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md).

## License

ISC
