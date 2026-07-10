import { Outlet } from 'react-router-dom';
import FreelancerNavbar from '../components/FreelancerNavbar';
import '../../../css/Dashboard.css';

export default function FreelancerLayout() {
  return (
    <div className="wn-dash">
      <FreelancerNavbar />
      <main className="wn-dash__main">
        <Outlet />
      </main>
    </div>
  );
}
