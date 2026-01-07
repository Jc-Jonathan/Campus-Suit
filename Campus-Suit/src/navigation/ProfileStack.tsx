import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';
import { SettingsScreen } from '../screens/Profile/SettingsScreen';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);
