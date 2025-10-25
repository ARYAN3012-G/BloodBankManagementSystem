import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import DonorRegistration from './pages/DonorRegistration';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { DashboardSkeleton } from './components/LoadingSkeleton';

// Lazy load heavy components
const DonorDashboard = lazy(() => import('./pages/DonorDashboard'));
const DonorProfile = lazy(() => import('./pages/DonorProfile'));
const BloodRequest = lazy(() => import('./pages/BloodRequest'));
const MyRequests = lazy(() => import('./pages/MyRequestsNew'));
const MedicalReports = lazy(() => import('./pages/Donor/MedicalReports'));

// Lazy load all admin pages
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel'));
const Inventory = lazy(() => import('./pages/Admin/Inventory'));
const Requests = lazy(() => import('./pages/Admin/RequestsNew'));
const Donors = lazy(() => import('./pages/Admin/Donors'));
const AdminDonorManagement = lazy(() => import('./pages/Admin/AdminDonorManagement'));
const DonationFlowDashboard = lazy(() => import('./pages/Admin/DonationFlowDashboard'));
const ProactiveDonorRecruitment = lazy(() => import('./pages/Admin/ProactiveDonorRecruitment'));
const ProactiveTracking = lazy(() => import('./pages/Admin/ProactiveTracking'));
const ProcessGuide = lazy(() => import('./pages/Admin/ProcessGuide'));
const InventoryStatus = lazy(() => import('./pages/Admin/InventoryStatus'));
const Reports = lazy(() => import('./pages/Admin/Reports'));
const RecordDonation = lazy(() => import('./pages/Admin/RecordDonation'));
const AdminApproval = lazy(() => import('./pages/Admin/AdminApproval'));
const NotificationsPage = lazy(() => import('./pages/Admin/Notifications'));

// Loading fallback component
const PageLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress size={60} thickness={4} />
    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Loading...</Box>
  </Box>
);

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <DashboardSkeleton />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: '72px', md: '80px' }, pb: isHomePage ? 0 : { xs: 12, md: 20 }, px: { xs: 0, sm: 2, md: 0 } }}>
        <Container maxWidth="lg">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/donor-register" 
            element={
              <ProtectedRoute roles={['donor']}>
                <DonorRegistration />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/donor-dashboard" 
            element={
              <ProtectedRoute roles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/donor-profile" 
            element={
              <ProtectedRoute roles={['donor']}>
                <DonorProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/blood-request" 
            element={
              <ProtectedRoute roles={['hospital', 'external']}>
                <BloodRequest />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-requests" 
            element={
              <ProtectedRoute roles={['hospital', 'external']}>
                <MyRequests />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/inventory" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Inventory />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/requests" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Requests />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/donors" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDonorManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/donation-flow" 
            element={
              <ProtectedRoute roles={['admin']}>
                <DonationFlowDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/proactive-recruitment" 
            element={
              <ProtectedRoute roles={['admin']}>
                <ProactiveDonorRecruitment />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/proactive-tracking/:requestId" 
            element={
              <ProtectedRoute roles={['admin']}>
                <ProactiveTracking />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/process-guide" 
            element={
              <ProtectedRoute roles={['admin']}>
                <ProcessGuide />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/inventory-status" 
            element={
              <ProtectedRoute roles={['admin']}>
                <InventoryStatus />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/admin-approval" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminApproval />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/record-donation" 
            element={
              <ProtectedRoute roles={['admin']}>
                <RecordDonation />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/notifications" 
            element={
              <ProtectedRoute roles={['admin']}>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/donor/medical-reports" 
            element={
              <ProtectedRoute roles={['donor']}>
                <MedicalReports />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Not Found - Must be last */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AppRoutes />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;