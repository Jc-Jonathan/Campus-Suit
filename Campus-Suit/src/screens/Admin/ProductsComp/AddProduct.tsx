import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';

interface ProductData {
  name: string;
  productType: string;    // ✅
  productBrand: string;   // ✅
  description: string;
  imageUrl: string;
  newPrice: string;
  oldPrice: string;
}

interface AddProductProps {
  onAddProduct: (product: ProductData) => void;
  onSuccess?: () => void;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
}

export const AddProduct: React.FC<AddProductProps> = ({ onAddProduct, onSuccess, navigation }) => {
  const [product, setProduct] = useState<Omit<ProductData, 'id'>>({
    name: '',
    productType: '',
  productBrand: '',
    description: '',
    imageUrl: '',
    newPrice: '',
    oldPrice: '',
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProduct({ ...product, imageUrl: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!product.name || !product.productType ||!product.productBrand || !product.description || !product.newPrice || !product.imageUrl) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('http://192.168.31.130:5000/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          productType: product.productType,
          productBrand: product.productBrand,
          description: product.description,
          imageUrl: product.imageUrl,
          newPrice: Number(product.newPrice),
          oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message);
        return;
      }

      onAddProduct && onAddProduct(product);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Server connection failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            placeholder="Enter product name"
            returnKeyType="next"
          />
        </View>
        <View style={styles.formGroup}>
  <Text style={styles.label}>Product Type</Text>
  <TextInput
    style={styles.input}
    value={product.productType}
    onChangeText={(text) =>
      setProduct({ ...product, productType: text })
    }
    placeholder="e.g. Electronics, Books"
  />
</View>

<View style={styles.formGroup}>
  <Text style={styles.label}>Product Brand</Text>
  <TextInput
    style={styles.input}
    value={product.productBrand}
    onChangeText={(text) =>
      setProduct({ ...product, productBrand: text })
    }
    placeholder="e.g. Samsung, Apple"
  />
</View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(text) => setProduct({ ...product, description: text })}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>New Price</Text>
          <TextInput
            style={styles.input}
            value={product.newPrice}
            onChangeText={(text) => setProduct({ ...product, newPrice: text })}
            placeholder="Enter new price"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Old Price (Optional)</Text>
          <TextInput
            style={styles.input}
            value={product.oldPrice}
            onChangeText={(text) => setProduct({ ...product, oldPrice: text })}
            placeholder="Enter old price"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color="#666" />
                <Text style={styles.imagePlaceholderText}>Tap to add an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Add Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});