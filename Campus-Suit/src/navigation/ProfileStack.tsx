import React, { useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';
import { SettingsScreen } from '../screens/Profile/SettingsScreen';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { PasswordUpdateScreen } from '../screens/Auth/PasswordUpdate';
import { useAuth } from '../contexts/AuthContext';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  SignIn: undefined;
  SignUp: undefined;
  PasswordUpdate: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in
        <>
          <Stack.Screen name="ProfileHome" component={ProfileScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="PasswordUpdate" component={PasswordUpdateScreen} />
        </>
      ) : (
        // User is not signed in
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ProfileHome" component={ProfileScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PasswordUpdate" component={PasswordUpdateScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
