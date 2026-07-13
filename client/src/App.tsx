import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './routes/ScrollToTop';
import { googleClientId } from './components/auth/GoogleSignInButton';

const App = () => {
  const content = (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );

  if (!googleClientId) {
    return content;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
};

export default App;
