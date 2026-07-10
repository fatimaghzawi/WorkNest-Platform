import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications.api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '../lib/notificationSocket';
import type { Notification } from '../types/notification';
import { getNotificationHref } from '../utils/notificationLinks';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreNotifications: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  handleNotificationClick: (notification: Notification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const NOTIFICATIONS_PAGE_SIZE = 20;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const notificationsEnabled =
    isAuthenticated && (user?.role === 'client' || user?.role === 'freelancer');

  const refreshNotifications = useCallback(async () => {
    if (!notificationsEnabled) return;

    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list({ page: 1, limit: NOTIFICATIONS_PAGE_SIZE }),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(listRes.data.data);
      setPage(1);
      setTotalPages(listRes.data.meta?.totalPages || 1);
      setUnreadCount(countRes.data.data.count);
    } catch {
      // Non-blocking — socket may still deliver live updates
    } finally {
      setIsLoading(false);
    }
  }, [notificationsEnabled]);

  const loadMoreNotifications = useCallback(async () => {
    if (!notificationsEnabled || isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const listRes = await notificationsApi.list({
        page: nextPage,
        limit: NOTIFICATIONS_PAGE_SIZE,
      });
      setNotifications((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const appended = listRes.data.data.filter((item) => !existingIds.has(item.id));
        return [...current, ...appended];
      });
      setPage(nextPage);
      setTotalPages(listRes.data.meta?.totalPages || nextPage);
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [notificationsEnabled, isLoadingMore, page, totalPages]);

  const markRead = useCallback(async (id: string) => {
    try {
      const { data } = await notificationsApi.markRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? data.data : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.isRead) {
        await markRead(notification.id);
      }
      if (user) {
        navigate(getNotificationHref(notification, user.role));
      }
      setIsOpen(false);
    },
    [markRead, navigate, user]
  );

  useEffect(() => {
    if (!notificationsEnabled || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      disconnectNotificationSocket();
      return;
    }

    refreshNotifications();
    const socket = connectNotificationSocket();

    const onNew = (notification: Notification) => {
      setNotifications((current) => {
        const withoutDup = current.filter((item) => item.id !== notification.id);
        return [notification, ...withoutDup];
      });
      setUnreadCount((count) => count + 1);
      toast.info(notification.message, { title: notification.title });
    };

    socket.on('notification:new', onNew);

    return () => {
      socket.off('notification:new', onNew);
      disconnectNotificationSocket();
    };
  }, [notificationsEnabled, user, refreshNotifications, toast]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isOpen,
      isLoading,
      isLoadingMore,
      hasMoreNotifications: page < totalPages,
      openPanel: () => setIsOpen(true),
      closePanel: () => setIsOpen(false),
      togglePanel: () => setIsOpen((open) => !open),
      refreshNotifications,
      loadMoreNotifications,
      markRead,
      markAllRead,
      handleNotificationClick,
    }),
    [
      notifications,
      unreadCount,
      isOpen,
      isLoading,
      isLoadingMore,
      page,
      totalPages,
      refreshNotifications,
      loadMoreNotifications,
      markRead,
      markAllRead,
      handleNotificationClick,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      <div ref={panelRef}>{children}</div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
