import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../../navigation/StoreStack';
import { HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';

type Props = NativeStackScreenProps<
  StoreStackParamList,
  'ProductDetail'
>;

interface Product {
  productId: number;
  name: string;
  description: string;
  imageUrl: string;
  newPrice: number;
  oldPrice?: number;
}

export const ProductDetailScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);

  const API_URL = 'http://192.168.31.130:5000/api/products';

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then((data: Product[]) =>
        setProduct(data.find(p => p.productId === Number(id)) || null)
      );
  }, [id]);

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

      <ScrollView>
        {/* IMAGE */}
        <View style={styles.hero}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.heroImage}
          />
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.description}>
            {product.description}
          </Text>

          {/* PRICE ROW */}
          <View style={styles.priceRow}>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>
                ₹{product.oldPrice}
              </Text>
            )}
            <Text style={styles.newPrice}>
              ₹{product.newPrice}
            </Text>
          </View>

          {/* BUTTONS */}
          <View style={styles.actions}>
            <AppButton label="Add to Cart" onPress={() => {}} />
            <AppButton label="Order Now" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  hero: {
    height: 280,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },

  card: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },

  name: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    marginBottom: 8,
  },

  description: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },

  newPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  oldPrice: {
    fontSize: 16,
    color: 'red',
    textDecorationLine: 'line-through',
  },

  actions: {
    gap: theme.spacing.sm,
  },

  muted: {
    padding: 20,
    color: theme.colors.textMuted,
  },
});
