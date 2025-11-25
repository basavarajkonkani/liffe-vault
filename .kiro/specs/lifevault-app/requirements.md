# Requirements Document

## Introduction

LifeVault is a secure, production-ready digital asset management application that enables users to store, manage, and share important documents and assets with designated nominees. The system provides banking-grade security with role-based access control, supporting three distinct user roles: Asset Owners, Nominees, and Administrators. The application follows a three-phase development approach: Frontend UI, Backend API, and Database Integration with Supabase.

## Glossary

- **LifeVault System**: The complete digital asset management application including frontend, backend, and database components
- **Asset Owner**: A user who creates and manages their own digital assets and documents
- **Nominee**: A user who has been granted access to view specific assets shared by an Asset Owner
- **Administrator**: A privileged user with system-wide access to manage users and assets
- **OTP**: One-Time Password used for authentication
- **PIN**: Personal Identification Number used for secure login after initial setup
- **RLS**: Row Level Security policies in Supabase that enforce data access rules
- **Vault**: The secure storage area where users upload and manage documents
- **shadcn/ui**: A collection of reusable React components built with Radix UI and Tailwind CSS

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register and authenticate securely using OTP verification, so that only I can access my account

#### Acceptance Criteria

1. WHEN a user submits their email address, THE LifeVault System SHALL send a one-time password to the provided email address within 5 seconds
2. WHEN a user enters the correct OTP within 10 minutes of generation, THE LifeVault System SHALL verify the OTP and proceed to PIN setup
3. IF a user enters an incorrect OTP three consecutive times, THEN THE LifeVault System SHALL lock the account for 15 minutes
4. WHEN a verified user sets a PIN, THE LifeVault System SHALL require the PIN to be exactly 6 digits
5. WHEN a user completes PIN setup, THE LifeVault System SHALL create a user account with the selected role stored in user metadata

### Requirement 2

**User Story:** As an authenticated user, I want to log in using my PIN, so that I can quickly and securely access my account

#### Acceptance Criteria

1. WHEN a user enters their email and 6-digit PIN, THE LifeVault System SHALL authenticate the user within 2 seconds
2. IF a user enters an incorrect PIN three consecutive times, THEN THE LifeVault System SHALL lock the account for 15 minutes
3. WHEN authentication succeeds, THE LifeVault System SHALL generate a JWT token valid for 24 hours
4. WHEN authentication succeeds, THE LifeVault System SHALL redirect the user to their role-specific dashboard
5. WHILE a user session is active, THE LifeVault System SHALL validate the JWT token on each API request

### Requirement 3

**User Story:** As an Asset Owner, I want to upload and categorize my documents in a secure vault, so that I can organize my important assets

#### Acceptance Criteria

1. WHEN an Asset Owner uploads a document, THE LifeVault System SHALL accept files up to 50 MB in size
2. WHEN an Asset Owner uploads a document, THE LifeVault System SHALL store the file in Supabase Storage with encryption
3. WHEN an Asset Owner categorizes a document, THE LifeVault System SHALL allow selection from predefined categories including Legal, Financial, Medical, Personal, and Other
4. WHILE viewing the vault, THE LifeVault System SHALL display only documents owned by the authenticated Asset Owner
5. WHEN an Asset Owner requests to download a document, THE LifeVault System SHALL generate a secure signed URL valid for 60 seconds

### Requirement 4

**User Story:** As an Asset Owner, I want to link nominees to my assets, so that they can access specific documents I choose to share

#### Acceptance Criteria

1. WHEN an Asset Owner links a nominee to an asset, THE LifeVault System SHALL verify that the nominee email corresponds to an existing user account
2. WHEN an Asset Owner links a nominee, THE LifeVault System SHALL create a linked_nominees record with the asset ID and nominee user ID
3. WHEN an Asset Owner removes a nominee link, THE LifeVault System SHALL revoke the nominee's access to the asset immediately
4. WHILE an Asset Owner views their assets, THE LifeVault System SHALL display all linked nominees for each asset
5. THE LifeVault System SHALL enforce that only Asset Owners can link or unlink nominees to their own assets

### Requirement 5

**User Story:** As a Nominee, I want to view assets shared with me, so that I can access important documents designated by the Asset Owner

#### Acceptance Criteria

