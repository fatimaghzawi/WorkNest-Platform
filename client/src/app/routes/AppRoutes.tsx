/**
 * Top-level URL map.
 * Public/auth → `pages/`. Role dashboards → `dashboards/<role>/routes`.
 */
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '@/app/layouts/AuthLayout';
import MainLayout from '@/app/layouts/MainLayout';

import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import OAuthCallback from '@/pages/auth/OAuthCallback';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';

import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import Freelancers from '@/pages/public/Freelancers';
import HelpCenter from '@/pages/public/HelpCenter';
import Home from '@/pages/public/Home';
import JobDetails from '@/pages/public/JobDetails';
import Jobs from '@/pages/public/Jobs';
import PrivacyPolicy from '@/pages/public/PrivacyPolicy';
import TermsOfService from '@/pages/public/TermsOfService';

import { adminDashboardRoutes } from '@/dashboards/admin/routes';
import { clientDashboardRoutes } from '@/dashboards/client/routes';
import { freelancerDashboardRoutes } from '@/dashboards/freelancer/routes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<MainLayout />}>
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="/auth/oauth/callback" element={<OAuthCallback />} />

      {adminDashboardRoutes}
      {clientDashboardRoutes}
      {freelancerDashboardRoutes}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
