import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeaderTab } from '../../components/Header';
import { theme } from '../../theme/theme';

export const OrderStatusScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <HeaderTab />
      <View style={styles.content}>
        <Text style={styles.title}>Order Status</Text>
        <Text>Show order status here.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
