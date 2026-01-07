import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../../navigation/StoreStack';
import { useAppData } from '../../contexts/AppDataContext';
import { HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';

export type ProductDetailProps = NativeStackScreenProps<
  StoreStackParamList,
  'ProductDetail'
>;

export const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route, navigation }) => {
  const { products } = useAppData();
  const product = products.find(p => p.id === route.params.id);

  if (!product) {
    return (
      <View style={styles.container}>
        <HeaderTab />
        <View style={styles.content}>
          <Text style={styles.muted}>Product not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />
      <View style={styles.hero}>
        {product.image && (
          <Image
            source={{ uri: product.image }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.name}>{product.name}</Text>
        {product.tags && product.tags.length > 0 && (
          <Text style={styles.meta}>{product.tags.join(' • ')}</Text>
        )}
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <AppButton
          label="Buy now"
          onPress={() => navigation.navigate('Cart')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    flex: 1.2,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '80%',
    height: '80%',
  },
  detailCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
    marginTop: -theme.spacing.lg,
  },
  name: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
  },
  meta: {
    marginTop: 4,
    color: theme.colors.textMuted,
  },
  price: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  muted: {
    color: theme.colors.textMuted,
  },
});
