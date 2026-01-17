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

type StoreHomeScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const GAP = 12;
const CARD_WIDTH = (width - GAP * 3) / 2;

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

  const API_URL = 'http://192.168.31.130:5000/api/products';

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
  {/* PRODUCT TYPE */}
  <Picker
    selectedValue={selectedType}
    onValueChange={value => setSelectedType(value)}
  >
    <Picker.Item label="All Types" value="" />
    {Array.isArray(types) && types.map(type => (
      <Picker.Item key={type} label={type} value={type} />
    ))}
  </Picker>

  {/* PRODUCT BRAND */}
  <Picker
    selectedValue={selectedBrand}
    onValueChange={value => setSelectedBrand(value)}
  >
    <Picker.Item label="All Brands" value="" />
    {Array.isArray(brands) && brands.map(brand => (
      <Picker.Item key={brand} label={brand} value={brand} />
    ))}
  </Picker>

  {/* SEARCH */}
  <TextInput
  placeholder="Search product name..."
  value={searchInput}
  onChangeText={setSearchInput}
  style={styles.search}
/>
<Pressable
  style={styles.searchBtn}
  onPress={() => {
    setSearchQuery(searchInput);
  }}
>
  <Text style={styles.searchBtnText}>Search</Text>
</Pressable>

</View>

      <Text style={styles.heading}>All Products</Text>
      <FlatList
        data={products}
        numColumns={2}
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
    fontSize: 25,
    fontWeight: '700',
    color: '#0e5eaeff',
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
 filters: {
  paddingHorizontal: 12,
  marginBottom: 10,
},
searchBtn: {
  backgroundColor: '#0e5eaeff',
  paddingVertical: 12,
  borderRadius: 10,
  marginTop: 10,
  alignItems: 'center',
},

searchBtnText: {
  color: '#fff',
  fontWeight: '700',
},


search: {
  backgroundColor: '#fff',
  padding: 10,
  borderRadius: 10,
  marginTop: 8,
  borderWidth: 1,
  borderColor: '#ddd',
},

  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,

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
    height: 160,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: '#eee',
  },

  info: {
    padding: 10,
  },

  name: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
    marginBottom: 6,
    lineHeight: 16,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  newPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  oldPrice: {
    fontSize: 12,
    color: '#ac0d0dff',
    textDecorationLine: 'line-through',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
