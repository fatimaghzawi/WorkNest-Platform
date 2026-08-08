import { Route } from 'react-router-dom';
import AdminRoute from '@/dashboards/admin/AdminRoute';
import AdminLayout from '@/dashboards/admin/layout/AdminLayout';
import Dashboard from '@/dashboards/admin/pages/Dashboard';
import Users from '@/dashboards/admin/pages/Users';
import UserProfileView from '@/dashboards/admin/pages/UserProfileView';
import Jobs from '@/dashboards/admin/pages/Jobs';
import Categories from '@/dashboards/admin/pages/Categories';
import Proposals from '@/dashboards/admin/pages/Proposals';
import Skills from '@/dashboards/admin/pages/Skills';
import Projects from '@/dashboards/admin/pages/Projects';
import Interviews from '@/dashboards/admin/pages/Interviews';
import Workspace from '@/dashboards/admin/pages/Workspace';
import Reports from '@/dashboards/admin/pages/Reports';
import Statistics from '@/dashboards/admin/pages/Statistics';
import Logs from '@/dashboards/admin/pages/Logs';
import Profile from '@/dashboards/admin/pages/Profile';
import Wallet from '@/dashboards/admin/pages/Wallet';

export const adminDashboardRoutes = (
  <Route element={<AdminRoute />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/users/:userId/profile" element={<UserProfileView />} />
      <Route path="/admin/jobs" element={<Jobs />} />
      <Route path="/admin/categories" element={<Categories />} />
      <Route path="/admin/proposals" element={<Proposals />} />
      <Route path="/admin/skills" element={<Skills />} />
      <Route path="/admin/projects" element={<Projects />} />
      <Route path="/admin/wallet" element={<Wallet />} />
      <Route path="/admin/interviews" element={<Interviews />} />
      <Route path="/admin/workspace" element={<Workspace />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/statistics" element={<Statistics />} />
      <Route path="/admin/logs" element={<Logs />} />
      <Route path="/admin/profile" element={<Profile />} />
    </Route>
  </Route>
);
