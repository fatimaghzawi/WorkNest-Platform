/**
 * App shell: providers + router.
 * Screens live in `pages/` and `dashboards/`; this file only wires context.
 */
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import AppRoutes from '@/app/routes/AppRoutes';
import ScrollToTop from '@/app/routes/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import { googleClientId } from '@/features/auth/GoogleSignInButton';

const App = () => {
  const content = (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );

  if (!googleClientId) {
    return content;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
};

export default App;