1. WHEN a Nominee accesses their dashboard, THE LifeVault System SHALL display all assets that have been shared with them
2. WHILE viewing shared assets, THE LifeVault System SHALL display the Asset Owner's name and asset category
3. WHEN a Nominee requests to download a shared document, THE LifeVault System SHALL generate a secure signed URL valid for 60 seconds
4. THE LifeVault System SHALL prevent Nominees from uploading, modifying, or deleting shared assets
5. THE LifeVault System SHALL prevent Nominees from viewing assets that have not been explicitly shared with them

### Requirement 6

**User Story:** As an Administrator, I want to manage all users and assets in the system, so that I can maintain system integrity and support users

#### Acceptance Criteria

1. WHEN an Administrator accesses the admin dashboard, THE LifeVault System SHALL display all registered users with their roles and account status
2. WHEN an Administrator views asset statistics, THE LifeVault System SHALL display total assets, total users, and storage usage metrics
3. WHEN an Administrator searches for a user, THE LifeVault System SHALL return results within 1 second
4. THE LifeVault System SHALL allow Administrators to view any asset in the system for support purposes
5. THE LifeVault System SHALL log all Administrator actions for audit purposes

### Requirement 7

**User Story:** As a user, I want to interact with a premium, banking-grade interface, so that I trust the application with my sensitive documents

#### Acceptance Criteria

1. THE LifeVault System SHALL implement a blue and white color scheme consistent with professional financial applications
2. THE LifeVault System SHALL apply glassmorphism effects with backdrop blur and transparency on card components
3. THE LifeVault System SHALL render all UI components with smooth transitions not exceeding 300 milliseconds
4. THE LifeVault System SHALL provide a fully responsive layout that adapts to screen widths from 320 pixels to 2560 pixels
5. THE LifeVault System SHALL use shadcn/ui components for all interactive elements to ensure consistency and accessibility

### Requirement 8

**User Story:** As a developer, I want the frontend to be built with modern React practices, so that the codebase is maintainable and scalable

#### Acceptance Criteria

1. THE LifeVault System SHALL implement all frontend components using React with TypeScript for type safety
2. THE LifeVault System SHALL use Tailwind CSS for all styling without custom CSS files
3. THE LifeVault System SHALL implement client-side routing using React Router with protected routes for authenticated pages
4. THE LifeVault System SHALL use Axios for all HTTP requests with centralized error handling
5. THE LifeVault System SHALL use Lucide React for all icons to maintain visual consistency

### Requirement 9

**User Story:** As a developer, I want a secure backend API with proper authentication and authorization, so that user data is protected

#### Acceptance Criteria

1. THE LifeVault System SHALL implement JWT-based authentication with tokens that expire after 24 hours
2. THE LifeVault System SHALL validate all incoming request data using Zod schemas before processing
3. THE LifeVault System SHALL implement rate limiting of 100 requests per 15 minutes per IP address
4. THE LifeVault System SHALL configure CORS to allow requests only from the frontend domain
5. WHEN an API endpoint requires authentication, THE LifeVault System SHALL return HTTP 401 if the JWT token is missing or invalid

### Requirement 10

**User Story:** As a developer, I want to use Supabase for authentication, database, and storage, so that I can leverage managed services for security and scalability

#### Acceptance Criteria

1. THE LifeVault System SHALL use Supabase Auth for email OTP authentication flow
2. THE LifeVault System SHALL store user roles in Supabase user_metadata.role field
3. THE LifeVault System SHALL implement RLS policies that restrict Asset Owners to access only their own assets
4. THE LifeVault System SHALL implement RLS policies that allow Nominees to access only assets explicitly shared with them
5. THE LifeVault System SHALL implement RLS policies that allow Administrators to access all assets in the system

### Requirement 11

**User Story:** As a developer, I want proper database schema with relationships, so that data integrity is maintained

#### Acceptance Criteria

1. THE LifeVault System SHALL create a users table with fields for id, email, role, pin_hash, created_at, and updated_at
2. THE LifeVault System SHALL create an assets table with fields for id, owner_id, title, category, created_at, and updated_at
3. THE LifeVault System SHALL create a documents table with fields for id, asset_id, file_name, file_path, file_size, uploaded_at
4. THE LifeVault System SHALL create a nominees table with fields for id, user_id, and created_at
5. THE LifeVault System SHALL create a linked_nominees table with fields for id, asset_id, nominee_id, linked_at, and foreign key constraints

### Requirement 12

**User Story:** As a developer, I want comprehensive API endpoints for all features, so that the frontend can interact with the backend seamlessly

#### Acceptance Criteria

