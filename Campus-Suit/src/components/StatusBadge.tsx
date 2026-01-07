import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const normalized = status.toLowerCase();
  let backgroundColor = theme.colors.primarySoft;
  let color = theme.colors.primary;

  if (['approved', 'delivered', 'shipped'].includes(normalized)) {
    backgroundColor = '#DCFCE7';
    color = theme.colors.accent;
  } else if (['rejected', 'cancelled'].includes(normalized)) {
    backgroundColor = '#FEE2E2';
    color = theme.colors.danger;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}> 
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
});
