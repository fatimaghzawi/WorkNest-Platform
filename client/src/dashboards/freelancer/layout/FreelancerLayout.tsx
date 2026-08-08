import { Outlet } from 'react-router-dom';
import FreelancerNavbar from '@/dashboards/freelancer/components/FreelancerNavbar';
import DashboardBottomNav, {
  FREELANCER_BOTTOM_NAV,
} from '@/dashboards/shared/DashboardBottomNav';
import '@/styles/Dashboard.css';

export default function FreelancerLayout() {
  return (
    <div className="wn-dash wn-dash--with-bottom-nav">
      <FreelancerNavbar />
      <main className="wn-dash__main">
        <Outlet />
      </main>
      <DashboardBottomNav
        items={FREELANCER_BOTTOM_NAV}
        ariaLabel="Freelancer primary navigation"
      />
    </div>
  );
}
