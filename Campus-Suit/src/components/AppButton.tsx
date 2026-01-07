import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const AppButton: React.FC<Props> = ({ label, onPress, variant = 'primary', loading }) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        !isPrimary && !isOutline && styles.ghost
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            (isOutline || !isPrimary) && { color: theme.colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: theme.colors.primarySoft,
  },
  label: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: '#fff',
  },
});
