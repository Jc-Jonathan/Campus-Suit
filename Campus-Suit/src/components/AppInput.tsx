import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme/theme';

interface Props extends TextInputProps {
  label?: string;
  required?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const AppInput: React.FC<Props> = ({ 
  label, 
  style, 
  rightIcon, 
  onRightIconPress, 
  ...rest 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style, !rightIcon && { width: '100%' }]}
          placeholderTextColor={theme.colors.textMuted}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconContainer}>
            <Ionicons name={rightIcon} size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
});
