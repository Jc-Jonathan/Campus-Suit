// Orders.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AdminNavigationProp } from '../../../navigation/AdminStack';
import { Order } from '../../../types';
import { orderAPI } from '../../../utils/api';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export const Orders: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await orderAPI.getAllOrders();
      // Sort orders in ascending order by Order ID
      const sortedOrders = fetchedOrders.sort((a, b) => a.orderId - b.orderId);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      let errorMessage = 'Failed to fetch orders';
      
      if (error instanceof Error) {
        if (error.message.includes('non-JSON response')) {
          errorMessage = 'Backend server is not responding correctly. Please ensure the server is running.';
        } else if (error.message.includes('HTTP error! status: 404')) {
          errorMessage = 'Orders endpoint not found. Please check backend configuration.';
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and server status.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return '#3498db';
      case 'delivered':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#f39c12';
    }
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetailshow', { orderId: order.orderId });
  };

  const toggleExpandedProducts = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleDeleteOrder = (orderId: number) => {
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete Order #${orderId}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteOrder(orderId),
        },
      ]
    );
  };

  const confirmDeleteOrder = async (orderId: number) => {
    try {
      await orderAPI.deleteOrder(orderId);
      
      // Remove order from local state
      setOrders(orders.filter(order => order.orderId !== orderId));
      
      Alert.alert('Success', `Order #${orderId} has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Error', 'Failed to delete order. Please try again.');
    }
  };

  const renderOrderRow = (order: Order) => (
    <TouchableOpacity 
      key={order.orderId} 
      style={styles.orderRow}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.7}
    >
      <View style={[styles.orderCell, { width: 60 }]}>
        <Text style={styles.cellText}>{order.orderId}</Text>
      </View>
      <View style={[styles.orderCell, { width: 120 }]}>
        <Text style={styles.cellText}>{order.name}</Text>
      </View>
      <View style={[styles.orderCell, { width: 150 }]}>
        <Text style={styles.cellText}>{order.email}</Text>
      </View>
      <View style={[styles.orderCell, { width: 100 }]}>
        <Text style={styles.cellText}>{order.phoneNumber}</Text>
      </View>
      <View style={[styles.orderCell, { width: 150 }]}>
        <Text style={styles.cellText} numberOfLines={1}>{order.address}</Text>
      </View>
      <View style={[styles.orderCell, { width: 200 }]}>
        <View style={{ gap: 6 }}>
          {order.items.slice(0, 1).map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: item.productImage }}
                style={{ width: 30, height: 30, borderRadius: 4, marginRight: 6 }}
              />
              <Text style={styles.cellText}>
                {item.productName} × {item.quantity} (${item.price})
              </Text>
            </View>
          ))}
          {order.items.length > 1 && (
            <TouchableOpacity onPress={() => toggleExpandedProducts(order.orderId)}>
              <Text style={styles.moreItems}>
                {expandedOrders.has(order.orderId) 
                  ? `Show less` 
                  : `+${order.items.length - 1} more`
                }
              </Text>
            </TouchableOpacity>
          )}
          {expandedOrders.has(order.orderId) && order.items.length > 1 && (
            <View style={styles.expandedProducts}>
              {order.items.slice(1).map((item, index) => (
                <View key={`expanded-${index}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: item.productImage }}
                    style={{ width: 30, height: 30, borderRadius: 4, marginRight: 6 }}
                  />
                  <Text style={styles.cellText}>
                    {item.productName} × {item.quantity} (${item.price})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={[styles.orderCell, { width: 80 }]}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
        </View>
      </View>
      <View style={[styles.orderCell, { width: 60 }]}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteOrder(order.orderId)}
        >
          <Ionicons name="trash-bin" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        style={styles.horizontalScroll}
      >
        <ScrollView 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          style={styles.verticalScroll}
        >
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.headerCell, { width: 60 }]}>
                <Text style={styles.headerText}>ID</Text>
              </View>
              <View style={[styles.headerCell, { width: 120 }]}>
                <Text style={styles.headerText}>Name</Text>
              </View>
              <View style={[styles.headerCell, { width: 150 }]}>
                <Text style={styles.headerText}>Email</Text>
              </View>
              <View style={[styles.headerCell, { width: 100 }]}>
                <Text style={styles.headerText}>Phone</Text>
              </View>
              <View style={[styles.headerCell, { width: 150 }]}>
                <Text style={styles.headerText}>Address</Text>
              </View>
              <View style={[styles.headerCell, { width: 200 }]}>
                <Text style={styles.headerText}>Products</Text>
              </View>
              <View style={[styles.headerCell, { width: 80 }]}>
                <Text style={styles.headerText}>Status</Text>
              </View>
              <View style={[styles.headerCell, { width: 60 }]}>
                <Text style={styles.headerText}>Action</Text>
              </View>
            </View>
            
            {orders.length > 0 ? (
              orders.map(renderOrderRow)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color="#bdc3c7" />
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Orders will appear here when customers make purchases</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tableContainer: {
    minWidth: width,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  orderCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    width: 60,
  },
  cellText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
  },
  moreItems: {
    fontSize: 10,
    color: '#3498db',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  expandedProducts: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});