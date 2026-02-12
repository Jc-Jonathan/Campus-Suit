// OrderDetailshow.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image, Linking, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Order } from '../../../types';
import { orderAPI } from '../../../utils/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface RouteParams {
  orderId: number;
}

export const OrderDetailshow: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as RouteParams;
    
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions: Array<{ value: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderAPI.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to fetch order details');
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

  const getEmailNotificationMessage = (status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    const messages = {
      pending: 'Email notification will be sent to the customer shortly.',
      confirmed: 'Email notification has been sent to the customer.',
      shipped: 'Email notification has been sent to the customer.',
      delivered: 'Email notification has been sent to the customer.',
      cancelled: 'Email notification has been sent to the customer.'
    };
    return messages[status] || 'Email notification will be sent to the customer.';
  };

  const handleViewPaymentProof = async () => {
    if (order?.paymentDocumentUrl) {
      try {
        const fileUrl = order.paymentDocumentUrl;
        
        // Check if it's a local file URL
        if (fileUrl.startsWith('file://')) {
          // For local files, use Sharing API instead of Linking
          try {
            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(fileUrl);
            if (fileInfo.exists) {
              await Sharing.shareAsync(fileUrl, {
                mimeType: 'image/jpeg',
                dialogTitle: 'Payment Proof',
                UTI: 'public.image'
              });
            } else {
              Alert.alert('Error', 'Payment proof file not found');
            }
          } catch (shareError) {
            console.error('Error sharing local file:', shareError);
            Alert.alert('Error', 'Unable to open payment proof file');
          }
        } else {
          // For remote URLs, use the existing browser approach
          const supported = await Linking.canOpenURL(fileUrl);
          if (supported) {
            await Linking.openURL(fileUrl);
          } else {
            Alert.alert('Error', 'Cannot open this payment document');
          }
        }
      } catch (error) {
        console.error('Error opening payment document:', error);
        Alert.alert('Error', 'Failed to open payment document');
      }
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    if (!order || updatingStatus) return;
    
    // Show confirmation dialog for status changes
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'Confirm Status Update',
        `Are you sure you want to update order #${order.orderId} status to "${newStatus}"?\n\nAn email notification will be sent to ${order.email}.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Update', style: 'default', onPress: () => resolve(true) }
        ]
      );
    });

    if (!confirmed) return;
    
    try {
      setUpdatingStatus(true);
      await orderAPI.updateOrderStatus(order.orderId, newStatus);
      
      // Update local state
      setOrder({ ...order, status: newStatus });
      
      // Create notification for the customer
      const itemCount = order.items?.length || 0;
      
      // Create structured items data for proper display
      const itemsData = order.items?.map((item, index) => ({
        id: index + 1,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        quantity: item.quantity
      })) || [];
      
      const notificationMessage = `Hello ${order.name || 'Customer'},\n\nYour order of ${itemCount} item${itemCount !== 1 ? 's' : ''} has been ${newStatus.toUpperCase()}\n\nTotal amount: $${order.totalAmount?.toFixed(2) || '0.00'}`;
      
     
      
      // Show success message with email notification info
      Alert.alert(
        'Success',
        `Order status updated to "${newStatus}" successfully!\n\n${getEmailNotificationMessage(newStatus)}`
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusOption = (option: typeof statusOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={styles.statusOption}
      onPress={() => handleStatusUpdate(option.value)}
      disabled={updatingStatus}
    >
      <View style={styles.radioContainer}>
        <View
          style={[
            styles.radioButton,
            order?.status === option.value ? styles.radioButtonSelected : styles.radioButtonUnselected
          ]}
        >
          {order?.status === option.value && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <Text style={styles.statusOptionLabel}>{option.label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (item: any, index: number) => (
    <View key={index} style={styles.productItem}>
      <Image 
        source={{ uri: item.productImage }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemTotal}>
          Item Total: ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Order not found</Text>
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
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID and Status */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{order.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{order.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{order.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{order.address}</Text>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {order.items.map(renderProductItem)}
        </View>

        {/* Order Status Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          <View style={styles.statusOptionsContainer}>
            {statusOptions.map(renderStatusOption)}
          </View>
          {updatingStatus && (
            <Text style={styles.updatingText}>Updating status...</Text>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subtotal:</Text>
            <Text style={styles.infoValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={styles.infoValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
          
          {order.paymentDocumentUrl && (
            <TouchableOpacity 
              style={styles.paymentProofButton}
              onPress={handleViewPaymentProof}
            >
              <Ionicons name="document-text-outline" size={20} color="#3498db" />
              <Text style={styles.paymentProofText}>View Payment Proof</Text>
            </TouchableOpacity>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8, 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 4,
  },
  paymentProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  paymentProofText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginTop: 10,
    fontWeight: '500',
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusOption: {
    width: '48%',
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  radioButtonUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusOptionLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  updatingText: {
    fontSize: 14,
    color: '#3498db',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});