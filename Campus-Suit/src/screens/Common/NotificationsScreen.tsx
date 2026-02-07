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
    loanTitle: string;
    originalAmount: number;
    currentAmount: number;
    interestRate: number;
    repaymentPeriod: string;
    reader: string;
    type: 'amount_increase' | 'repayment_completed';
  };
};

export default function NotificationScreen() {
  const {
    notifications,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useNotifications();

  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /* ================= FETCH BASED ON FILTER ================= */
  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      // Always fetch specific category based on filter
      if (filter === 'ALL') {
        await fetchNotifications('ALL');
      } else {
        await fetchNotifications(filter);
      }

      await fetchUnreadCount();
      
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

  // Filter notifications based on selected category
  const filteredNotifications = filter === 'ALL' 
    ? notifications.filter((notification: Notification) => notification.category === 'ALL')
    : notifications.filter((notification: Notification) => notification.category === filter);

  const toggleExpanded = async (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        
        // For shop notifications, fetch complete order details if needed
        const notification = notifications.find((n: Notification) => n._id === id);
        if (notification?.category === 'SHOP' && (!notification.orderDetails?.orderId)) {
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

  if (notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No notifications found</Text>
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
        renderItem={({ item }) => {
          const unread =
            !readIds.has(item._id) &&
            !item.readBy?.includes(user?._id || '');

          return (
            <TouchableOpacity
              style={[styles.card, unread && styles.unreadCard]}
              activeOpacity={0.85}
              onPress={() => {
                setReadIds(prev => new Set(prev).add(item._id));
                markAsRead(item._id);
                
                // Toggle expansion for shop notifications
                if (item.category === 'SHOP' && item.orderDetails) {
                  toggleExpanded(item._id);
                }
              }}
            >
              {/* CATEGORY */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              {/* MESSAGE */}
              <Text style={[styles.message, unread && styles.unreadText]}>
                {item.message}
              </Text>

              {/* SHOW MORE BUTTON FOR SHOP NOTIFICATIONS */}
              {item.category === 'SHOP' && item.orderDetails && !expandedIds.has(item._id) && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => toggleExpanded(item._id)}
                >
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              )}

              {/* SHOP NOTIFICATION - EXPANDABLE PRODUCT DETAILS */}
              {item.category === 'SHOP' && item.orderDetails && expandedIds.has(item._id) && (
                <View style={styles.orderDetailsContainer}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.orderDetails.orderId}</Text>
                    <Text style={styles.orderStatus}>{item.orderDetails.status ? item.orderDetails.status.toUpperCase() : 'UNKNOWN'}</Text>
                  </View>
                  
                  {item.orderDetails.items && item.orderDetails.items.map((product, index) => (
                    <View key={index} style={styles.productItem}>
                      <Image 
                        source={{ uri: product.productImage }} 
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.productName || 'Product Name'}</Text>
                        <Text style={styles.productPrice}>${product.price || '0.00'}</Text>
                        <Text style={styles.productQuantity}>Quantity: {product.quantity || '0'}</Text>
                        <Text style={styles.itemTotal}>
                          Total: ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Order Total:</Text>
                    <Text style={styles.totalAmount}>${(item.orderDetails.totalAmount || 0).toFixed(2)}</Text>
                  </View>
                </View>
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

              {/* LOAN NOTIFICATION - LOAN DETAILS */}
              {item.category === 'LOAN' && item.loanInfo && (
                <View style={styles.loanDetailsContainer}>
                  <View style={styles.loanHeader}>
                    <Text style={styles.loanTitle}>{item.loanInfo.loanTitle}</Text>
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
                    <Text style={styles.loanAmount}>Original: ₹{item.loanInfo.originalAmount.toLocaleString()}</Text>
                    <Text style={styles.currentLoanAmount}>Current: ₹{item.loanInfo.currentAmount.toLocaleString()}</Text>
                    <Text style={styles.loanInterest}>Interest: {item.loanInfo.interestRate}% per {item.loanInfo.repaymentPeriod.split(' ')[1]}</Text>
                    <Text style={styles.loanReader}>To: {item.loanInfo.reader}</Text>
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
  unreadText: {
    fontWeight: '600',
    color: '#111827',
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
});
