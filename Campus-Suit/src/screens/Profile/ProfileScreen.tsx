import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { Header, HeaderTab } from '../../components/Header';
import { theme } from '../../theme/theme';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Profile" subtitle="Manage your account" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.meta}>Role: {user?.role ?? 'not signed in'}</Text>
        </View>
        <AppButton label="Logout" onPress={logout} variant="outline" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  name: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
  },
  meta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
});
