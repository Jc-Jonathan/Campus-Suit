import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

type FilterType = 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP' | 'LOAN';

type Notification = {
  _id: string;
  message: string;
  category: 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP' | 'SHOP' | 'LOAN';
  pdfUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
  orderDetails?: {
    orderId: number;
    customerName: string;
    status: string;
    items: Array<{
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    createdAt: string;
  };
  applicantInfo?: {
    fullName: string;
    email: string;
    scholarshipTitle: string;
    program: string;
    status: 'approved' | 'rejected';
  };
  loanInfo?: {
    loanTitle?: string;
    originalAmount?: number;
    currentAmount?: number;
    interestRate?: number;
    repaymentPeriod?: string;
    reader?: string;
    type?: 'amount_increase' | 'repayment_completed';
    applicantName?: string;
    applicantEmail?: string;
    loanName?: string;
    amount?: string;
    message?: string;
  };
  scholarshipInfo?: {
    applicantName: string;
    applicantEmail: string;
    scholarshipName: string;
    courseName: string;
    message: string;
  };
  shopInfo?: {
    orderItems: any[];
    totalPrice: number;
    customerName: string;
    customerEmail: string;
  };
  targetUser?: string;
  targetUsers?: string[];
};

export default function NotificationScreen() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Debug: Log notifications when they change
  useEffect(() => {
    console.log('📋 Notifications loaded:', {
      count: notifications.length,
      userEmail: user?.email,
      notifications: notifications.map((n: Notification) => ({
        id: n._id,
        category: n.category,
        message: n.message?.substring(0, 50) + '...',
        hasShopInfo: !!n.shopInfo,
        hasOrderDetails: !!n.orderDetails,
        targetUsers: n.targetUsers
      }))
    });
  }, [notifications, user?.email]);

  // Helper function to render formatted message with colored text
  const renderFormattedMessage = (message: string, category: string, item: any) => {
    const userId = user?._id || user?.userId?.toString() || '';
    const isRead = item.readBy?.includes(userId);
    
    const messageStyle = isRead ? styles.readText : styles.unreadText;

    if (category === 'SCHOLARSHIP' && item.scholarshipInfo) {
      return (
        <Text style={[styles.message, messageStyle]}>
          Hello {item.scholarshipInfo.applicantName},
          {'\n\n'}
          Congradulation on your application for 
          <Text style={styles.highlightedText}> {item.scholarshipInfo.scholarshipName} </Text> 
          taking 
          <Text style={styles.highlightedText}> {item.scholarshipInfo.courseName} </Text> 
          always check your email for further process
        </Text>
      );
    }
    
    if (category === 'LOAN' && item.loanInfo) {
      // Check if this is a loan application notification or a repayment notification
      if (item.loanInfo.type === 'amount_increase' || item.loanInfo.type === 'repayment_completed') {
        // This is a repayment/amount increase notification - show simplified message by default
        const readerName = item.loanInfo.reader || item.loanInfo.applicantName || 'User';
        const simpleMessage = item.loanInfo.type === 'amount_increase' 
          ? `Your available balance has been increased.`
          : `Your repayment period has been reached. Make sure you complete all the payment.`;
        
        return (
          <>
            <Text style={[styles.message, messageStyle]}>
              Hello {readerName},
              {'\n\n'}
              {simpleMessage}
            </Text>
            
            {/* Expanded loan details */}
            {expandedIds.has(item._id) && (
              <Text style={[styles.expandedLoanDetails, messageStyle]}>
                {item.loanInfo.type === 'amount_increase' 
                  ? `Note your available balance has been increased from $${item.loanInfo.originalAmount?.toLocaleString() || '0'} to $${item.loanInfo.currentAmount?.toLocaleString() || '0'} by ${item.loanInfo.interestRate || '0'}% per ${item.loanInfo.repaymentPeriod?.split(' ')[1] || 'month'}`
                  : `Original amount: $${item.loanInfo.originalAmount?.toLocaleString() || '0'}, Current amount: $${item.loanInfo.currentAmount?.toLocaleString() || '0'}`
                }
              </Text>
            )}
          </>
        );
      } else {
        // This is a loan application notification - show simplified message by default
        const applicantName = item.loanInfo.applicantName || 'User';
        
        return (
          <>
            <Text style={[styles.message, messageStyle]}>
              Hello {applicantName},
              {'\n\n'}
              Congradulation on your application for {item.loanInfo.loanName || 'loan'}.
            </Text>
            
            {/* Expanded loan application details */}
            {expandedIds.has(item._id) && (
              <Text style={[styles.expandedLoanDetails, messageStyle]}>
                Congratulations on your application for 
                <Text style={styles.highlightedText}> {item.loanInfo.loanName || 'loan'} </Text> 
                under this 
                <Text style={styles.highlightedText}> {item.loanInfo.interestRate}% </Text> 
                interest rate for this 
                <Text style={styles.highlightedText}> ${item.loanInfo.amount} </Text> 
                amount always check your email for further process
              </Text>
            )}
          </>
        );
      }
    }
    
    if (category === 'SHOP' && (item.shopInfo || item.orderDetails)) {
      const customerName = item.shopInfo?.customerName || item.orderDetails?.customerName || 'Customer';
      const itemCount = item.shopInfo?.orderItems?.length || item.orderDetails?.items?.length || 0;
      const totalAmount = item.shopInfo?.totalPrice || item.orderDetails?.totalAmount || 0;
      const status = item.shopInfo?.status || item.orderDetails?.status;
      
      // Debug: Log the actual data structure
      console.log('🔍 Shop notification data:', {
        item: item,
        shopInfo: item.shopInfo,
        orderDetails: item.orderDetails,
        customerName,
        itemCount,
        totalAmount,
        status
      });
      
      return (
        <>
          <Text style={[styles.message, messageStyle]}>
            Hello {customerName},
            {'\n\n'}
            Your order of {itemCount} items has been {status?.toUpperCase() || 'PLACED'}
            {'\n\n'}
            Total amount: ${totalAmount.toFixed(2)}
            {'\n\n'}
            <Text style={styles.showMoreText}>Show More</Text>
          </Text>
          
          {/* Email check message when expanded */}
          {item.category === 'SHOP' && expandedIds.has(item._id) && (
            <View style={styles.orderDetailsContainer}>
              <Text style={[styles.message, messageStyle]}>
                Check your email
              </Text>
            </View>
          )}
        </>
      );
    }
    
    // Default message rendering for other categories
    return (
      <Text style={[styles.message, messageStyle]}>
        {message}
      </Text>
    );
  };

  /* ================= FETCH BASED ON FILTER ================= */
  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      // Use the new refreshNotifications function for better performance
      await refreshNotifications();
      
      // Debug: Log notifications data
      console.log('Loaded notifications:', notifications);
      console.log('Filter applied:', filter);
      
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Helper function to get empty state message for each category
  const getEmptyMessage = () => {
    switch (filter) {
      case 'ANNOUNCEMENT':
        return 'No announcements available';
      case 'SCHOLARSHIP':
        return 'No scholarship notifications';
      case 'SHOP':
        return 'No shop notifications';
      case 'LOAN':
        return 'No loan notifications';
      default:
        return 'No notifications found';
    }
  };

  // Helper function to determine if a notification should be shown to the current user
  const shouldShowNotification = (notification: Notification, userEmail?: string) => {
    // For announcements, show to all users
    if (notification.category === 'ANNOUNCEMENT') {
      return true;
    }
    
    // For loan notifications, check if the notification belongs to the current user
    if (notification.category === 'LOAN') {
      // Check if notification has loanInfo with applicantEmail that matches current user
      if (notification.loanInfo?.applicantEmail) {
        return notification.loanInfo.applicantEmail === userEmail;
      }
      // Check if notification has reader field that matches current user
      if (notification.loanInfo?.reader) {
        return notification.loanInfo.reader === userEmail;
      }
    }
    
    // For scholarship notifications, check if the notification belongs to the current user
    if (notification.category === 'SCHOLARSHIP') {
      if (notification.scholarshipInfo?.applicantEmail) {
        return notification.scholarshipInfo.applicantEmail === userEmail;
      }
    }
    
    // For shop notifications, check if the notification belongs to the current user
    if (notification.category === 'SHOP') {
      // Check if current user's email is in the targetUsers array
      if (notification.targetUsers && notification.targetUsers.length > 0 && userEmail) {
        return notification.targetUsers.includes(userEmail);
      }
      // Check if notification has shopInfo with customerEmail that matches current user
      if (notification.shopInfo?.customerEmail) {
        return notification.shopInfo.customerEmail === userEmail;
      }
      // Fallback to old logic for backward compatibility
      if (notification.targetUser) {
        return notification.targetUser === userEmail;
      }
    }
    
    // Default: show notification if no specific email filtering is required
    return true;
  };

  // Filter notifications based on selected category and user email
  const filteredNotifications = filter === 'ALL' 
    ? notifications.filter((notification: Notification) => {
        // Additional client-side filtering to ensure user-specific notifications
        const shouldShow = shouldShowNotification(notification, user?.email);
        console.log('🔍 Filtering notification (ALL):', {
          id: notification._id,
          category: notification.category,
          message: notification.message?.substring(0, 50) + '...',
          userEmail: user?.email,
          shouldShow: shouldShow
        });
        return shouldShow;
      })
    : notifications.filter((notification: Notification) => {
        const shouldShow = notification.category === filter && shouldShowNotification(notification, user?.email);
        console.log('🔍 Filtering notification (FILTERED):', {
          id: notification._id,
          category: notification.category,
          filter: filter,
          message: notification.message?.substring(0, 50) + '...',
          userEmail: user?.email,
          shouldShow: shouldShow
        });
        return shouldShow;
      });

  const toggleExpanded = async (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        
        // For shop notifications, fetch complete order details if needed
        const notification = notifications.find((n: Notification) => n._id === id);
        if (notification?.category === 'SHOP' && (!notification.orderDetails?.orderId) && (!notification.shopInfo?.orderItems)) {
          try {
            console.log('Fetching complete order details for notification:', id);
            // We could add an API call here to fetch complete order details
            // For now, let's work with what we have
          } catch (error) {
            console.error('Failed to fetch order details:', error);
          }
        }
      }
      return newSet;
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [filter])
  );

  /* ================= DOWNLOAD ================= */
  const confirmDownload = (url: string, fileName?: string) => {
    Alert.alert(
      'Download Document',
      'Do you want to download this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => downloadAndOpen(url, fileName) },
      ]
    );
  };

  const downloadAndOpen = async (url: string, fileName?: string) => {
    try {
      const dir = FileSystem.cacheDirectory + 'downloads/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      const safeName =
        fileName?.replace(/[^a-zA-Z0-9._-]/g, '_') ||
        `document_${Date.now()}.pdf`;

      const fileUri = dir + safeName;

      const result = await FileSystem.downloadAsync(url, fileUri);

      if (!result.uri) throw new Error('Download failed');

      // Android intent
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(result.uri);
          await IntentLauncher.startActivityAsync(
            'android.intent.action.VIEW',
            {
              data: contentUri,
              flags: 1,
              type: 'application/pdf',
            }
          );
          return;
        } catch {}
      }

      // Fallback (iOS + Android)
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Open Document',
      });
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Unable to open document. Please ensure a PDF reader is installed.'
      );
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {/* FILTER - Always show categories */}
        <View style={styles.filterRow}>
          {['ALL', 'ANNOUNCEMENT', 'SCHOLARSHIP', 'SHOP', 'LOAN'].map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                filter === f && styles.filterActive,
              ]}
              onPress={() => setFilter(f as FilterType)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === 'ALL' ? 'All' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* EMPTY STATE */}
        <View style={styles.centered}>
          <Text style={styles.emptyMessage}>{getEmptyMessage()}</Text>
        </View>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <View style={{ flex: 1 }}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        {['ALL', 'ANNOUNCEMENT', 'SCHOLARSHIP', 'SHOP', 'LOAN'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList<Notification>
        data={filteredNotifications}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadNotifications}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyMessage}>{getEmptyMessage()}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const userId = user?._id || user?.userId?.toString() || '';
          const unread = !item.readBy?.includes(userId);

          // Debug log for all notifications
          console.log('🔍 Rendering notification item:', {
            id: item._id,
            category: item.category,
            message: item.message?.substring(0, 50) + '...',
            unread: unread,
            hasShopInfo: !!item.shopInfo,
            hasOrderDetails: !!item.orderDetails
          });

          // Debug log for shop notifications
          if (item.category === 'SHOP') {
            console.log('Shop Notification Item:', {
              id: item._id,
              shopInfo: item.shopInfo,
              orderDetails: item.orderDetails,
              hasShopInfo: !!item.shopInfo,
              hasOrderDetails: !!item.orderDetails,
              orderItems: item.shopInfo?.orderItems || item.orderDetails?.items
            });
          }

          return (
            <TouchableOpacity
              style={[styles.card, unread && styles.unreadCard]}
              activeOpacity={0.85}
              onPress={async () => {
                if (unread) {
                  await markAsRead(item._id);
                  // Refresh notifications to get updated read state
                  await loadNotifications();
                }
                
                // Toggle expansion for shop and loan notifications
                if ((item.category === 'SHOP' && (item.shopInfo || item.orderDetails)) || (item.category === 'LOAN' && item.loanInfo)) {
                  toggleExpanded(item._id);
                }
              }}
            >
              {/* CATEGORY */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              {/* MESSAGE */}
              {(() => {
                console.log('🔍 About to render message:', {
                  message: item.message,
                  category: item.category,
                  hasShopInfo: !!item.shopInfo,
                  hasOrderDetails: !!item.orderDetails
                });
                return renderFormattedMessage(item.message, item.category, item);
              })()}

                            
              {/* SHOW MORE/SHOW LESS BUTTON FOR LOAN NOTIFICATIONS */}
              {item.category === 'LOAN' && item.loanInfo && (
                !expandedIds.has(item._id) ? (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => toggleExpanded(item._id)}
                  >
                    <Text style={styles.showMoreText}>Show More</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => toggleExpanded(item._id)}
                  >
                    <Text style={styles.showMoreText}>Show Less</Text>
                  </TouchableOpacity>
                )
              )}

              
              {/* SCHOLARSHIP NOTIFICATION - APPLICANT DETAILS */}
              {item.category === 'SCHOLARSHIP' && item.applicantInfo && (
                <View style={styles.scholarshipDetailsContainer}>
                  <View style={styles.applicantHeader}>
                    <Text style={styles.applicantName}>{item.applicantInfo.fullName}</Text>
                    <View style={[
                      styles.statusBadge,
                      item.applicantInfo.status === 'approved' ? styles.statusApproved : styles.statusRejected
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.applicantInfo.status === 'approved' ? styles.statusApprovedText : styles.statusRejectedText
                      ]}>
                        {item.applicantInfo.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.scholarshipInfo}>
                    <Text style={styles.scholarshipTitle}>{item.applicantInfo.scholarshipTitle}</Text>
                    <Text style={styles.programName}>Program: {item.applicantInfo.program}</Text>
                    <Text style={styles.emailText}>Email: {item.applicantInfo.email}</Text>
                  </View>
                </View>
              )}

              {/* LOAN NOTIFICATION - LOAN DETAILS (ONLY SHOW WHEN EXPANDED) */}
              {item.category === 'LOAN' && item.loanInfo && expandedIds.has(item._id) && (
                <View style={styles.loanDetailsContainer}>
                  <View style={styles.loanHeader}>
                    <Text style={styles.loanTitle}>{item.loanInfo.loanTitle || 'Loan Details'}</Text>
                    <View style={[
                      styles.loanTypeBadge,
                      item.loanInfo.type === 'amount_increase' ? styles.amountIncreaseBadge : styles.repaymentCompletedBadge
                    ]}>
                      <Text style={[
                        styles.loanTypeText,
                        item.loanInfo.type === 'amount_increase' ? styles.amountIncreaseText : styles.repaymentCompletedText
                      ]}>
                        {item.loanInfo.type === 'amount_increase' ? 'Amount Increased' : 'Repayment Due'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.loanInfo}>
                    {item.loanInfo.originalAmount && (
                      <Text style={styles.loanAmount}>Original: ₹{item.loanInfo.originalAmount.toLocaleString()}</Text>
                    )}
                    {item.loanInfo.currentAmount && (
                      <Text style={styles.currentLoanAmount}>Current: ₹{item.loanInfo.currentAmount.toLocaleString()}</Text>
                    )}
                    {item.loanInfo.interestRate && (
                      <Text style={styles.loanInterest}>Interest: {item.loanInfo.interestRate}% per {item.loanInfo.repaymentPeriod?.split(' ')[1] || 'month'}</Text>
                    )}
                    {(item.loanInfo.reader) && (
                      <Text style={styles.loanReader}>To: {item.loanInfo.reader || 'N/A'}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* DOCUMENT */}
              {item.category === 'SCHOLARSHIP' && item.pdfUrl && (
                <TouchableOpacity
                  style={styles.docBox}
                  onPress={() =>
                    confirmDownload(item.pdfUrl!, item.fileName)
                  }
                >
                  <Text style={styles.docText}>
                    📄 {item.fileName || 'Scholarship Document'}
                  </Text>
                  <Text style={styles.docHint}>Tap to download</Text>
                </TouchableOpacity>
              )}

              {/* DATE */}
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 3,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 1,
  },
  filterBtn: {
    flex: 1,
    marginHorizontal: 1.5,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  filterActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#f5f7fa',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#f8fafc',
    paddingLeft: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    marginBottom: 6,
  },
  highlightedText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  unreadText: {
    fontWeight: '600',
    color: '#111827',
  },
  readText: {
    fontWeight: '400',
    color: '#9ca3af',
    opacity: 0.7,
  },
  docBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  docText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  docHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  // Shop notification styles
  orderDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  orderStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 10,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  // Show More button styles
  showMoreButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  showMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  // Scholarship notification styles
  scholarshipDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  applicantName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scholarshipInfo: {
    gap: 4,
  },
  scholarshipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  programName: {
    fontSize: 13,
    color: '#6b7280',
  },
  emailText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusApprovedText: {
    color: '#16a34a',
  },
  statusRejectedText: {
    color: '#dc2626',
  },
  // Loan notification styles
  loanDetailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  loanTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  amountIncreaseBadge: {
    backgroundColor: '#ecfdf5',
  },
  repaymentCompletedBadge: {
    backgroundColor: '#fef3c7',
  },
  loanTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountIncreaseText: {
    color: '#059669',
  },
  repaymentCompletedText: {
    color: '#d97706',
  },
  loanInfo: {
    gap: 4,
  },
  loanAmount: {
    fontSize: 13,
    color: '#6b7280',
  },
  currentLoanAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  loanInterest: {
    fontSize: 13,
    color: '#6b7280',
  },
  loanReader: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  expandedLoanDetails: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    marginTop: 6,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noProductsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  noProductsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  noProductsSubtext: {
    fontSize: 12,
    color: '#78350f',
    textAlign: 'center',
  },
  // Status color styles
  statusCancelled: {
    color: '#e74c3c',
  },
  statusDelivered: {
    color: '#2ecc71',
  },
  statusShipped: {
    color: '#3498db',
  },
  statusConfirmed: {
    color: '#f39c12',
  },
  statusPending: {
    color: '#f39c12',
  },
});
