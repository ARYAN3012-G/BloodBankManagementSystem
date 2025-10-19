import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import DonorRegistration from './pages/DonorRegistration';
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';
import BloodRequest from './pages/BloodRequest';
import MyRequests from './pages/MyRequestsNew';
import AdminPanel from './pages/Admin/AdminPanel';
import Inventory from './pages/Admin/Inventory';
import Requests from './pages/Admin/RequestsNew';
import Donors from './pages/Admin/Donors';
import AdminDonorManagement from './pages/Admin/AdminDonorManagement';
import DonationFlowDashboard from './pages/Admin/DonationFlowDashboard';
import ProactiveDonorRecruitment from './pages/Admin/ProactiveDonorRecruitment';
import ProactiveTracking from './pages/Admin/ProactiveTracking';
import ProcessGuide from './pages/Admin/ProcessGuide';
import InventoryStatus from './pages/Admin/InventoryStatus';
import Reports from './pages/Admin/Reports';
import RecordDonation from './pages/Admin/RecordDonation';
import AdminApproval from './pages/Admin/AdminApproval';
import MedicalReports from './pages/Donor/MedicalReports';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { DashboardSkeleton } from './components/LoadingSkeleton';

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

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 2, md: 3 }, px: { xs: 0, sm: 2, md: 0 } }}>
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