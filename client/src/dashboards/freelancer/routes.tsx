import { Route } from 'react-router-dom';
import FreelancerRoute from '@/dashboards/freelancer/FreelancerRoute';
import FreelancerLayout from '@/dashboards/freelancer/layout/FreelancerLayout';
import Dashboard from '@/dashboards/freelancer/pages/Dashboard';
import BrowseJobs from '@/dashboards/freelancer/pages/BrowseJobs';
import JobDetails from '@/dashboards/freelancer/pages/JobDetails';
import MyProposals from '@/dashboards/freelancer/pages/MyProposals';
import Portfolio from '@/dashboards/freelancer/pages/Portfolio';
import MyProjects from '@/dashboards/freelancer/pages/MyProjects';
import Interviews from '@/dashboards/freelancer/pages/Interviews';
import Workspace from '@/dashboards/freelancer/pages/Workspace';
import Wallet from '@/dashboards/freelancer/pages/Wallet';
import ClientProfile from '@/dashboards/freelancer/pages/ClientProfile';
import Profile from '@/dashboards/freelancer/pages/Profile';

export const freelancerDashboardRoutes = (
  <Route element={<FreelancerRoute />}>
    <Route element={<FreelancerLayout />}>
      <Route path="/freelancer/dashboard" element={<Dashboard />} />
      <Route path="/freelancer/jobs" element={<BrowseJobs />} />
      <Route path="/freelancer/jobs/:jobId" element={<JobDetails />} />
      <Route path="/freelancer/proposals" element={<MyProposals />} />
      <Route path="/freelancer/projects" element={<MyProjects />} />
      <Route path="/freelancer/portfolio" element={<Portfolio />} />
      <Route path="/freelancer/interviews" element={<Interviews />} />
      <Route path="/freelancer/workspace" element={<Workspace />} />
      <Route path="/freelancer/wallet" element={<Wallet />} />
      <Route path="/freelancer/clients/:clientId" element={<ClientProfile />} />
      <Route path="/freelancer/profile" element={<Profile />} />
    </Route>
  </Route>
);
