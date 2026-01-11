// components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return theme.colors.accent;
      case 'rejected':
        return theme.colors.danger;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View 
      style={[
        styles.badge,
        { backgroundColor: `${getStatusColor()}20` } // 20 is for 12% opacity
      ]}
    >
      <Text 
        style={[
          styles.text,
          { color: getStatusColor() }
        ]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});