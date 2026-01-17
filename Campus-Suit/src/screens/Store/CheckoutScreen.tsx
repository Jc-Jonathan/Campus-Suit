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
import { useAuth } from '../../contexts/AuthContext';
import { AppButton } from '../../components/AppButton';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { uploadImage } from '../../utils/uploadImage';

export const CheckoutScreen = ({ route }: any) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { userId } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentImage, setPaymentImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [qrBanner, setQrBanner] = useState<any>(null);

  const handleIncrement = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    if (!paymentImage) {
      Alert.alert('Error', 'Please upload payment proof');
      return;
    }

    await fetch('http://192.168.31.130:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name,
        productImage: product.imageUrl,
        quantity: 1,
        totalPrice: product.newPrice,
        email,
        phoneNumber: phone,
        address,
        paymentImage,
      }),
    });

    Alert.alert('Success', 'Order placed successfully');
  };



  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.productContainer}>
        <Image 
          source={{ uri: product.imageUrl }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{(product.newPrice * quantity).toLocaleString()}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={handleDecrement} style={styles.quantityButton}>
                <MaterialIcons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncrement} style={styles.quantityButton}>
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
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
  productContainer: {
    flexDirection: 'row',
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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
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

quantityContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f4f6f8',
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
},

quantityButton: {
  padding: 6,
  borderRadius: 6,
  backgroundColor: '#ffffff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 1,
},

quantityText: {
  marginHorizontal: 12,
  fontSize: 16,
  fontWeight: '600',
  color: '#2c3e50',
  minWidth: 24,
  textAlign: 'center',
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