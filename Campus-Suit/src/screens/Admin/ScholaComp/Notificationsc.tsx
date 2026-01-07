// src/screens/Admin/screens/Notifications/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
});

export const Notificationsc: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {/* Add your notifications content here */}
      <Text>Notifications content will be displayed here</Text>
    </View>
  );
};