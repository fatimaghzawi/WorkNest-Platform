import Button from '../../components/common/Button';
import DashboardNavUser from './DashboardNavUser';
import type { User } from '../../types/auth';

type Props = {
  user: User;
  onLogout: () => void | Promise<void>;
};

export default function DashboardNavMobileFooter({ user, onLogout }: Props) {
  return (
    <div className="wn-dash-nav__mobile-footer">
      <DashboardNavUser user={user} className="wn-dash-nav__mobile-user" />
      <Button
        variant="primary"
        size="sm"
        fullWidth
        className="wn-dash-nav__mobile-logout"
        onClick={onLogout}
      >
        Log out
      </Button>
    </div>
  );
}
