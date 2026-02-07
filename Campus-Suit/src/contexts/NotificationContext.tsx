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
  async (category?: 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP' | 'LOAN') => {
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

const createLoanNotification = async (
  reader: string,
  loanTitle: string,
  originalAmount: number,
  currentAmount: number,
  interestRate: number,
  repaymentPeriod: string,
  type: 'amount_increase' | 'repayment_completed'
) => {
  try {
    const message = type === 'amount_increase' 
      ? `Hello ${reader},\n\nNote your available balance has been increased from ₹${originalAmount.toLocaleString()} to ₹${currentAmount.toLocaleString()} by ${interestRate}% per ${repaymentPeriod.split(' ')[1]}`
      : `Hello ${reader},\n\nYour repayment period has been reached. Make sure you complete all the payment.`;

    const notificationData = {
      message,
      category: 'LOAN',
      reader,
      loanInfo: {
        loanTitle,
        originalAmount,
        currentAmount,
        interestRate,
        repaymentPeriod,
        reader,
        type
      }
    };

    const res = await fetch(`${API}/loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(notificationData),
    });

    if (res.ok) {
      // Refresh notifications to show the new one
      fetchNotifications();
      fetchUnreadCount();
    }
  } catch (error) {
    console.error('Error creating loan notification:', error);
  }
};

const createShopNotification = async (
  customerName: string,
  customerEmail: string,
  orderItems: any[],
  totalPrice: number
) => {
  try {
    const message = `Hello ${customerName},\n\nBelow you have successfully placed an order from our shop. Thanks for visiting!\n\nTap "Show More" to view your order details.`;

    const notificationData = {
      message,
      category: 'SHOP',
      targetType: 'Shop', // Specify target type as Shop
      targetUser: customerEmail, // Use email for targeting specific user
      shopInfo: {
        orderItems,
        totalPrice,
        customerName,
        customerEmail
      }
    };

    const res = await fetch(`${API}/shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(notificationData),
    });

    if (res.ok) {
      // Refresh notifications to show the new one
      fetchNotifications();
      fetchUnreadCount();
    }
  } catch (error) {
    console.error('Error creating shop notification:', error);
  }
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
        createLoanNotification,
        createShopNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
