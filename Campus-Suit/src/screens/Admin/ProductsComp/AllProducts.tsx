import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';

export interface Product {
  productId: number;
  name: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
}

interface AllProductsProps {
  products: Product[];
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProduct'>;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AllProducts = ({ navigation }: AllProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  const API_URL = 'http://192.168.31.130:5000/api/products';

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE PRODUCT
  const handleDelete = (productId: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/${productId}`, {
              method: 'DELETE',
            });
            fetchProducts();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  // EDIT PRODUCT
  const handleEdit = (product: Product) => {
    navigation.navigate('EditProduct', { product });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.row}>
      <View style={[styles.cell, styles.imageCell]}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      </View>

      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>₹ {item.newPrice}</Text>
      <Text style={styles.cell}>
        {item.oldPrice ? `₹ ${item.oldPrice}` : '—'}
      </Text>

      <View style={[styles.cell, styles.actionCell]}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={20} color="#27ae60" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.productId)}
          style={styles.iconBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HORIZONTAL SCROLL */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* TABLE HEADER */}
          <View style={styles.header}>
            <Text style={[styles.headerText, styles.imageCell]}>Image</Text>
            <Text style={styles.headerText}>Name</Text>
            <Text style={styles.headerText}>New Price</Text>
            <Text style={styles.headerText}>Old Price</Text>
            <Text style={[styles.headerText, styles.actionCell]}>Action</Text>
          </View>

          {/* VERTICAL SCROLL */}
          <FlatList
            data={products}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 3,
    minWidth: '100%',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  headerText: {
    width: 140,
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ROW */
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginLeft:-5
  },

  cell: {
    width: 140,
    fontSize: 13,
    color: '#2c3e50',
  },

  imageCell: {
    width: 90,
  },

  image: {
    width: 45,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#ecf0f1',
  },

  actionCell: {
    width: 120,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  iconBtn: {
    padding: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
  },
});
