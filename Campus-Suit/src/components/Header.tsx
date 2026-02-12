import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { MainTabsParamList } from '../navigation/MainTabs';
import { useNotifications } from '../contexts/NotificationContext';

type HeaderNavigationProp = NativeStackNavigationProp<MainTabsParamList>;

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBackButton?: boolean;
}


export const HeaderTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Show notifications for all users including admins (for shop notifications)
  const shouldShowNotifications = user;
  
  // Hide cart count for admin users (guest users should see cart count)
  const shouldShowCartCount = !user?.isAdmin;

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

  const goToCart = () => {
    navigation.navigate('Store' as never, { screen: 'Cart' } as never);
  };

  return (
    <>
      <View style={headerTabStyles.container}>
        <TouchableOpacity style={headerTabStyles.left} onPress={openMenu}>
          <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={headerTabStyles.right}>
          <TouchableOpacity onPress={goToCart} style={headerTabStyles.cartContainer}>
            <Ionicons name="cart-outline" size={22} color={theme.colors.text} />
            {shouldShowCartCount && cart.length > 0 && (
              <View style={headerTabStyles.cartBadge}>
                <Text style={headerTabStyles.cartBadgeText}>
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNotifications} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            {shouldShowNotifications && unreadCount > 0 && (
              <View style={headerTabStyles.notificationBadge}>
                <Text style={headerTabStyles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
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
  cartContainer: {
    position: 'relative',
    marginRight: 20,
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: "#ea4f4fff",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { 
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
