import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AdminOrders: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Orders</Text>
      <Text>Manage orders here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
