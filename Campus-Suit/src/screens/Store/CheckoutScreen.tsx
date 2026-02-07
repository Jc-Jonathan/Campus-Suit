import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../../navigation/StoreStack';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppButton } from '../../components/AppButton';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { uploadImage } from '../../utils/uploadImage';

interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
  quantity: number;
}

export const CheckoutScreen = ({ route }: any) => {
  const navigation = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const { cart, directCheckoutItems, clearDirectCheckout, clearCart, incrementQty, removeFromCart, incrementDirectCheckoutQty, removeFromDirectCheckout } = useCart();
  const { userId } = useAuth();
  const { createShopNotification } = useNotifications();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentImage, setPaymentImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [qrBanner, setQrBanner] = useState<any>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Calculate total price for both cart and direct checkout items
  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + (item.newPrice * item.quantity), 0);
  const directCheckoutTotal = directCheckoutItems.reduce((sum: number, item: CartItem) => sum + (item.newPrice * item.quantity), 0);
  const totalAmount = cartTotal + directCheckoutTotal;

  useEffect(() => {
    fetch(`http://192.168.31.130:5000/api/auth/me/${userId}`)
      .then(res => res.json())
      .then(user => {
        setEmail(user.email);
        setPhone(user.phoneCode + user.phoneNumber);
      });
  }, []);

 useEffect(() => {
  fetch('http://192.168.31.130:5000/api/banners?screen=CHECKOUT&position=QR_PAYMENT')
    .then(res => res.json())
    .then(json => setQrBanner(json.data?.[0] || null))
    .catch(console.error);
}, []);


  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets[0].uri) {
        setIsUploading(true);
        const uploadUrl = await uploadImage(res.assets[0].uri);
        setPaymentImage(uploadUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      
      // Get address from coordinates
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const fullAddress = [
        addressResult.name,
        addressResult.street,
        addressResult.city,
        addressResult.region,
        addressResult.postalCode,
        addressResult.country
      ].filter(Boolean).join(', ');

      setAddress(fullAddress);
      setIsMapVisible(true);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const placeOrder = async () => {
    // Validation before sending order
    if (!name || name.trim() === '') {
      Alert.alert('Missing Information', 'Please enter your full name before placing the order.');
      return;
    }

    if (!address || address.trim() === '') {
      Alert.alert('Missing Information', 'Please enter your delivery address before placing the order.');
      return;
    }

    if (!paymentImage) {
      Alert.alert('Missing Information', 'Please upload payment proof before placing the order.');
      return;
    }

    if (!email || !phone) {
      Alert.alert('Missing Information', 'Please ensure your email and phone number are correct.');
      return;
    }

    try {
      // Combine all items for the order
      const allItems = [...cart, ...directCheckoutItems];
      
      // Create order items array for backend
      const orderItems = allItems.map((item: CartItem) => ({
        productName: item.name,
        productImage: item.imageUrl,
        quantity: item.quantity,
        price: item.newPrice
      }));

      // Calculate totals
      const subtotal = totalAmount;

      // Send order to backend
      const response = await fetch('http://192.168.31.130:5000/api/userOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          subtotal: subtotal,
          totalAmount: totalAmount,
          name: name.trim(),
          email: email,
          phoneNumber: phone,
          address: address.trim(),
          paymentDocumentUrl: paymentImage, // This should be URL from upload
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Create shop notification
        await createShopNotification(
          name.trim(),
          email,
          orderItems,
          totalAmount
        );

        // Clear both cart and direct checkout items after successful order
        clearDirectCheckout();
        clearCart();
        
        // Show success popup and navigate to OrderDisplay
        Alert.alert(
          'Order Placed Successfully!',
          `Your order has been placed successfully. Order ID: ${result.order?.orderId || 'N/A'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to OrderDisplay to see all orders
                navigation.navigate('OrderDisplay');
              }
            }
          ]
        );
      } else {
        Alert.alert('Order Failed', result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Error', 'Failed to place order. Please check your internet connection and try again.');
    }
  };

  // Render item component for both cart and direct checkout items
  const renderCartItem = (item: CartItem, isDirectCheckout: boolean = false) => (
    <View key={`${item.productId}-${isDirectCheckout ? 'direct' : 'cart'}`} style={[
      styles.cartItemContainer,
      isDirectCheckout && styles.directCheckoutItem
    ]}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.cartItemImage}
        resizeMode="cover"
      />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
        {isDirectCheckout && (
          <Text style={styles.directCheckoutLabel}>Direct Checkout</Text>
        )}
        <View style={styles.cartItemDetails}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => isDirectCheckout ? removeFromDirectCheckout(item.productId) : removeFromCart(item.productId)}
            >
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => isDirectCheckout ? incrementDirectCheckoutQty(item.productId) : incrementQty(item.productId)}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cartItemTotal}>₹{(item.newPrice * item.quantity).toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => isDirectCheckout ? removeFromDirectCheckout(item.productId, true) : removeFromCart(item.productId, true)}
      >
        <Ionicons name="trash-outline" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cart Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        
        {cart.length > 0 && (
          <View style={styles.itemSection}>
            <Text style={styles.itemSectionTitle}>From Cart ({cart.length} items)</Text>
            {cart.map((item: CartItem) => renderCartItem(item, false))}
          </View>
        )}
        
        {directCheckoutItems.length > 0 && (
          <View style={styles.itemSection}>
            <Text style={styles.itemSectionTitle}>Direct Checkout ({directCheckoutItems.length} items)</Text>
            {directCheckoutItems.map((item: CartItem) => renderCartItem(item, true))}
          </View>
        )}
        
        {cart.length === 0 && directCheckoutItems.length === 0 && (
          <View style={styles.emptyCartContainer}>
            <MaterialIcons name="shopping-cart" size={48} color="#ccc" />
            <Text style={styles.emptyCartText}>No items in cart</Text>
            <Text style={styles.emptyCartSubtext}>Please add items to your cart first</Text>
          </View>
        )}
        
        {(cart.length > 0 || directCheckoutItems.length > 0) && (
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Cart Total:</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            {directCheckoutItems.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Direct Checkout Total:</Text>
                <Text style={styles.totalValue}>₹{directCheckoutTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{email}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your complete delivery address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
        <View style={styles.locationButtonContainer}>
          <AppButton
            label="Use Current Location"
            onPress={getCurrentLocation}
            variant="outline"
            leftIcon="location-on"
            loading={isLoadingLocation}
            style={styles.locationButton}
          />
        </View>
        
        {isMapVisible && location && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Delivery Location"
              />
            </MapView>
          </View>
        )}
      </View>

       {qrBanner && (
              <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scan to Pay</Text>

             <Image
                source={{ uri: qrBanner.imageUrl }}
               style={{
                   width: '100%',
                   height: 220,
                   borderRadius: 12,
                 }}
              resizeMode="contain"
           />
        </View>
         )}


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Proof</Text>
        <Text style={styles.note}>
          Please upload a clear screenshot of your payment confirmation
        </Text>
        
        <TouchableOpacity 
          style={styles.uploadBox}
          onPress={pickImage}
          disabled={isUploading}
        >
          {paymentImage ? (
            <Image 
              source={{ uri: paymentImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.uploadContent}>
              <MaterialIcons 
                name="camera-alt" 
                size={32} 
                color={colors.primary} 
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadText}>Tap to upload payment proof</Text>
              <Text style={styles.uploadSubtext}>JPG, PNG (Max 5MB)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton 
          label={isUploading ? 'Uploading...' : 'Place Order'} 
          onPress={placeOrder} 
          disabled={!paymentImage || !address || isUploading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  cartItemQuantity: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff5f5',
    marginLeft: 8,
    position: 'absolute',
    right: 0,
    top: 0,
    alignSelf: 'center',
  },
  itemSection: {
    marginBottom: 20,
  },
  itemSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  directCheckoutItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: '#f8f9ff',
  },
  directCheckoutLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    backgroundColor: '#e8f0ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  nameInput: {
    minHeight: 40,
  },
  note: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  uploadBox: {
    height: 180,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  uploadContent: {
    alignItems: 'center',
    padding: 20,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  priceContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 8,
},

locationButtonContainer: {
  marginTop: 12,
},

locationButton: {
  borderRadius: 8,
},

mapContainer: {
  marginTop: 16,
  height: 220,
  borderRadius: 12,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},

map: {
  width: '100%',
  height: '100%',
},

});