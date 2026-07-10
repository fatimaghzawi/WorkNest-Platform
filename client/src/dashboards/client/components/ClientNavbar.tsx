import DashboardNavbar from '../../_shared/DashboardNavbar';
import { CLIENT_NAV_LINKS } from '../nav';

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
