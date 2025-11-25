# Implementation Plan

## Phase 1: Frontend Development

- [x] 1. Initialize frontend project with React, TypeScript, and Tailwind CSS
  - Create Vite project with React and TypeScript template
  - Install and configure Tailwind CSS with custom theme colors (blue and white)
  - Install shadcn/ui CLI and initialize configuration
  - Install required dependencies: react-router-dom, axios, zustand, lucide-react
  - Configure path aliases in tsconfig.json and vite.config.ts
  - Create basic folder structure: components/, pages/, lib/, store/, types/
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Set up shadcn/ui components and design system
  - Install shadcn/ui components: button, card, input, label, select, dialog, table, toast
  - Create custom Tailwind theme with primary blue colors (#0066CC, #003D7A, #E6F2FF)
  - Implement glassmorphism utility classes in Tailwind config
  - Create reusable animation classes for smooth transitions (300ms)
  - Set up toast notification system for user feedback
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 3. Create TypeScript interfaces and types
  - Define User interface with id, email, role, created_at, updated_at fields
  - Define Asset interface with id, owner_id, title, category, documents, linked_nominees fields
  - Define Document interface with id, asset_id, file_name, file_path, file_size, uploaded_at fields
  - Define Nominee and LinkedNominee interfaces
  - Define ApiResponse generic interface for API responses
  - Define AuthState interface for Zustand store
  - _Requirements: 8.1, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 4. Implement Axios API client with interceptors
  - Create axios instance with base URL from environment variables
  - Implement request interceptor to attach JWT token to headers
  - Implement response interceptor for global error handling (401, 403, 429, 500, network errors)
  - Create API service functions for auth endpoints (sendOTP, verifyOTP, setPIN, loginPIN, getProfile)
  - Display toast notifications for different error types
  - _Requirements: 8.4, 9.5, 17.1, 17.2, 17.3, 17.4_

- [x] 5. Create Zustand auth store for state management
  - Define auth state: user, token, isAuthenticated, isLoading
  - Implement login action to store user and token
  - Implement logout action to clear state and localStorage
  - Implement setUser action to update user profile
  - Persist token to localStorage and hydrate on app load
  - _Requirements: 2.3, 2.4, 17.3_

- [x] 6. Build authentication pages - Login and OTP Verification
  - Create LoginPage with email input form using shadcn/ui Input component
  - Implement form validation for email format
  - Call sendOTP API on form submission and show loading state
  - Create OTPVerificationPage with 6-digit OTP input
  - Implement OTP verification with error handling for invalid/expired OTP
  - Show error message after 3 failed attempts
  - Navigate to PIN setup on successful verification
  - Apply glassmorphism card design with blue theme
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4_

- [x] 7. Build authentication pages - PIN Setup and Role Selector
  - Create PINSetupPage with 6-digit PIN input and confirmation field
  - Validate PIN is exactly 6 digits and both fields match
  - Create RoleSelectorPage with three role options: Asset Owner, Nominee, Admin
  - Display role descriptions with icons using Lucide React
  - Call setPIN API with selected role on submission
  - Navigate to login page on successful setup
  - Apply smooth animations and glassmorphism effects
  - _Requirements: 1.4, 1.5, 7.2, 7.3, 8.5_

- [x] 8. Build PIN login page and implement authentication flow
  - Create PIN login page with email and 6-digit PIN input
  - Call loginPIN API and store JWT token in Zustand store
  - Implement account lockout UI after 3 failed attempts
  - Navigate to role-specific dashboard based on user role
  - Create ProtectedRoute component to guard authenticated routes
  - Redirect to login if token is missing or expired
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 17.3_

- [x] 9. Create layout components - Navbar and Sidebar
  - Build Navbar component with logo, user profile dropdown, and logout button
  - Build Sidebar component with navigation links based on user role
  - Implement responsive sidebar that collapses on mobile (hamburger menu)
  - Create Layout component that wraps Navbar and Sidebar
  - Apply glassmorphism to navbar with backdrop blur
  - Use Lucide React icons for navigation items
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.5_

- [x] 10. Build Asset Owner Dashboard
  - Create OwnerDashboard page with statistics cards (total assets, total documents, storage used)
  - Display recent assets in a grid layout using shadcn/ui Card components
  - Implement CategoryFilter component to filter assets by category
  - Create AssetCard component showing title, category, document count, and linked nominees
  - Add "Upload New Asset" button that navigates to upload page
  - Fetch assets from API on component mount
  - Apply glassmorphism and smooth animations to cards
  - _Requirements: 3.4, 7.1, 7.2, 7.3, 7.4, 13.1_

- [x] 11. Build Vault page with asset management
  - Create VaultPage displaying all user assets in a responsive grid
  - Implement search functionality to filter assets by title
  - Implement category filter dropdown using shadcn/ui Select
  - Create AssetDetailPage showing asset details and document list
  - Add edit and delete buttons for asset management
  - Implement delete confirmation dialog using shadcn/ui Dialog
  - Call assets API endpoints (GET, DELETE) with proper error handling
  - _Requirements: 3.3, 3.4, 3.5, 13.1, 13.3, 13.4_

- [x] 12. Build document upload functionality
  - Create DocumentUpload component with drag-and-drop file input
  - Validate file size (max 50 MB) and display error if exceeded
  - Show upload progress indicator during file upload
  - Create UploadPage with form for asset title, category selection, and file upload
  - Call POST /assets/:id/documents API to upload documents
  - Display success toast on successful upload
  - Navigate back to vault after upload
  - _Requirements: 3.1, 3.2, 3.3, 14.1, 14.5_

- [x] 13. Build document list and download functionality
  - Create DocumentList component displaying documents in a table
  - Show file name, file size, and upload date for each document
  - Add download button for each document using Lucide Download icon
  - Call GET /documents/:id/download API to get signed URL
  - Open signed URL in new tab for download
  - Add delete button for document owners
  - Implement delete confirmation dialog
  - _Requirements: 3.5, 14.2, 14.3, 14.4_

- [x] 14. Build nominee linking functionality
  - Create NomineeLinkingPage for Asset Owners
  - Fetch available nominees from GET /nominees API
  - Create NomineeSelector component with searchable dropdown
  - Display currently linked nominees for selected asset
  - Implement link nominee button calling POST /nominees/link API
  - Implement unlink nominee button calling DELETE /nominees/link/:id API
  - Show success/error toasts for link/unlink actions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 15. Build Nominee Dashboard and shared assets view
  - Create NomineeDashboard page showing statistics of shared assets
  - Display all shared assets in a grid using SharedAssetCard component
  - Show Asset Owner name and asset category on each card
  - Create SharedAssetsPage with detailed view of shared assets
  - Implement document download for shared assets
  - Disable upload, edit, and delete actions for nominees
  - Fetch shared assets from GET /assets API (filtered by backend based on role)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 16. Build Admin Dashboard with user management
  - Create AdminDashboard page with system statistics cards
  - Display total users, total assets, and storage usage metrics
  - Create UserTable component using shadcn/ui Table
  - Fetch all users from GET /admin/users API with pagination
  - Implement search functionality to filter users by email
  - Display user role, email, and account creation date
  - Add view details button for each user
  - _Requirements: 6.1, 6.2, 6.3, 16.1, 16.3_

- [x] 17. Build Admin asset management page
  - Create AssetsManagementPage displaying all assets in the system
  - Create AssetTable component with columns: title, owner, category, document count, created date
  - Fetch all assets from GET /admin/assets API with pagination
  - Implement search and filter functionality
  - Add view details button to see asset documents
  - Display asset owner information
  - Implement sorting by date, title, or owner
  - _Requirements: 6.4, 16.2_

- [x] 18. Implement React Router with protected routes
  - Set up React Router with routes for all pages
  - Create route configuration: /login, /otp-verify, /pin-setup, /role-select, /dashboard, /vault, /vault/:id, /upload, /nominees, /admin/users, /admin/assets
  - Implement ProtectedRoute wrapper that checks authentication
  - Implement RoleRoute wrapper that checks user role
  - Redirect unauthorized users to login page
  - Redirect authenticated users from auth pages to dashboard
  - _Requirements: 2.4, 8.3_

- [x] 19. Add responsive design and mobile optimization
  - Test all pages on mobile breakpoints (320px, 640px, 768px)
  - Implement responsive grid layouts (1 column on mobile, 2-3 on desktop)
  - Make sidebar collapsible on mobile with hamburger menu
  - Ensure forms are usable on mobile devices
  - Test touch interactions for buttons and cards
  - Optimize font sizes for mobile readability
  - _Requirements: 7.4_

- [x] 20. Polish UI with animations and final touches
  - Add fade-in animations to page transitions
  - Implement hover effects on cards and buttons
  - Add loading skeletons for data fetching states
  - Ensure consistent spacing and padding across all pages
  - Add empty states for pages with no data
  - Implement smooth scroll behavior
  - Test all animations are under 300ms
  - Remove any unused components or files
  - _Requirements: 7.3_

## Phase 2: Backend Development

- [x] 21. Initialize backend project with Node.js, Express, and TypeScript
  - Create Node.js project with TypeScript configuration
  - Install dependencies: express, @types/express, typescript, ts-node, nodemon
  - Install additional packages: jsonwebtoken, bcrypt, zod, cors, express-rate-limit, multer, dotenv
  - Install Supabase client: @supabase/supabase-js
  - Configure TypeScript with strict mode and ES modules
  - Create folder structure: routes/, controllers/, middleware/, services/, schemas/, types/, config/
  - Set up nodemon for development with hot reload
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1_

- [x] 22. Configure environment variables and Supabase client
  - Create .env file with variables: PORT, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL
  - Create config/env.ts to load and validate environment variables
  - Create config/supabase.ts to initialize Supabase client with service key
  - Export Supabase client for use in services
  - Add .env to .gitignore
  - _Requirements: 10.1, 10.2, 18.1_

- [x] 23. Create TypeScript interfaces and Zod schemas for validation
  - Define User, Asset, Document, Nominee, LinkedNominee interfaces matching database schema
  - Create auth.schema.ts with Zod schemas for sendOTP, verifyOTP, setPIN, loginPIN requests
  - Create asset.schema.ts with Zod schemas for create, update asset requests
  - Create nominee.schema.ts with Zod schemas for link nominee requests
  - Create validation middleware that uses Zod schemas to validate request body
  - _Requirements: 9.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 24. Implement JWT authentication middleware
  - Create auth.middleware.ts to verify JWT tokens
  - Extract token from Authorization header (Bearer token)
  - Verify token using JWT_SECRET and decode payload
  - Attach user information to req.user for downstream use
  - Return 401 error if token is missing, invalid, or expired
  - _Requirements: 2.3, 2.5, 9.1, 9.5_

- [x] 25. Implement role-based access control middleware
  - Create role.middleware.ts with requireRole function
  - Check req.user.role against required roles
  - Return 403 error if user doesn't have required role
  - Create specific middleware: requireOwner, requireAdmin
  - _Requirements: 4.5, 5.4, 5.5, 6.4, 6.5, 10.4, 10.5_

- [x] 26. Implement authentication service with Supabase Auth
  - Create auth.service.ts with functions for Supabase Auth operations
  - Implement sendOTP function using Supabase signInWithOtp
  - Implement verifyOTP function using Supabase verifyOtp
  - Implement getUserById function to fetch user from Supabase Auth
  - Handle Supabase errors and return appropriate error messages
  - _Requirements: 1.1, 1.2, 10.1, 12.1, 12.2_

- [x] 27. Implement authentication controller and routes
  - Create auth.controller.ts with handlers: sendOTP, verifyOTP, setPIN, loginPIN, getProfile
  - Implement sendOTP handler that calls auth.service.sendOTP
  - Implement verifyOTP handler that verifies OTP and returns temporary token
  - Implement setPIN handler that hashes PIN with bcrypt and stores in users table with role
  - Implement loginPIN handler that verifies PIN and generates JWT token
  - Implement getProfile handler that returns authenticated user data
  - Create auth.routes.ts with POST /auth/send-otp, /auth/verify-otp, /auth/set-pin, /auth/login-pin, GET /auth/profile
  - Apply validation middleware to all routes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 12.1, 12.2, 12.3, 12.4, 12.5, 18.3_

- [x] 28. Implement asset management service
  - Create database.service.ts with Supabase database query functions
  - Implement getAssetsByUserId function that queries assets table with RLS
  - Implement getAssetById function that fetches single asset with documents and linked nominees
  - Implement createAsset function that inserts new asset for authenticated user
  - Implement updateAsset function that updates asset title or category
  - Implement deleteAsset function that deletes asset and cascades to documents
  - Implement getAssetStats function for admin statistics
  - _Requirements: 3.3, 3.4, 3.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 29. Implement asset controller and routes
  - Create assets.controller.ts with handlers: getAssets, getAssetById, createAsset, updateAsset, deleteAsset, getAssetStats
  - Implement getAssets handler that returns assets based on user role (owners see own, nominees see shared, admins see all)
  - Implement getAssetById handler with access control check
  - Implement createAsset handler that creates asset for authenticated owner
  - Implement deleteAsset handler with owner verification
  - Implement getAssetStats handler for admins only
  - Create assets.routes.ts with GET /assets, POST /assets, GET /assets/:id, PATCH /assets/:id, DELETE /assets/:id, GET /assets/stats
  - Apply auth middleware and role middleware to routes
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 30. Implement document upload service with Supabase Storage
  - Create storage.service.ts for Supabase Storage operations
  - Implement uploadDocument function that uploads file to Supabase Storage bucket
  - Generate unique file path using asset ID and timestamp
  - Store document metadata in documents table
  - Implement getDocumentDownloadUrl function that generates signed URL (60 second expiry)
  - Implement deleteDocument function that removes file from storage and database
  - _Requirements: 3.1, 3.2, 3.5, 14.1, 14.3, 14.4_

- [x] 31. Implement document controller and routes
  - Create documents.controller.ts with handlers: uploadDocument, getDocuments, downloadDocument, deleteDocument
  - Implement uploadDocument handler using multer middleware for multipart/form-data
  - Validate file size (max 50 MB) before upload
  - Implement getDocuments handler that returns documents for an asset
  - Implement downloadDocument handler that generates signed URL
  - Implement deleteDocument handler with owner verification
  - Create routes: POST /assets/:id/documents, GET /assets/:id/documents, GET /documents/:id/download, DELETE /documents/:id
  - Apply auth middleware and validation
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 32. Implement nominee management service
  - Add nominee query functions to database.service.ts
  - Implement getNominees function that returns all users with nominee role
  - Implement linkNominee function that creates linked_nominees record
  - Verify asset ownership before linking
  - Implement unlinkNominee function that deletes linked_nominees record
  - Implement getLinkedNominees function that returns nominees for an asset
  - _Requirements: 4.1, 4.2, 4.3, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 33. Implement nominee controller and routes
  - Create nominees.controller.ts with handlers: getNominees, linkNominee, unlinkNominee, getLinkedNominees
  - Implement getNominees handler that returns available nominees
  - Implement linkNominee handler with asset ownership verification
  - Implement unlinkNominee handler with ownership check
  - Implement getLinkedNominees handler for specific asset
  - Create routes: GET /nominees, POST /nominees/link, DELETE /nominees/link/:id, GET /nominees/asset/:assetId
  - Apply auth middleware and owner role check
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 34. Implement admin management service
  - Add admin query functions to database.service.ts
  - Implement getAllUsers function with pagination support
  - Implement getAllAssets function with pagination for admin view
  - Implement getUserById function with detailed information
  - Implement updateUserStatus function to enable/disable accounts
  - Implement getSystemStats function for dashboard metrics
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 16.1, 16.2, 16.3, 16.4_

- [x] 35. Implement admin controller and routes
  - Create admin.controller.ts with handlers: getUsers, getAssets, getUserById, updateUser, getStats
  - Implement getUsers handler with pagination and search
  - Implement getAssets handler with pagination and filters
  - Implement getUserById handler for detailed user view
  - Implement updateUser handler for role or status changes
  - Implement getStats handler for system metrics
  - Create routes: GET /admin/users, GET /admin/assets, GET /admin/users/:id, PATCH /admin/users/:id
  - Apply auth middleware and admin role requirement
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 36. Set up Express server with middleware
  - Create server.ts with Express app initialization
  - Configure CORS middleware with frontend URL whitelist
  - Configure express.json() for JSON parsing
  - Configure express-rate-limit (100 requests per 15 minutes)
  - Mount all route handlers: /auth, /assets, /nominees, /admin
  - Add global error handler middleware
  - Start server on configured PORT
  - _Requirements: 9.3, 9.4, 18.2, 18.4_

- [x] 37. Implement global error handling
  - Create error handler middleware in middleware/error.middleware.ts
  - Handle ZodError for validation errors (return 400)
  - Handle JsonWebTokenError for invalid tokens (return 401)
  - Handle TokenExpiredError for expired tokens (return 401)
  - Handle generic errors without exposing internal details (return 500)
  - Log errors to console in development mode
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 38. Write backend API tests
  - Set up Jest and Supertest for API testing
  - Write tests for auth endpoints (sendOTP, verifyOTP, setPIN, loginPIN)
  - Write tests for asset endpoints with different user roles
  - Write tests for document upload and download
  - Write tests for nominee linking
  - Write tests for admin endpoints
  - Test JWT middleware with valid and invalid tokens
  - Test rate limiting behavior
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

## Phase 3: Database Integration and Final Testing

- [x] 39. Create Supabase project and configure authentication
  - Create new Supabase project in Supabase dashboard
  - Enable email authentication provider
  - Configure email templates for OTP
  - Set OTP expiry to 10 minutes
  - Copy Supabase URL and service key to backend .env
  - Copy Supabase URL and anon key to frontend .env
  - _Requirements: 10.1, 10.2_

- [x] 40. Run database migrations to create tables
  - Create SQL migration file with all table definitions
  - Execute CREATE TABLE statements for users, assets, documents, nominees, linked_nominees
  - Add foreign key constraints and ON DELETE CASCADE rules
  - Create indexes on owner_id, asset_id, nominee_id columns
  - Add CHECK constraints for role and category enums
  - Verify tables are created in Supabase dashboard
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 41. Implement Row Level Security policies
  - Enable RLS on all tables (users, assets, documents, nominees, linked_nominees)
  - Create policy for users to view their own profile
  - Create policy for admins to view all users
  - Create policy for owners to view/modify their own assets
  - Create policy for nominees to view shared assets
  - Create policy for admins to view all assets
  - Create policy for document access based on asset access
  - Create policy for nominee linking by asset owners
  - Test policies with different user roles
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 42. Create Supabase Storage buckets and policies
  - Create "documents" storage bucket in Supabase dashboard
  - Set bucket to private (not publicly accessible)
  - Configure file size limit to 50 MB
  - Create RLS policy for owners to upload to their asset folders
  - Create RLS policy for owners and nominees to download from accessible folders
  - Create RLS policy for admins to access all folders
  - Test file upload and download with signed URLs
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 43. Connect backend to Supabase and test all endpoints
  - Update backend services to use Supabase client
  - Test authentication flow: send OTP, verify OTP, set PIN, login with PIN
  - Test asset CRUD operations with RLS enforcement
  - Test document upload to Supabase Storage
  - Test document download with signed URLs
  - Test nominee linking and access control
  - Test admin endpoints for user and asset management
  - Verify RLS policies are enforced correctly
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 44. Connect frontend to backend API
  - Update frontend .env with backend API URL
  - Test login flow from frontend to backend
  - Test OTP verification and PIN setup
  - Test asset creation and listing
  - Test document upload from frontend
  - Test document download from frontend
  - Test nominee linking from frontend
  - Test admin pages with backend data
  - _Requirements: 8.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 45. Fix CORS and environment configuration issues
  - Verify CORS is configured to allow frontend domain
  - Test API calls from frontend in development mode
  - Ensure credentials are included in CORS config
  - Verify all environment variables are loaded correctly
  - Test with different origins to ensure CORS is restrictive
  - _Requirements: 9.4, 18.1, 18.4_

- [x] 46. Perform end-to-end testing of complete user flows
  - Test Asset Owner flow: register → login → upload asset → link nominee
  - Test Nominee flow: login → view shared assets → download documents
  - Test Admin flow: login → view users → view all assets → check statistics
  - Test error scenarios: invalid OTP, wrong PIN, unauthorized access
  - Test file upload with various file types and sizes
  - Test responsive design on mobile and desktop
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [x] 47. Remove unused files and optimize for production
  - Remove any unused components or pages from frontend
  - Remove console.log statements from production code
  - Optimize images and assets
  - Run frontend build and verify bundle size
  - Run backend build and verify TypeScript compilation
  - Test production builds locally
  - _Requirements: 18.5_

- [x] 48. Prepare deployment configuration
  - Create frontend .env.production with production API URL
  - Create backend .env.production with production database credentials
  - Configure CORS for production frontend domain
  - Set up HTTPS configuration for production
  - Create deployment scripts for frontend and backend
  - Document deployment steps in README
  - _Requirements: 18.1, 18.2, 18.4_

- [x] 49. Write end-to-end tests with Playwright
  - Set up Playwright for E2E testing
  - Write test for complete registration and login flow
  - Write test for asset upload and management
  - Write test for nominee linking
  - Write test for role-based access control
  - Run tests in CI/CD pipeline
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1_

- [x] 50. Final production readiness checklist
  - Verify all API endpoints return proper error codes
  - Verify JWT tokens expire after 24 hours
  - Verify rate limiting is active (100 req/15min)
  - Verify PINs are hashed with bcrypt
  - Verify file uploads are limited to 50 MB
  - Verify RLS policies prevent unauthorized access
  - Verify HTTPS is enforced in production
  - Verify all sensitive data is in environment variables
  - Test complete application flow one final time
  - _Requirements: 2.3, 3.1, 9.1, 9.3, 14.5, 18.1, 18.2, 18.3, 18.4_
