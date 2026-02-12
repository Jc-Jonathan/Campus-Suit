import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  message: string;
  category: 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP' | 'LOAN';
  pdfUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
  orderDetails?: any;
  applicantInfo?: any;
  loanInfo?: any;
  scholarshipInfo?: any;
  shopInfo?: any;
  targetUser?: string;
  targetUsers?: string[];
}

interface User {
  _id?: string;
  userId?: number;
  email?: string;
  role?: 'student' | 'admin';
  isAdmin?: boolean;
  [key: string]: any;
}

const NotificationContext = createContext<any>(null);


export const NotificationProvider = ({ children }: any) => {
  const { user, userToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Don't fetch notifications for admin users
  const shouldShowNotifications = user && !user.isAdmin;

  const API = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/notifications';

  const fetchNotifications = useCallback(
  async (category?: 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP') => {
    if (!userToken || !shouldShowNotifications) return;

    const url =
      category
        ? `${API}/user?category=${category}`
        : `${API}/user`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    
    console.log('All notifications received from backend:', data);
    
    // Filter notifications based on user email for user-specific notifications
    const filteredData = data.filter((notification: any) => {
      // For announcements, show to all users
      if (notification.category === 'ANNOUNCEMENT') {
        return true;
      }
      
      // For loan notifications, check if the notification belongs to the current user
      if (notification.category === 'LOAN') {
        // Check if notification has loanInfo with applicantEmail that matches current user
        if (notification.loanInfo?.applicantEmail) {
          return notification.loanInfo.applicantEmail === user?.email;
        }
        // Check if notification has reader field that matches current user
        if (notification.loanInfo?.reader) {
          return notification.loanInfo.reader === user?.email;
        }
      }
      
      // For scholarship notifications, check if the notification belongs to the current user
      if (notification.category === 'SCHOLARSHIP') {
        if (notification.scholarshipInfo?.applicantEmail) {
          return notification.scholarshipInfo.applicantEmail === user?.email;
        }
        if (notification.reader) {
          return notification.reader === user?.email;
        }
      }
      
      // For shop notifications, check if the notification belongs to the current user
      if (notification.category === 'SHOP') {
        console.log('Shop notification filtering:', {
          targetUsers: notification.targetUsers,
          currentUserEmail: user?.email,
          isInTargetUsers: notification.targetUsers?.includes(user?.email)
        });
        
        // Check if current user's email is in the targetUsers array
        if (notification.targetUsers && notification.targetUsers.length > 0) {
          return notification.targetUsers.includes(user?.email);
        }
        
        // Fallback to old logic for backward compatibility
        if (notification.shopInfo?.customerEmail) {
          return notification.shopInfo.customerEmail === user?.email;
        }
        if (notification.targetUser) {
          return notification.targetUser === user?.email;
        }
      }
      
      // Default: show notification if no specific email filtering is required
      return true;
    });
    
    console.log('Filtered notifications for user:', filteredData);
    setNotifications(filteredData);
  },
  [userToken, user?.email]
);


  const fetchUnreadCount = useCallback(async () => {
    if (!userToken || !shouldShowNotifications) {
      setUnreadCount(0);
      return;
    }

    const res = await fetch(`${API}/unread-count`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    setUnreadCount(data.count ?? 0);
  }, [userToken, shouldShowNotifications]);

  const markAsRead = async (id: string) => {
  if (!userToken) return;

  await fetch(`${API}/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
  });

  // Update local state to reflect the change immediately
  setNotifications(prev => 
    prev.map(notification => 
      notification._id === id 
        ? { ...notification, readBy: [...(notification.readBy || []), user?._id || user?.userId?.toString() || ''] }
        : notification
    )
  );

  fetchUnreadCount();
};

// Manual refresh function for immediate updates
const refreshNotifications = useCallback(async () => {
  if (userToken) {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
  }
}, [userToken, fetchNotifications, fetchUnreadCount]);

// Clear notifications function for logout
const clearNotifications = useCallback(() => {
  setNotifications([]);
  setUnreadCount(0);
}, []);

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
      targetUsers: [customerEmail], // Use targetUsers array for consistency
      shopInfo: {
        orderItems,
        totalPrice,
        customerName,
        customerEmail
      }
    };

    // Debug: Log what we're sending
    console.log('Sending shop notification:', {
      notificationData,
      orderItemsCount: orderItems?.length || 0,
      totalPrice,
      customerName,
      customerEmail
    });

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
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Server response error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || 'Failed to create shop notification');
    }
  } catch (error) {
    console.error('Error creating shop notification:', error);
  }
};

// Generic addNotification function for order status updates
const addNotification = async (notificationData: {
  message: string;
  category: 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP' | 'LOAN';
  targetUsers?: string[];
  shopInfo?: any;
  orderDetails?: any;
  [key: string]: any;
}) => {
  try {
    // Create notification data based on category
    const notificationPayload = {
      message: notificationData.message,
      category: notificationData.category,
      targetType: 'Shop',
      targetUsers: notificationData.targetUsers || [],
      shopInfo: notificationData.shopInfo,
      orderDetails: notificationData.orderDetails
    };

    const res = await fetch(`${API}/shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    if (res.ok) {
      // Refresh notifications to show the new one
      fetchNotifications();
      fetchUnreadCount();
      console.log('✅ Order status notification created:', notificationPayload);
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Server response error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || 'Failed to create order status notification');
    }
  } catch (error) {
    console.error('Error creating order status notification:', error);
  }
};


  const createScholarshipNotification = async (
  applicantName: string,
  applicantEmail: string,
  scholarshipName: string,
  courseName: string
) => {
  if (!userToken) return;
  
  try {
    const message = `Hello ${applicantName},\n\nCongradulation on your application for ${scholarshipName} taking ${courseName} always check your email for further process`;

    const notificationData = {
      message,
      category: 'SCHOLARSHIP',
      reader: applicantEmail,
      scholarshipInfo: {
        applicantName,
        applicantEmail,
        scholarshipName,
        courseName,
        message
      }
    };

    const res = await fetch(`${API}/scholarship`, {
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
      console.log('✅ Scholarship notification created:', notificationData);
    } else {
      throw new Error('Failed to create scholarship notification');
    }
  } catch (error) {
    console.error('❌ Error creating scholarship notification:', error);
  }
};

  const createLoanApplicationNotification = async (
  applicantName: string,
  applicantEmail: string,
  loanName: string,
  amount: string,
  interestRate: string
) => {
  if (!userToken) return;
  
  try {
    const message = `Hello ${applicantName},\n\nCongradulation on your application for ${loanName} under this ${interestRate}% intrest rate for this $${amount} amount always check your email for further process`;

    const notificationData = {
      message,
      category: 'LOAN',
      reader: applicantEmail,
      loanInfo: {
        applicantName,
        applicantEmail,
        loanName,
        amount,
        interestRate,
        message
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
      console.log('✅ Loan application notification created:', notificationData);
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Server response error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || 'Failed to create loan application notification');
    }
  } catch (error) {
    console.error('❌ Error creating loan application notification:', error);
  }
};

  /* 🔥 Auto refresh with periodic polling */
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Set up periodic polling for real-time updates
    const intervalId = setInterval(() => {
      if (userToken) {
        fetchNotifications();
        fetchUnreadCount();
      }
    }, 5000); // Refresh every 5 seconds

    // Set up app state listener
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        // Immediate refresh when app becomes active
        fetchNotifications();
        fetchUnreadCount();
      }
    });

    // Cleanup
    return () => {
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [fetchNotifications, fetchUnreadCount, userToken]);

  // Clear notifications when user logs out (userToken becomes null)
  const prevUserTokenRef = useRef(userToken);
  useEffect(() => {
    if (prevUserTokenRef.current && !userToken) {
      // User just logged out
      setNotifications([]);
      setUnreadCount(0);
    }
    prevUserTokenRef.current = userToken;
  }, [userToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        refreshNotifications,
        clearNotifications,
        createLoanNotification,
        createShopNotification,
        createScholarshipNotification,
        createLoanApplicationNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
