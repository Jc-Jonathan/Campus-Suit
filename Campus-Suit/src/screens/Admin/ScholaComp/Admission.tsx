// src/screens/Admin/screens/Admissions/index.tsx
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

export const Admission: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admissions</Text>
      {/* Add your admissions content here */}
      <Text>Admissions content will be displayed here</Text>
    </View>
  );
};