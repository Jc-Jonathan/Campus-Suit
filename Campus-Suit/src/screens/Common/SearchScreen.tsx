import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

export const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Implement search functionality here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  title: { fontSize: 22, fontWeight: '700', marginBottom: theme.spacing.sm, color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted },
});
