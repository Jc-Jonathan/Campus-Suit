import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { StoreStackParamList } from '../../navigation/StoreStack';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
type Props = {
  navigation: {
    navigate: (screen: 'SignIn' | 'Cart' | 'Checkout' | 'Auth', params?: any) => void;
  };
  route: {
    params: {
      productId: number;
    };
  };
};

interface Product {
  productId: number;
  name: string;
  description: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
}

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();

  const API_URL = `http://192.168.31.130:5000/api/products`;

  useEffect(() => {
    fetch(`${API_URL}/${productId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        return res.json();
      })
      .then(data => {
        console.log('Product data:', data);
        if (Array.isArray(data)) {
          setProduct(data[0] || null);
        } else {
          setProduct(data);
        }
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <HeaderTab />
        <Text style={styles.muted}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE */}
        <View style={styles.hero}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.heroImage}
            onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
            resizeMode="contain"
          />
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.newPrice}>₹{product.newPrice}</Text>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>
                ₹{product.oldPrice}
              </Text>
            )}
          </View>

          <Text style={styles.description}>
            {product.description}
          </Text>

          <View style={styles.actions}>
            <AppButton
              style={{ flex: 1 }}
              label="Add to Cart"
              variant="outline"
              onPress={() => {
                addToCart({
                  productId: product.productId,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  newPrice: product.newPrice,
                  oldPrice: product.oldPrice,
                });
                // Navigate to Cart screen
                navigation.navigate('Cart' as never);
              }}
            />

           <AppButton
              label="Order Now"
              style={{ flex: 1 }}
           onPress={() => {
            if (!isLoggedIn) {
           Alert.alert(
            'Login Required',
               'Please login to continue',
            [
             {
            text: 'Login',
            onPress: () =>
              navigation.navigate('AuthFlow' as never),
          },
        ]
      );
      return;
    }

    navigation.navigate('Checkout', { product });
  }}
/>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    height: 300,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Muted text style
  muted: {
    flex: 1,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  newPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 12,
  },
  oldPrice: {
    fontSize: 16,
    color: '#e90707ff',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 15,
    color: '#666',
    fontWeight: '300',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});