import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';
import { orderAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  orderId?: number;
}

interface StatusNode {
  status: string;
  label: string;
  color: string;
  icon: string;
}

export const TrackingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(orderId !== undefined);

  useEffect(() => {
    if (orderId) {
      // If orderId is provided, fetch specific order details
      fetchOrderDetails();
    } else {
      // Otherwise, fetch all orders for the user
      fetchUserOrders();
    }
  }, [orderId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      console.log('Current user object:', user);
      console.log('User email:', user?.email);
      console.log('User role:', user?.role);
      console.log('Is admin:', user?.isAdmin);
      
      if (user?.email) {
        console.log('Fetching orders for email:', user.email);
        const ordersData = await orderAPI.getOrdersByEmail(user.email);
        console.log('Received orders data:', ordersData);
        console.log('Orders length:', ordersData?.length);
        setOrders(ordersData);
      } else {
        console.log('No user email found - user might not be logged in');
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for orderId:', orderId);
      const orderData = await orderAPI.getOrderById(orderId!);
      setSelectedOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (orderId) {
      // If we came from OrderDisplay with a specific orderId, go back
      navigation.goBack();
    } else if (showDetail) {
      // Otherwise, if we're showing detail from the list, go back to list
      setShowDetail(false);
      setSelectedOrder(null);
    } else {
      // Otherwise, go back to previous screen
      navigation.goBack();
    }
  };

  const statusNodes: StatusNode[] = [
    { status: 'pending', label: 'Order Placed', color: '#F59E0B', icon: 'time' },
    { status: 'confirmed', label: 'Confirmed', color: '#3B82F6', icon: 'checkmark-circle' },
    { status: 'shipped', label: 'Shipped', color: '#8B5CF6', icon: 'car' },
    { status: 'delivered', label: 'Delivered', color: '#10B981', icon: 'checkmark-done-circle' },
    { status: 'cancelled', label: 'Cancelled', color: '#EF4444', icon: 'close-circle' }
  ];

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.tableRow}>
        {/* Order Number */}
        <View style={styles.tableCell}>
          <Text style={styles.tableHeader}>Order #{item.orderId}</Text>
          <Text style={styles.tableSubText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        {/* Product Info */}
        <View style={styles.tableCell}>
          {item.items.slice(0, 2).map((product, index) => (
            <View key={index} style={styles.productPreview}>
              <Image
                source={{ uri: product.productImage }}
                style={styles.productThumb}
                resizeMode="cover"
              />
              <Text style={styles.productName} numberOfLines={1}>
                {product.productName}
              </Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} more</Text>
          )}
        </View>
        
        {/* Quantity */}
        <View style={styles.tableCell}>
          <Text style={styles.quantityText}>
            {item.items.reduce((sum, p) => sum + p.quantity, 0)} items
          </Text>
        </View>
        
        {/* Price */}
        <View style={styles.tableCell}>
          <Text style={styles.priceText}>${item.totalAmount.toFixed(2)}</Text>
        </View>
        
        {/* Status */}
        <View style={styles.tableCell}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {/* Navigation */}
        <View style={styles.tableCell}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return '#3B82F6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'confirmed':
        return '#8B5CF6';
      default:
        return '#F59E0B';
    }
  };

  const getCurrentStatusIndex = () => {
    if (!selectedOrder) return -1;
    return statusNodes.findIndex(node => node.status === selectedOrder.status);
  };

  const renderStatusNode = (node: StatusNode, index: number) => {
    const currentIndex = getCurrentStatusIndex();
    const isActive = index <= currentIndex;
    const isCurrent = index === currentIndex;
    const isCancelled = selectedOrder?.status === 'cancelled' && node.status === 'cancelled';

    return (
      <View key={node.status} style={styles.statusNode}>
        <View style={styles.nodeContainer}>
          <View
            style={[
              styles.node,
              isActive ? styles.activeNode : styles.inactiveNode,
              isCurrent && styles.currentNode,
              isCancelled && styles.cancelledNode
            ]}
          >
            <Ionicons
              name={node.icon as any}
              size={20}
              color={isActive ? '#fff' : '#bdc3c7'}
            />
          </View>
          {index < statusNodes.length - 1 && (
            <View
              style={[
                styles.connector,
                isActive && index < currentIndex ? styles.activeConnector : styles.inactiveConnector
              ]}
            />
          )}
        </View>
        <Text
          style={[
            styles.statusLabel,
            isActive ? styles.activeLabel : styles.inactiveLabel,
            isCurrent && styles.currentLabel
          ]}
        >
          {node.label}
        </Text>
      </View>
    );
  };

  const renderProductItem = (item: any, index: number) => (
    <View key={index} style={styles.productItem}>
      <Image
        source={{ uri: item.productImage }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.productPrice}>${item.price} each</Text>
        <Text style={styles.itemTotal}>
          Total: ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const OrderDetailView = () => (
    <View style={styles.detailContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>
            {new Date(selectedOrder?.createdAt || '').toLocaleDateString()} at {new Date(selectedOrder?.createdAt || '').toLocaleTimeString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder?.status || 'pending') }]}>
          <Text style={styles.statusText}>
            {selectedOrder?.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Pending'}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {selectedOrder?.items.map(renderProductItem)}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${selectedOrder?.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Status Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.trackingContainer}>
            {statusNodes.map(renderStatusNode)}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{selectedOrder?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{selectedOrder?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{selectedOrder?.phoneNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // If showing detail view, render the detailed tracking view
  if (showDetail && selectedOrder) {
    return <OrderDetailView />;
  }

  // Otherwise, show the list of orders
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
        <Text style={styles.errorText}>No orders found</Text>
        <Text style={styles.debugInfo}>
          Logged in as: {user?.email || 'Not logged in'}
        </Text>
        <Text style={styles.debugInfo}>
          Role: {user?.role || 'Unknown'}
        </Text>
        <Text style={styles.debugInfo}>
          Is Admin: {user?.isAdmin ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.orderId.toString()}
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginTop: -30,
    borderBottomColor: colors.border,
    ...shadows.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 10,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 5,
    marginTop: 5,
    marginRight: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  productQuantity: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  statusNode: {
    alignItems: 'center',
    flex: 1,
  },
  nodeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  node: {
    width: 35,
    height: 35,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeNode: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveNode: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  currentNode: {
    transform: [{ scale: 1.1 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  cancelledNode: {
    backgroundColor: colors.danger,
  },
  connector: {
    height: 3,
    flex: 1,
    position: 'absolute',
    top: 22.5,
    left: 48,
    zIndex: -1,
    borderRadius: 1.5,
  },
  activeConnector: {
    backgroundColor: colors.primary,
  },
  inactiveConnector: {
    backgroundColor: colors.border,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  activeLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  inactiveLabel: {
    color: colors.textMuted,
  },
  currentLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugInfo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  orderItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  tableSubText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productThumb: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8,
  },
  moreItems: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  quantityText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  ordersList: {
    flex: 1,
    paddingBottom: 20,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
});