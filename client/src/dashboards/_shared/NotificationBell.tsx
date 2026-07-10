import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { formatNotificationTime } from '../../utils/notificationLinks';
import '../../css/Notifications.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    isLoadingMore,
    hasMoreNotifications,
    togglePanel,
    markAllRead,
    handleNotificationClick,
    loadMoreNotifications,
  } = useNotifications();

  if (!user || user.role === 'admin') {
    return null;
  }

  return (    <div className="wn-notifications">
      <button
        type="button"
        className="wn-notifications__bell"
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="wn-notifications__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="wn-notifications__panel" role="dialog" aria-label="Notifications">
          <div className="wn-notifications__panel-head">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="wn-notifications__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="wn-notifications__list">
            {isLoading && notifications.length === 0 ? (
              <p className="wn-notifications__empty">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="wn-notifications__empty">You&apos;re all caught up.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`wn-notifications__item ${
                    notification.isRead ? '' : 'wn-notifications__item--unread'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="wn-notifications__item-title">{notification.title}</span>
                  <span className="wn-notifications__item-message">{notification.message}</span>
                  <span className="wn-notifications__item-time">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>

          {hasMoreNotifications && (
            <div className="wn-notifications__footer">
              <button
                type="button"
                className="wn-notifications__load-more"
                disabled={isLoadingMore}
                onClick={loadMoreNotifications}
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
