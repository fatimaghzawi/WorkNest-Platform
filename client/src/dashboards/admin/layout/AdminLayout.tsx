import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import '../../../css/AdminSidebar.css';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="wn-admin-layout">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div className="wn-admin-layout__content">
        <div className="wn-admin-mobile-bar">
          <button
            type="button"
            className="wn-admin-mobile-bar__menu"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
          <span className="wn-admin-mobile-bar__title">Admin dashboard</span>
        </div>

        <main className="wn-admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
