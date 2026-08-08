import DashboardNavbar from '@/dashboards/shared/DashboardNavbar';
import { CLIENT_NAV_LINKS } from '@/dashboards/client/nav';

export default function ClientNavbar() {
  return (
    <DashboardNavbar
      roleLabel="Client"
      roleBadgeClass="client"
      links={CLIENT_NAV_LINKS}
      homePath="/client/dashboard"
    />
  );
}
