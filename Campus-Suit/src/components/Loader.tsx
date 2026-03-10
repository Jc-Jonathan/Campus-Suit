import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const Loader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
