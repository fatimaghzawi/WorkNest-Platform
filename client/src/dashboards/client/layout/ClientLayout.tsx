import { Outlet } from 'react-router-dom';
import ClientNavbar from '@/dashboards/client/components/ClientNavbar';
import DashboardBottomNav, {
  CLIENT_BOTTOM_NAV,
} from '@/dashboards/shared/DashboardBottomNav';
import '@/styles/Dashboard.css';

export default function ClientLayout() {
  return (
    <div className="wn-dash wn-dash--with-bottom-nav">
      <ClientNavbar />
      <main className="wn-dash__main">
        <Outlet />
      </main>
      <DashboardBottomNav items={CLIENT_BOTTOM_NAV} ariaLabel="Client primary navigation" />
    </div>
  );
}
