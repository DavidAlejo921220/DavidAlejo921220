import { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/client/Dashboard';
import CreateService from './pages/client/CreateService';
import MyServices from './pages/client/MyServicesWithTracking';
import DriverDashboard from './pages/driver/Dashboard';
import AvailableServices from './pages/driver/AvailableServices';
import DriverServices from './pages/driver/MyServices';
import DriverRegistration from './pages/driver/Registration';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/Users';
import CommissionConfig from './pages/admin/Commission';
import WalletManagement from './pages/admin/WalletManagement';
import DriversValidation from './pages/admin/DriversValidation';
import Chat from './pages/Chat';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1120]">
        <div className="text-[#00e0ff] text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/create-service"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <CreateService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/my-services"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <MyServices />
                  </ProtectedRoute>
                }
              />
              
              {/* Driver Routes */}
              <Route
                path="/driver/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/available"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <AvailableServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/my-services"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverServices />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/commission"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CommissionConfig />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/wallets"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <WalletManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/drivers-validation"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DriversValidation />
                  </ProtectedRoute>
                }
              />

              {/* Chat Route */}
              <Route
                path="/chat/:serviceId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" theme="dark" />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;