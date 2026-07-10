import { Route } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserProfileView from './pages/UserProfileView';
import Jobs from './pages/Jobs';
import Categories from './pages/Categories';
import Proposals from './pages/Proposals';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Interviews from './pages/Interviews';
import Workspace from './pages/Workspace';
import Reports from './pages/Reports';
import Statistics from './pages/Statistics';
import Logs from './pages/Logs';
import Profile from './pages/Profile';

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
      <Route path="/admin/interviews" element={<Interviews />} />
      <Route path="/admin/workspace" element={<Workspace />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/statistics" element={<Statistics />} />
      <Route path="/admin/logs" element={<Logs />} />
      <Route path="/admin/profile" element={<Profile />} />
    </Route>
  </Route>
);
