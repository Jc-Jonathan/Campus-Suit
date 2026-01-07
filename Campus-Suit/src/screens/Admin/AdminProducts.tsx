import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type ViewType = 'add' | 'products' | 'orders' | 'notifications';

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Notification {
  id: string;
  message: string;
  date: string;
  recipients: string[];
}

interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerId: string;
  address: string;
  phone: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  newPrice: string;
  oldPrice: string;
}

interface EditModalProps {
  visible: boolean;
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
  onInputChange: (field: keyof Product, value: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  product,
  onSave,
  onCancel,
  onInputChange,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit Product</Text>

        <TextInput
          style={styles.input}
          value={product.name}
          onChangeText={(t) => onInputChange('name', t)}
          placeholder="Product name"
        />

        <TextInput
          style={styles.input}
          value={product.imageUrl}
          onChangeText={(t) => onInputChange('imageUrl', t)}
          placeholder="Image URL"
        />

        <TextInput
          style={styles.input}
          value={product.newPrice}
          onChangeText={(t) => onInputChange('newPrice', t)}
          placeholder="New Price"
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          value={product.oldPrice}
          onChangeText={(t) => onInputChange('oldPrice', t)}
          placeholder="Old Price"
          keyboardType="numeric"
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => onSave(product)}
          >
            <Text style={styles.modalButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const AdminProducts: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('products');
  const [product, setProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    imageUrl: '',
    newPrice: '',
    oldPrice: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Mock applicants data
  const applicants: Applicant[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'approved' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'rejected' },
  ];

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select images.');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProduct({ ...product, imageUrl: result.assets[0].uri });
    }
  };

  const handleAddProduct = () => {
    if (!product.name || !product.imageUrl) return;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...product, id: p.id } : p
        )
      );
      setEditingProduct(null);
    } else {
      setProducts((prev) => [...prev, { ...product, id: generateId() }]);
    }

    setProduct({ name: '', imageUrl: '', newPrice: '', oldPrice: '' });
    setCurrentView('products');
  };

  const handleEditProduct = (p: Product) => {
    setProduct(p);
    setEditingProduct(p);
    setCurrentView('add');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleApplicant = (applicantId: string) => {
    setSelectedApplicants(prev => 
      prev.includes(applicantId)
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim() || selectedApplicants.length === 0) return;

    const newNotification: Notification = {
      id: editingNotificationId || generateId(),
      message: notificationMessage,
      date: new Date().toISOString(),
      recipients: selectedApplicants,
    };

    if (editingNotificationId) {
      setNotifications(prev => 
        prev.map(n => n.id === editingNotificationId ? newNotification : n)
      );
    } else {
      setNotifications(prev => [newNotification, ...prev]);
    }

    setNotificationMessage('');
    setSelectedApplicants([]);
    setEditingNotificationId(null);
  };

  const handleEditNotification = (notification: Notification) => {
    setNotificationMessage(notification.message);
    setSelectedApplicants([...notification.recipients]);
    setEditingNotificationId(notification.id);
    setCurrentView('notifications');
  };

  const handleDeleteNotification = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const cancelEdit = () => {
    setNotificationMessage('');
    setSelectedApplicants([]);
    setEditingNotificationId(null);
  };

  const loadMockOrders = () => {
    setOrders([
      {
        id: 'ORD-001',
        productName: 'Laptop',
        quantity: 1,
        totalPrice: 999.99,
        customerName: 'John Doe',
        customerId: 'CUST-001',
        address: '123 Main St',
        phone: '+123456789',
        date: '2025-12-11',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={styles.sidebarContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.sidebarButton, currentView === 'add' && styles.activeSidebarButton]}
            onPress={() => setCurrentView('add')}
          >
            <Ionicons name="add-circle-outline" size={22} color={currentView === 'add' ? '#4CAF50' : '#fff'} />
            <Text style={[styles.sidebarButtonText, currentView === 'add' && styles.activeButtonText]}>
              Add Product
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarButton, currentView === 'products' && styles.activeSidebarButton]}
            onPress={() => setCurrentView('products')}
          >
            <Ionicons name="list-outline" size={22} color={currentView === 'products' ? '#4CAF50' : '#fff'} />
            <Text style={[styles.sidebarButtonText, currentView === 'products' && styles.activeButtonText]}>
              Products ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarButton, currentView === 'orders' && styles.activeSidebarButton]}
            onPress={() => {
              if (!orders.length) loadMockOrders();
              setCurrentView('orders');
            }}
          >
            <Ionicons name="cart-outline" size={22} color={currentView === 'orders' ? '#4CAF50' : '#fff'} />
            <Text style={[styles.sidebarButtonText, currentView === 'orders' && styles.activeButtonText]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarButton, currentView === 'notifications' && styles.activeSidebarButton]}
            onPress={() => setCurrentView('notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={currentView === 'notifications' ? '#4CAF50' : '#fff'} />
            <Text style={[styles.sidebarButtonText, currentView === 'notifications' && styles.activeButtonText]}>
              Notifications
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentScroll}>
        <ScrollView style={styles.content}>
          {currentView === 'add' && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              
              <Text style={styles.label}>Product Image</Text>
              <TouchableOpacity 
                style={styles.imageUploadButton}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={24} color="#4CAF50" />
                <Text style={styles.uploadButtonText}>
                  {product.imageUrl ? 'Change Image' : 'Select Image from Gallery'}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={product.name}
                onChangeText={(text) => setProduct({...product, name: text})}
                placeholder="Enter product name"
                placeholderTextColor="#999"
              />
              
              <View style={styles.priceContainer}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.label}>Old Price</Text>
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={product.oldPrice}
                      onChangeText={(text) => setProduct({...product, oldPrice: text})}
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={[styles.priceInputContainer, {marginLeft: 10}]}>
                  <Text style={styles.label}>New Price</Text>
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={product.newPrice}
                      onChangeText={(text) => setProduct({...product, newPrice: text})}
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
              
              {product.imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Text style={styles.label}>Image Preview:</Text>
                  <ScrollView 
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <Image 
                      source={{ uri: product.imageUrl }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                  </ScrollView>
                </View>
              ) : null}
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (!product.name || !product.imageUrl || !product.newPrice) && styles.disabledButton
                ]} 
                onPress={handleAddProduct}
                disabled={!product.name || !product.imageUrl || !product.newPrice}
              >
                <Text style={styles.submitButtonText}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setCurrentView('products');
                  setEditingProduct(null);
                  setProduct({ name: '', imageUrl: '', newPrice: '', oldPrice: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentView === 'products' && (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <View style={styles.productHeader}>
                    {item.imageUrl ? (
                      <Image 
                        source={{ uri: item.imageUrl }} 
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                      </View>
                    )}
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      onPress={() => handleEditProduct(item)}
                      style={[styles.iconButton, styles.editButton]}
                    >
                      <Ionicons name="pencil" size={14} color="#fff" />
                      <Text style={[styles.buttonText, {color: '#fff', marginLeft: 6}]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteProduct(item.id)}
                      style={[styles.iconButton, styles.deleteButton]}
                    >
                      <Ionicons name="trash" size={14} color="#fff" />
                      <Text style={[styles.buttonText, {color: '#fff', marginLeft: 6}]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          {currentView === 'orders' && (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text>{item.productName}</Text>
              )}
            />
          )}

          {currentView === 'notifications' && (
            <View style={styles.notificationContainer}>
              <Text style={styles.sectionTitle}>
                {editingNotificationId ? 'Edit Notification' : 'New Notification'}
              </Text>

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.messageInput}
                multiline
                numberOfLines={4}
                placeholder="Type your notification message here..."
                value={notificationMessage}
                onChangeText={setNotificationMessage}
              />

              <Text style={styles.label}>Select Applicants</Text>
              <View style={styles.applicantsList}>
                {applicants.map(applicant => (
                  <TouchableOpacity
                    key={applicant.id}
                    style={[
                      styles.applicantItem,
                      selectedApplicants.includes(applicant.id) && styles.selectedApplicant
                    ]}
                    onPress={() => toggleApplicant(applicant.id)}
                  >
                    <View style={styles.applicantInfo}>
                      <Text style={styles.applicantName}>{applicant.name}</Text>
                      <Text style={styles.applicantEmail}>{applicant.email}</Text>
                      <Text 
                        style={[
                          styles.applicantStatus,
                          applicant.status === 'approved' && styles.statusApproved,
                          applicant.status === 'rejected' && styles.statusRejected
                        ]}
                      >
                        {applicant.status}
                      </Text>
                    </View>
                    {selectedApplicants.includes(applicant.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    (!notificationMessage.trim() || selectedApplicants.length === 0) && styles.disabledButton
                  ]}
                  onPress={handleSendNotification}
                  disabled={!notificationMessage.trim() || selectedApplicants.length === 0}
                >
                  <Ionicons name="send" size={16} color="#fff" style={{marginRight: 5}} />
                  <Text style={styles.buttonText}>
                    {editingNotificationId ? 'Update Notification' : 'Send Notification'}
                  </Text>
                </TouchableOpacity>

                {editingNotificationId && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={cancelEdit}
                  >
                    <Text style={[styles.buttonText, {color: '#f44336'}]}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.sectionTitle, {marginTop: 30, marginBottom: 10}]}>
                Sent Notifications
              </Text>
              
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={50} color="#e0e0e0" />
                  <Text style={styles.emptyText}>No notifications sent yet</Text>
                </View>
              ) : (
                <View style={styles.notificationsList}>
                  {notifications.map(notification => (
                    <View key={notification.id} style={styles.notificationCard}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationDate}>
                          {new Date(notification.date).toLocaleString()}
                        </Text>
                        <View style={styles.notificationActions}>
                          <TouchableOpacity 
                            style={[styles.actionButton, {marginRight: 10}]}
                            onPress={() => handleEditNotification(notification)}
                          >
                            <Ionicons name="pencil" size={14} color="#4CAF50" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleDeleteNotification(notification.id)}
                          >
                            <Ionicons name="trash" size={14} color="#f44336" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.recipientCount}>
                        Sent to {notification.recipients.length} {notification.recipients.length === 1 ? 'recipient' : 'recipients'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: { 
    width: 145, 
    backgroundColor: '#2c3e50',
    borderRightWidth: 1,
    borderRightColor: '#0f2b5c',
    
  },
  sidebarScroll: {
    height: '100%',
  },
  sidebarContent: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  sidebarButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeSidebarButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  sidebarButtonText: { 
    color: '#fff', 
    marginLeft: 10,
    fontSize: 14,
  },
  contentScroll: {
    flex: 1,
    padding: 20,
  },
  content: { 
    flex: 1,
  },
  notificationContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  applicantsList: {
    marginBottom: 15,
  },
  applicantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedApplicant: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9f0',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  applicantEmail: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  applicantStatus: {
    fontSize: 12,
    color: '#f39c12',
  },
  statusApproved: {
    color: '#2ecc71',
  },
  statusRejected: {
    color: '#e74c3c',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 10,
    color: '#95a5a6',
    textAlign: 'center',
  },
  notificationsList: {
    marginTop: 10,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  notificationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipientCount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceInputContainer: {
    flex: 1,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 5,
    color: '#555',
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 5,
    marginBottom: 0,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: 10,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 10,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    marginRight: 16,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 30,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    minWidth: 70,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 15,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    marginLeft: 8,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButtonModal: { 
    backgroundColor: '#f0f0f0', 
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: { 
    backgroundColor: '#4CAF50', 
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: { 
    color: '#fff',
    fontWeight: '500',
  },
});
