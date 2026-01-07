import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AdminUsers: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Users</Text>
      <Text>Manage users here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
