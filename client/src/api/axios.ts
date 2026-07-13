import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '../utils/authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const isAuthBypassRoute = (url?: string) => {
  if (!url) return false;
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/google') ||
    url.includes('/api/auth/logout') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password')
  );
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ success: boolean; accessToken: string }>(
        `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
        {},
        { withCredentials: true, timeout: 30_000 }
      )
      .then((response) => {
        const token = response.data.accessToken;
        if (token) {
          setAccessToken(token);
          return token;
        }
        return null;
      })
      .catch(() => {
        clearAccessToken();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthBypassRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }

    if (status === 401 && !isAuthBypassRoute(originalRequest?.url)) {
      clearAccessToken();
    }

    return Promise.reject(error);
  }
);

export default api;
