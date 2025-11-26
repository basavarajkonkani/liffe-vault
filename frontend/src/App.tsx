import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/auth';
import {
  LoginPage,
  OTPVerificationPage,
  PINSetupPage,
  RoleSelectorPage,
  PINLoginPage,
} from '@/pages/auth';
import {
  OwnerDashboard,
  NomineeDashboard,
  AdminDashboard,
} from '@/pages/dashboard';
import { VaultPage, AssetDetailPage, UploadPage } from '@/pages/vault';
import { NomineeLinkingPage, SharedAssetsPage, SharedAssetDetailPage } from '@/pages/nominee';
import { AssetsManagementPage } from '@/pages/admin';

// Lazy load Claim Guides pages to avoid module resolution issues
const ClaimGuidesPage = lazy(() => import('@/pages/claim-guides/ClaimGuidesPage').then(m => ({ default: m.ClaimGuidesPage })));
const ClaimGuideDetailPage = lazy(() => import('@/pages/claim-guides/ClaimGuideDetailPage').then(m => ({ default: m.ClaimGuideDetailPage })));
const ClaimGuideFormPage = lazy(() => import('@/pages/claim-guides/ClaimGuideFormPage').then(m => ({ default: m.ClaimGuideFormPage })));

// Component to redirect authenticated users away from auth pages
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Component to route to the correct dashboard based on user role
const DashboardRouter = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'nominee':
      return <NomineeDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Default route redirects to PIN login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Authentication routes - redirect if already authenticated */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <PINLoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/pin-login"
          element={
            <AuthRedirect>
              <PINLoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/otp-verify"
          element={
            <AuthRedirect>
              <OTPVerificationPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/pin-setup"
          element={
            <AuthRedirect>
              <PINSetupPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/role-select"
          element={
            <AuthRedirect>
              <RoleSelectorPage />
            </AuthRedirect>
          }
        />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/nominee"
          element={
            <ProtectedRoute allowedRoles={['nominee']}>
              <NomineeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Vault Routes */}
        <Route
          path="/vault"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <VaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault/:id"
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <AssetDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Nominee Linking Routes (for owners) */}
        <Route
          path="/nominees"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <NomineeLinkingPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Shared Assets Routes (for nominees) */}
        <Route
          path="/shared-assets"
          element={
            <ProtectedRoute allowedRoles={['nominee']}>
              <SharedAssetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-assets/:id"
          element={
            <ProtectedRoute allowedRoles={['nominee']}>
              <SharedAssetDetailPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Claim Guides Routes */}
        <Route
          path="/claim-guides"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6">Loading...</div>}>
                <ClaimGuidesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim-guides/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<div className="p-6">Loading...</div>}>
                <ClaimGuideFormPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim-guides/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6">Loading...</div>}>
                <ClaimGuideDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim-guides/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<div className="p-6">Loading...</div>}>
                <ClaimGuideFormPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              {/* UsersManagementPage will be created in task 16 */}
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Users Management</h1>
                <p className="text-gray-600 mt-2">This page will be implemented in task 16</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assets"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AssetsManagementPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