1. THE LifeVault System SHALL provide POST /auth/send-otp endpoint that accepts email and returns success status
2. THE LifeVault System SHALL provide POST /auth/verify-otp endpoint that accepts email and OTP code and returns verification status
3. THE LifeVault System SHALL provide POST /auth/set-pin endpoint that accepts user ID, PIN, and role and returns success status
4. THE LifeVault System SHALL provide POST /auth/login-pin endpoint that accepts email and PIN and returns JWT token
5. THE LifeVault System SHALL provide GET /auth/profile endpoint that returns authenticated user profile data

### Requirement 13

**User Story:** As a developer, I want asset management API endpoints, so that users can perform CRUD operations on their assets

#### Acceptance Criteria

1. THE LifeVault System SHALL provide GET /assets endpoint that returns all assets accessible to the authenticated user based on their role
2. THE LifeVault System SHALL provide POST /assets endpoint that creates a new asset for the authenticated Asset Owner
3. THE LifeVault System SHALL provide GET /assets/:id endpoint that returns asset details if the user has access permission
4. THE LifeVault System SHALL provide DELETE /assets/:id endpoint that deletes an asset only if the authenticated user is the owner
5. THE LifeVault System SHALL provide GET /assets/stats endpoint that returns asset statistics for Administrators

### Requirement 14

**User Story:** As a developer, I want document upload and management endpoints, so that users can store files securely

#### Acceptance Criteria

1. THE LifeVault System SHALL provide POST /assets/:id/documents endpoint that accepts multipart form data and uploads files to Supabase Storage
2. THE LifeVault System SHALL provide GET /assets/:id/documents endpoint that returns all documents for an asset if the user has access
3. THE LifeVault System SHALL provide GET /documents/:id/download endpoint that generates a signed URL for secure file download
4. THE LifeVault System SHALL provide DELETE /documents/:id endpoint that removes a document only if the authenticated user is the asset owner
5. WHEN uploading a document, THE LifeVault System SHALL validate that the file size does not exceed 50 MB

### Requirement 15

**User Story:** As a developer, I want nominee management endpoints, so that Asset Owners can share assets with designated users

#### Acceptance Criteria

1. THE LifeVault System SHALL provide GET /nominees endpoint that returns all nominees in the system for Asset Owners to select
2. THE LifeVault System SHALL provide POST /nominees/link endpoint that creates a link between an asset and a nominee
3. THE LifeVault System SHALL provide DELETE /nominees/link/:id endpoint that removes a nominee link
4. THE LifeVault System SHALL provide GET /nominees/asset/:assetId endpoint that returns all nominees linked to a specific asset
5. WHEN linking a nominee, THE LifeVault System SHALL verify that the authenticated user is the asset owner

### Requirement 16

**User Story:** As a developer, I want admin management endpoints, so that Administrators can oversee the system

#### Acceptance Criteria

1. THE LifeVault System SHALL provide GET /admin/users endpoint that returns all users with pagination support
2. THE LifeVault System SHALL provide GET /admin/assets endpoint that returns all assets in the system with pagination support
3. THE LifeVault System SHALL provide GET /admin/users/:id endpoint that returns detailed information for a specific user
4. THE LifeVault System SHALL provide PATCH /admin/users/:id endpoint that allows updating user status or role
5. WHEN accessing admin endpoints, THE LifeVault System SHALL verify that the authenticated user has Administrator role

### Requirement 17

**User Story:** As a user, I want the application to handle errors gracefully, so that I understand what went wrong and how to proceed

#### Acceptance Criteria

1. WHEN a network error occurs, THE LifeVault System SHALL display a user-friendly error message with retry option
2. WHEN a validation error occurs, THE LifeVault System SHALL display specific field-level error messages
3. WHEN an authentication error occurs, THE LifeVault System SHALL redirect the user to the login page
4. WHEN a server error occurs, THE LifeVault System SHALL display a generic error message without exposing technical details
5. THE LifeVault System SHALL log all errors to the console in development mode for debugging purposes

### Requirement 18

**User Story:** As a developer, I want the application to be production-ready, so that it can be deployed securely and reliably

#### Acceptance Criteria

1. THE LifeVault System SHALL store all sensitive configuration in environment variables
2. THE LifeVault System SHALL implement HTTPS for all API communications in production
3. THE LifeVault System SHALL hash all PINs using bcrypt with a cost factor of 10 before storage
4. THE LifeVault System SHALL implement proper CORS configuration to prevent unauthorized cross-origin requests
5. THE LifeVault System SHALL provide a production build script that optimizes and minifies all frontend assets
