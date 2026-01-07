import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface Props {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<Props> = ({ title, description }) => (
  <View style={styles.container}>
    <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.textMuted} />
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
  },
  description: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
});
