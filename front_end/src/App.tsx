import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import DonorRegistration from './pages/DonorRegistration';
import DonorProfile from './pages/DonorProfile';
import BloodRequest from './pages/BloodRequest';
import MyRequests from './pages/MyRequests';
import AdminPanel from './pages/Admin/AdminPanel';
import Inventory from './pages/Admin/Inventory';
import Requests from './pages/Admin/RequestsNew';
import Donors from './pages/Admin/Donors';
import Reports from './pages/Admin/Reports';
import RecordDonation from './pages/Admin/RecordDonation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Box>Loading...</Box>;
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
                <Donors />
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
            path="/admin/record-donation" 
            element={
              <ProtectedRoute roles={['admin']}>
                <RecordDonation />
              </ProtectedRoute>
            } 
          />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;