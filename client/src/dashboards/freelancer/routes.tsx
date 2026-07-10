import { Route } from 'react-router-dom';
import FreelancerRoute from './FreelancerRoute';
import FreelancerLayout from './layout/FreelancerLayout';
import Dashboard from './pages/Dashboard';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import MyProposals from './pages/MyProposals';
import Portfolio from './pages/Portfolio';
import MyProjects from './pages/MyProjects';
import Interviews from './pages/Interviews';
import Workspace from './pages/Workspace';
import Wallet from './pages/Wallet';
import ClientProfile from './pages/ClientProfile';
import Profile from './pages/Profile';

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
