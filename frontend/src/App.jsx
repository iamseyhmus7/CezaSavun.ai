import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

// Layouts & Utilities
import ScrollToTop from './components/Router/ScrollToTop';
import PrivateRoute from './components/Router/PrivateRoute';
import Auth from './Auth';
import LegalLayout from './pages/Legal/LegalLayout';

// Pages
import LandingPage from './LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Petitions from './pages/Petitions';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import PetitionView from './pages/PetitionView';
import AdminDashboard from './pages/AdminDashboard';
import PetitionPreview from './pages/PetitionPreview';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './Login';
import Register from './Register';
import VerifyOTP from './VerifyOTP';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import KVKK from './pages/Legal/KVKK';
import NotFound from './pages/NotFound';

export default function App() {
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    fetch('/api/v1/config')
      .then(res => res.json())
      .then(data => setGoogleClientId(data.google_client_id))
      .catch(err => console.error("Config fetch error:", err));
  }, []);

  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes (Nested) */}
          <Route path="/auth" element={<Auth />}>
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify" element={<VerifyOTP />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Legal Pages (Nested) */}
          <Route path="/legal" element={<LegalLayout />}>
            <Route index element={<Navigate to="/legal/terms" replace />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="kvkk" element={<KVKK />} />
          </Route>

          {/* Protected Routes — Now using DashboardLayout */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/petitions" element={<Petitions />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/petition/:id" element={<PetitionView />} />
              <Route path="/petition/:id/preview" element={<PetitionPreview />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
