// Orders.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../../types';

interface OrdersProps {
  orders: Order[];
}

export const Orders: React.FC<OrdersProps> = ({ orders }) => {
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

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>
      <Text style={styles.productName}>{item.productName} x {item.quantity}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.totalPrice}>${item.totalPrice.toFixed(2)}</Text>
      </View>
      <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Orders will appear here when customers make purchases</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  list: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  orderDate: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});