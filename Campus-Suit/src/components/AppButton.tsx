import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  View, 
  StyleProp 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

interface Props {
  /** Button label text */
  label?: string;
  /** Function called when button is pressed */
  onPress: () => void;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Show loading indicator */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Optional left icon name (from Ionicons) */
  leftIcon?: string;
  /** Size of the icon */
  iconSize?: number;
  /** Color of the icon */
  iconColor?: string;
  /** Custom content to render inside the button */
  children?: ReactNode;
}

export const AppButton: React.FC<Props> = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  loading, 
  disabled,
  style,
  textStyle,
  leftIcon,
  iconSize = 20,
  iconColor,
  children
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const variantStyles: { [key in ButtonVariant]: ViewStyle } = {
    primary: styles.primary,
    outline: styles.outline,
    ghost: styles.ghost,
  };

  const buttonStyles: StyleProp<ViewStyle> = [
    styles.base,
    variantStyles[variant],
    style,
    (disabled || loading) && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
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
          {children || (
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
          )}
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
