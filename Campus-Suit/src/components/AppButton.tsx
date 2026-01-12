import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: any; // You might want to use Text['style'] from react-native for better type safety
  leftIcon?: string;
  iconSize?: number;
  iconColor?: string;
}

export const AppButton: React.FC<Props> = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  loading, 
  style,
  textStyle,
  leftIcon,
  iconSize = 20,
  iconColor
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        !isPrimary && !isOutline && styles.ghost,
        style
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.primary} />
      ) : (
        <View style={styles.content}>
          {leftIcon && (
            <Ionicons 
              name={leftIcon as any} 
              size={iconSize} 
              color={iconColor || (isPrimary ? '#fff' : theme.colors.primary)}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.label,
              (isOutline || !isPrimary) && { color: theme.colors.primary },
              leftIcon && { marginLeft: 8 },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: '#fff',
  },
});
