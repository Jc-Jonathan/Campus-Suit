import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StoreHomeScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const GAP = 6;
const CARD_WIDTH = (width - GAP * 6) / 3; // Account for left padding, right padding, and 2 gaps between cards

interface Product {
  productId: number;
  name: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
}


export const StoreHomeScreen: React.FC = () => {
  const navigation = useNavigation<StoreHomeScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const API_URL = 'https://campus-suit-szub.onrender.com/api/products';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFiltersLoading(true);
        const [typesResponse, brandsResponse] = await Promise.all([
          fetch(`${API_URL}/filters/types`),
          fetch(`${API_URL}/filters/brands`),
        ]);

        if (!typesResponse.ok || !brandsResponse.ok) {
          throw new Error('Failed to fetch filters');
        }

        const [typesData, brandsData] = await Promise.all([
          typesResponse.json(),
          brandsResponse.json(),
        ]);

        setTypes(Array.isArray(typesData) ? typesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error('Error fetching filters:', error);
        // Set empty arrays if there's an error
        setTypes([]);
        setBrands([]);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
  }, []);


const fetchProducts = () => {
  setLoading(true);

  const params = new URLSearchParams();

  if (selectedType) params.append('type', selectedType);
  if (selectedBrand) params.append('brand', selectedBrand);
  if (searchQuery) params.append('search', searchQuery);

  fetch(`${API_URL}/filter?${params.toString()}`)
    .then(res => res.json())
    .then(data => setProducts(data))
    .finally(() => setLoading(false));
};


useEffect(() => {
  fetchProducts();
}, [selectedType, selectedBrand]);

useEffect(() => {
  fetchProducts();
}, [searchQuery]);


  if (loading || filtersLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {/* DROPDOWNS ROW */}
        <View style={styles.dropdownsRow}>
          {/* PRODUCT TYPE */}
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedType}
              onValueChange={value => setSelectedType(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Types" value="" />
              {Array.isArray(types) && types.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          {/* PRODUCT BRAND */}
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedBrand}
              onValueChange={value => setSelectedBrand(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Brands" value="" />
              {Array.isArray(brands) && brands.map(brand => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
          </View>
        </View>

        {/* SEARCH ROW */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search product name..."
            value={searchInput}
            onChangeText={setSearchInput}
            style={styles.searchInput}
          />
          <Pressable
            style={styles.searchIconBtn}
            onPress={() => {
              setSearchQuery(searchInput);
            }}
          >
            <Ionicons name="search" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.heading}>All Products</Text>
      <FlatList
        data={products}
        numColumns={3}
        key={3}
        keyExtractor={item => item.productId.toString()}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.productId,
              })
            }
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.newPrice}>₹{item.newPrice}</Text>
                {item.oldPrice && (
                  <Text style={styles.oldPrice}>
                    ₹{item.oldPrice}
                  </Text>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0627e0',
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
 filters: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  dropdownsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  dropdownContainer: {
    flex: 1,
  },

  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 14,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },

  searchIconBtn: {
    backgroundColor: '#0d0627e0',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.06, 
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,

    // Android shadow
    elevation: 3,
  },

  image: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#eee',
  },

  info: {
    padding: 6,
  },

  name: {
    fontSize: 10,
    fontWeight: '500',
    color: '#222',
    marginBottom: 3,
    lineHeight: 12,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  newPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },

  oldPrice: {
    fontSize: 9,
    color: '#ac0d0dff',
    textDecorationLine: 'line-through',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
