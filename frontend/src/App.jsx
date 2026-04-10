import React from 'react';
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
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

          {/* Protected Dashboard Route */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
