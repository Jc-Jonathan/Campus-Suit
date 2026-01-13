// Update MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ScholarshipsStack } from '../navigation/ScholarshipsStack';
import { LoansStack } from '../navigation/LoansStack';
import { StoreStack } from '../navigation/StoreStack';
import { ProfileStack } from '../navigation/ProfileStack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { theme } from '../theme/theme';
import { Platform } from 'react-native';

export type MainTabsParamList = {
  Home: undefined;
  HomeScholarships: undefined;
  Store: undefined;
  Finance: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 0,
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'HomeScholarships') iconName = 'school-outline';
          if (route.name === 'Store') iconName = 'cart-outline';
          if (route.name === 'Finance') iconName = 'card-outline';
          if (route.name === 'Profile') iconName = 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="HomeScholarships"
        component={ScholarshipsStack}
        options={{ title: 'Scholarships' }}
      />
      <Tab.Screen name="Store" component={StoreStack} />
      <Tab.Screen name="Finance" component={LoansStack} options={{ title: 'Loan' }} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};