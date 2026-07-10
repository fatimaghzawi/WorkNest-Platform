import { Route } from 'react-router-dom';
import ClientRoute from './ClientRoute';
import ClientLayout from './layout/ClientLayout';
import Dashboard from './pages/Dashboard';
import MyJobs from './pages/MyJobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobProposals from './pages/JobProposals';
import Interviews from './pages/Interviews';
import Workspace from './pages/Workspace';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import FreelancerProfile from './pages/FreelancerProfile';
import MyProjects from './pages/MyProjects';

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
