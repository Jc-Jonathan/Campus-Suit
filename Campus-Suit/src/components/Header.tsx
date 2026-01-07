import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const Header: React.FC<Props> = ({ title, subtitle, right }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {right}
        <Ionicons name="school-outline" size={22} color={theme.colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 2,
    color: theme.colors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});

export const HeaderTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const navigateToProfileHome = () => {
    navigation.navigate('Profile' as never, { screen: 'ProfileHome' } as never);
    closeMenu();
  };

  const navigateToSignUp = () => {
    navigation.navigate('Profile' as never, { screen: 'SignUp' } as never);
    closeMenu();
  };
  
  const navigateToSignIn = () => {
    navigation.navigate('Profile' as never, { screen: 'SignIn' } as never);
    closeMenu();
  };

  const navigateToSettings = () => {
    navigation.navigate('Profile' as never, { screen: 'Settings' } as never);
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const goToSearch = () => {
    navigation.navigate('Profile' as never, { screen: 'Search' } as never);
  };

  const goToNotifications = () => {
    navigation.navigate('Profile' as never, { screen: 'Notifications' } as never);
  };

  return (
    <>
      <View style={headerTabStyles.container}>
        <TouchableOpacity style={headerTabStyles.left} onPress={openMenu}>
          <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={headerTabStyles.right}>
          <TouchableOpacity onPress={goToSearch}>
            <Ionicons name="search-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNotifications}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {menuOpen && (
        <View style={headerTabStyles.menuOverlay}>
          <TouchableOpacity
            style={headerTabStyles.backdrop}
            activeOpacity={1}
            onPress={closeMenu}
          />
          <View style={headerTabStyles.menuContainer}>
            <Text style={headerTabStyles.menuTitle}>Account</Text>
            <TouchableOpacity style={headerTabStyles.menuItem} onPress={navigateToSignIn}>
              <View style={headerTabStyles.menuItemRow}>
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={headerTabStyles.menuItemText}>Sign In</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={headerTabStyles.menuItem} onPress={navigateToSignUp}>
              <View style={headerTabStyles.menuItemRow}>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={headerTabStyles.menuItemText}>Sign Up</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={headerTabStyles.menuItem} onPress={navigateToProfileHome}>
              <View style={headerTabStyles.menuItemRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={headerTabStyles.menuItemText}>Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={headerTabStyles.menuItem} onPress={navigateToSettings}>
              <View style={headerTabStyles.menuItemRow}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={headerTabStyles.menuItemText}>Settings</Text>
              </View>
            </TouchableOpacity>
            <View style={headerTabStyles.menuDivider} />
            <TouchableOpacity style={headerTabStyles.menuItem} onPress={handleLogout}>
              <View style={headerTabStyles.menuItemRow}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.colors.danger}
                />
                <Text style={[headerTabStyles.menuItemText, { color: theme.colors.danger }]}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const headerTabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    width: 260,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'flex-start',
    zIndex: 101,
    ...theme.shadows.card,
  },
  menuTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    paddingVertical: theme.spacing.sm,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  menuItemText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});
