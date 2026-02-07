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
import { HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  navigation: {
    navigate: (screen: 'SignIn' | 'Cart' | 'Checkout' | 'AuthFlow' | 'Tracking' | 'OrderDisplay', params?: any) => void;
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

  const { addToCart, addToDirectCheckout } = useCart();
  const { isLoggedIn } = useAuth();

  const API_URL = `http://192.168.31.130:5000/api/products`;

  useEffect(() => {
    fetch(`${API_URL}/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then(data => {
        setProduct(Array.isArray(data) ? data[0] : data);
      })
      .catch(() => setProduct(null))
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
          <Image source={{ uri: product.imageUrl }} style={styles.heroImage} />
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.newPrice}>₹{product.newPrice}</Text>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>₹{product.oldPrice}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.actions}>
            <AppButton
              label="Add to Cart"
              variant="outline"
              style={[styles.actionButton, styles.outlineButton]}
              textStyle={styles.buttonText}
              onPress={() => {
                addToCart({
                  productId: product.productId,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  newPrice: product.newPrice,
                  oldPrice: product.oldPrice,
                });
                navigation.navigate('Cart');
              }}
            />

            <AppButton
              label="Order Now"
              style={[styles.actionButton, styles.primaryButton]}
              textStyle={styles.buttonText}
              onPress={() => {
                if (!isLoggedIn) {
                  Alert.alert(
                    'Login Required',
                    'Please login to continue',
                    [
                      {
                        text: 'Login',
                        onPress: () => navigation.navigate('AuthFlow'),
                      },
                    ]
                  );
                  return;
                }
                
                // Add product to direct checkout
                addToDirectCheckout({
                  productId: product.productId,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  newPrice: product.newPrice,
                  oldPrice: product.oldPrice,
                });
                
                // Navigate to checkout
                navigation.navigate('Checkout');
              }}
            />
          </View>

          <View style={styles.basketButtonContainer}>
            <AppButton
              label="Check Your Basket"
              variant="outline"
              style={styles.basketButton}
              textStyle={styles.buttonText}
              onPress={() => {
                navigation.navigate('OrderDisplay');
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
    backgroundColor: '#f4f6f8',
  },

  hero: {
    height: 320,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -20,
    elevation: 6,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  newPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  oldPrice: {
    fontSize: 13,
    color: '#b00020',
    textDecorationLine: 'line-through',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },

  description: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    marginBottom: 24,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
  },

  basketButtonContainer: {
    marginTop: 16,
  },

  muted: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
  },

  basketButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
