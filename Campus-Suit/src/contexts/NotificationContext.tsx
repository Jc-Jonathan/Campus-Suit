import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: any) => {
  const { userToken } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API = 'http://192.168.31.130:5000/api/notifications';

  const fetchNotifications = useCallback(
  async (category?: 'ANNOUNCEMENT' | 'SCHOLARSHIP') => {
    if (!userToken) return;

    const url =
      category
        ? `${API}/user?category=${category}`
        : `${API}/user`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    setNotifications(data);
  },
  [userToken]
);


  const fetchUnreadCount = useCallback(async () => {
    if (!userToken) return;

    const res = await fetch(`${API}/unread-count`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    setUnreadCount(data.count ?? 0);
  }, [userToken]);

  const markAsRead = async (id: string) => {
  if (!userToken) return;

  await fetch(`${API}/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
  });

  fetchUnreadCount();
};


  /* 🔥 Auto refresh */
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        fetchNotifications();
        fetchUnreadCount();
      }
    });

    return () => sub.remove();
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
