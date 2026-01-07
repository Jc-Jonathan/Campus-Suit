import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { useAppData } from '../../contexts/AppDataContext';
import { StoreStackParamList } from '../../navigation/StoreStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.lg * 2 - CARD_MARGIN * 2) / 2;

type Nav = NativeStackNavigationProp<StoreStackParamList, 'StoreHome'>;

export const StoreHomeScreen: React.FC = () => {
  const { products } = useAppData();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <HeaderTab />
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>All products</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
          >
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <AppButton
                label="Buy now"
                onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.md,
    marginRight: CARD_MARGIN,
    marginLeft: CARD_MARGIN,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  image: {
    width: '100%',
    height: 110,
  },
  cardBody: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
});
