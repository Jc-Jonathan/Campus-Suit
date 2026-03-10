import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EditProduct = ({ route, navigation }: any) => {
  const { product } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
  name: product.name,
  productType: product.productType || '',
  productBrand: product.productBrand || '',
  description: product.description || '',
  newPrice: String(product.newPrice),
  oldPrice: product.oldPrice ? String(product.oldPrice) : '',
});


  const [errors, setErrors] = useState<Record<string, string>>({});

  const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/products';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

     if (!formData.productType.trim()) {
      newErrors.productType = 'Product type is required';
     }

    if (!formData.productBrand.trim()) {
          newErrors.productBrand = 'Product brand is required';
       }

     if (!formData.description.trim()) {
           newErrors.description = 'Product description is required';
     }

    if (!formData.newPrice || isNaN(Number(formData.newPrice)) || Number(formData.newPrice) <= 0) {
      newErrors.newPrice = 'Please enter a valid price';
    }
    
    if (formData.oldPrice && (isNaN(Number(formData.oldPrice)) || Number(formData.oldPrice) <= 0)) {
      newErrors.oldPrice = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateProduct = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/${product.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
               name: formData.name.trim(),
               productType: formData.productType.trim(),
               productBrand: formData.productBrand.trim(),
               description: formData.description.trim(),
               newPrice: Number(formData.newPrice),
               oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
               imageUrl: product.imageUrl,
              }),


      });

      if (!response.ok) throw new Error('Update failed');
      
      Alert.alert('Success', 'Product updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Product</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          {product.imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: product.imageUrl }} 
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter product name"
              placeholderTextColor="#999"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

           <View style={styles.inputGroup}>
             <Text style={styles.label}>Product Type</Text>
         <TextInput
              value={formData.productType}
            onChangeText={(text) => handleChange('productType', text)}
           style={[styles.input, errors.productType && styles.inputError]}
           placeholder="e.g. Electronics, Books"
           placeholderTextColor="#999"
         />
        {errors.productType && (
             <Text style={styles.errorText}>{errors.productType}</Text>
        )}
        </View>

          <View style={styles.inputGroup}>
             <Text style={styles.label}>Product Brand</Text>
        <TextInput
            value={formData.productBrand}
            onChangeText={(text) => handleChange('productBrand', text)}
            style={[styles.input, errors.productBrand && styles.inputError]}
           placeholder="e.g. Apple, Samsung"
          placeholderTextColor="#999"
          />
  {errors.productBrand && (
    <Text style={styles.errorText}>{errors.productBrand}</Text>
  )}
</View>


          <View style={styles.inputGroup}>
  <Text style={styles.label}>Product Description</Text>
  <TextInput
    value={formData.description}
    onChangeText={(text) => handleChange('description', text)}
    style={[
      styles.input,
      styles.textArea,
      errors.description && styles.inputError,
    ]}
    placeholder="Enter product description"
    placeholderTextColor="#999"
    multiline
    numberOfLines={4}
  />
  {errors.description && (
    <Text style={styles.errorText}>{errors.description}</Text>
  )}
</View>


          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Price (₹)</Text>
            <TextInput
              value={formData.newPrice}
              onChangeText={(text) => handleChange('newPrice', text.replace(/[^0-9.]/g, ''))}
              style={[styles.input, errors.newPrice && styles.inputError]}
              placeholder="Enter current price"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.newPrice && <Text style={styles.errorText}>{errors.newPrice}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Original Price (₹) - Optional</Text>
            <TextInput
              value={formData.oldPrice}
              onChangeText={(text) => handleChange('oldPrice', text.replace(/[^0-9.]/g, ''))}
              style={[styles.input, errors.oldPrice && styles.inputError]}
              placeholder="Enter original price (if on sale)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.oldPrice && <Text style={styles.errorText}>{errors.oldPrice}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={updateProduct}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  textArea: {
  height: 100,
  textAlignVertical: 'top',
},

  formContainer: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
