import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/shared/Home';
import About from '../pages/shared/About';
import Contact from '../pages/shared/Contact';
import HelpCenter from '../pages/shared/HelpCenter';
import PrivacyPolicy from '../pages/shared/PrivacyPolicy';
import TermsOfService from '../pages/shared/TermsOfService';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import OAuthCallback from '../pages/auth/OAuthCallback';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import { adminDashboardRoutes } from '../dashboards/admin/routes';
import { clientDashboardRoutes } from '../dashboards/client/routes';
import { freelancerDashboardRoutes } from '../dashboards/freelancer/routes';
import Freelancers from '../pages/shared/Freelancers';
import Jobs from '../pages/shared/Jobs';
import JobDetails from '../pages/shared/JobDetails';

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