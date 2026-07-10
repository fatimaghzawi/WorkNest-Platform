import { Outlet } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import '../../../css/Dashboard.css';

export default function ClientLayout() {
  return (
    <div className="wn-dash">
      <ClientNavbar />
      <main className="wn-dash__main">
        <Outlet />
      </main>
    </div>
  );
}
