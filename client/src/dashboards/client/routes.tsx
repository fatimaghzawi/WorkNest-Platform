import { Route } from 'react-router-dom';
import ClientRoute from '@/dashboards/client/ClientRoute';
import ClientLayout from '@/dashboards/client/layout/ClientLayout';
import Dashboard from '@/dashboards/client/pages/Dashboard';
import MyJobs from '@/dashboards/client/pages/MyJobs';
import CreateJob from '@/dashboards/client/pages/CreateJob';
import EditJob from '@/dashboards/client/pages/EditJob';
import JobProposals from '@/dashboards/client/pages/JobProposals';
import Interviews from '@/dashboards/client/pages/Interviews';
import Workspace from '@/dashboards/client/pages/Workspace';
import Payments from '@/dashboards/client/pages/Payments';
import Profile from '@/dashboards/client/pages/Profile';
import FreelancerProfile from '@/dashboards/client/pages/FreelancerProfile';
import MyProjects from '@/dashboards/client/pages/MyProjects';

export const clientDashboardRoutes = (
  <Route element={<ClientRoute />}>
    <Route element={<ClientLayout />}>
      <Route path="/client/dashboard" element={<Dashboard />} />
      <Route path="/client/jobs" element={<MyJobs />} />
      <Route path="/client/jobs/new" element={<CreateJob />} />
      <Route path="/client/jobs/:jobId/edit" element={<EditJob />} />
      <Route path="/client/jobs/:jobId/proposals" element={<JobProposals />} />
      <Route path="/client/freelancers/:freelancerId" element={<FreelancerProfile />} />
      <Route path="/client/projects" element={<MyProjects />} />
      <Route path="/client/interviews" element={<Interviews />} />
      <Route path="/client/workspace" element={<Workspace />} />
      <Route path="/client/payments" element={<Payments />} />
      <Route path="/client/profile" element={<Profile />} />
    </Route>
  </Route>
);
