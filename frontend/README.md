# LifeVault Frontend

A secure digital asset management application built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 19** with TypeScript
- **Vite** (Rolldown) for build tooling
- **Tailwind CSS** for styling with custom blue theme
- **shadcn/ui** component library
- **React Router** for routing
- **Axios** for API calls
- **Zustand** for state management
- **Lucide React** for icons

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Layout components (Navbar, Sidebar)
│   ├── auth/         # Authentication components
│   ├── vault/        # Vault/asset components
│   ├── nominee/      # Nominee management components
│   └── admin/        # Admin components
├── pages/
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Dashboard pages
│   ├── vault/        # Vault pages
│   ├── nominee/      # Nominee pages
│   └── admin/        # Admin pages
├── lib/              # Utility functions
├── store/            # Zustand stores
├── types/            # TypeScript interfaces
└── App.tsx           # Main app component
```

## Configuration

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { Button } from '@/components/ui/button'
import { User } from '@/types'
```

### Tailwind Theme

Custom blue theme colors:
- Primary: `#0066CC`
- Primary Dark: `#003D7A`
- Primary Light: `#E6F2FF`

### Glassmorphism Utility

Use the `glass-card` class for glassmorphism effects:

```tsx
<div className="glass-card p-6 rounded-lg">
  Content here
</div>
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding shadcn/ui Components

To add shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# etc.
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Verify Environment Configuration

Run the verification script to ensure all environment variables are properly configured:

```bash
npm run verify:env
```

This will check:
- All required variables are set
- Values are in the correct format
- Not using example values
- API URL is properly configured

### API Client Configuration

The Axios client is configured with:
- Base URL from `VITE_API_URL`
- 10-second timeout
- Credentials enabled for CORS
- Automatic JWT token attachment
- Global error handling

For detailed CORS and environment configuration, see `../CORS_AND_ENV_CONFIGURATION.md` or `../QUICK_CORS_REFERENCE.md`.

## Deployment

For production deployment instructions, see the comprehensive [Deployment Guide](../DEPLOYMENT_GUIDE.md).

### Quick Deployment

Use the deployment script:

```bash
./deploy.sh
```

This will:
- Validate environment file exists
- Install dependencies
- Run linter
- Build production bundle
- Output deployment instructions

### Production Environment

Create `.env.production` with your production configuration:

```env
VITE_API_URL=https://api.lifevault.com
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Deployment Platforms

**Recommended platforms:**
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Static hosting**: Upload `dist/` directory

For detailed deployment instructions, platform-specific guides, and troubleshooting, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md).

## Requirements Covered

This setup addresses the following requirements:
- 8.1: React with TypeScript
- 8.2: Tailwind CSS for styling
- 8.3: React Router for routing
- 8.4: Axios for HTTP requests
- 8.5: Lucide React for icons
