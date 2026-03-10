import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type AdminProductsNavigationProp = NativeStackNavigationProp<RootStackParamList>;
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AllProducts } from './ProductsComp/AllProducts';
import {AddProduct} from './ProductsComp/AddProduct';
import {Orders} from './ProductsComp/Orders';
import { Product } from './ProductsComp/AllProducts';

type ViewType = 'products' | 'add' | 'orders' | 'notifications';

export const AdminProducts = () => {
  const navigation = useNavigation<AdminProductsNavigationProp>();
  const [currentView, setCurrentView] = useState<ViewType>('products');
  const [products, setProducts] = useState<Product[]>([]);


  const handleAddProduct = (product: any) => {
    // Here you would typically make an API call to save the product
    console.log('Adding product:', product);
    // After adding, you might want to switch back to the products view
    setCurrentView('products');
    // You might also want to show a success message
    alert('Product added successfully!');
  };

  const handleEditProduct = (product: Product) => {
    // Handle edit product
    console.log('Editing product:', product);
  };

  const handleDeleteProduct = (id: string) => {
    // Handle delete product
    console.log('Deleting product with id:', id);
    setProducts(prevProducts => prevProducts.filter(p => p.productId !== Number(id)));
  };

  const renderRightContent = () => {
    switch (currentView) {
      case 'products':
        return (
          <AllProducts 
            products={products}
            navigation={navigation as unknown as NativeStackNavigationProp<RootStackParamList, 'EditProduct'>}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        );
      case 'add':
        return <AddProduct 
          onAddProduct={handleAddProduct} 
          navigation={navigation as unknown as NativeStackNavigationProp<RootStackParamList, 'AddProduct'>}
        />;
      case 'orders':
        return <Orders />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* LEFT SIDEBAR */}
      <View style={styles.sidebar}>
        <Text style={styles.storeTitle}>Exotic Store</Text>
        <SidebarButton
          icon="list-outline"
          label="All Products"
          active={currentView === 'products'}
          onPress={() => setCurrentView('products')}
        />
        <SidebarButton
          icon="add-circle-outline"
          label="Add Product"
          active={currentView === 'add'}
          onPress={() => setCurrentView('add')}
        />
        <SidebarButton
          icon="cart-outline"
          label="Orders"
          active={currentView === 'orders'}
          onPress={() => setCurrentView('orders')}
        />
      </View>

      {/* RIGHT CONTENT - Let the inner component handle scrolling */}
      <View style={styles.content}>
        {renderRightContent()}
      </View>
    </View>
  );
};

const SidebarButton = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.sideBtn, active && styles.sideBtnActive]}
  >
    <Ionicons
      name={icon}
      size={22}
      color={active ? '#5CFF7A' : '#fff'}
    />
    <Text style={[styles.sideText, active && styles.sideTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2C3E50',
  },
  sidebar: {
    width: 130,
    backgroundColor: '#2C3E50',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  storeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginLeft: -15,
    borderRadius: 8,
    marginBottom: 10,
  },
  sideBtnActive: {
    backgroundColor: '#34495e',
  },
  sideText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  sideTextActive: {
    color: '#5CFF7A',
    fontWeight: 'bold',
  },
});