import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';
import { orderAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { RootNavigationProp } from '../../types/navigation';
import { colors, spacing, radius, typography, shadows } from '../../theme/theme';

export const OrderDisplay: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      
      if (user?.email) {
        const ordersData = await orderAPI.getOrdersByEmail(user.email);
        // Sort orders in ascending order by Order ID
        const sortedOrders = ordersData.sort((a, b) => a.orderId - b.orderId);
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = (order: Order) => {
    (navigation as any).navigate('Tracking', { orderId: order.orderId });
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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderRow}
      onPress={() => handleOrderPress(item)}
    >
      {/* Order Number */}
      <View style={styles.cell}>
        <Text style={styles.orderNo}>{item.orderId}</Text>
      </View>
      
      {/* Products */}
      <View style={styles.productsCell}>
        {item.items.slice(0, 1).map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Image
              source={{ uri: product.productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.productName}
              </Text>
              <Text style={styles.productDetails}>
                Qty: {product.quantity} × ${product.price}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 1 && (
          <TouchableOpacity onPress={() => toggleExpandedProducts(item.orderId)}>
            <Text style={styles.moreItems}>
              {expandedOrders.has(item.orderId) 
                ? `Show less` 
                : `+${item.items.length - 1} more`
              }
            </Text>
          </TouchableOpacity>
        )}
        {expandedOrders.has(item.orderId) && item.items.length > 1 && (
          <View style={styles.expandedProducts}>
            {item.items.slice(1).map((product, index) => (
              <View key={`expanded-${index}`} style={styles.productItem}>
                <Image
                  source={{ uri: product.productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.productName}
                  </Text>
                  <Text style={styles.productDetails}>
                    Qty: {product.quantity} × ${product.price}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Total */}
      <View style={styles.cell}>
        <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
      </View>
      
      {/* Navigation Arrow */}
      <View style={styles.cell}>
        <View style={[styles.arrowContainer, { paddingRight: 16 }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Order No</Text>
      </View>
      <View style={styles.headerProductsCell}>
        <Text style={styles.headerText}>Products</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Total</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}></Text>
      </View>
    </View>
  );

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
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>No orders found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      {renderTableHeader()}
      
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
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
  headerProductsCell: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 50,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  productsCell: {
    flex: 2,
    justifyContent: 'center',
  },
  orderNo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 10,
    color: '#7f8c8d',
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
  arrowContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  emptyText: {
    fontSize: 18,
    color: '#e74c3c',
    marginTop: 10,
    fontWeight: '500',
  },
});