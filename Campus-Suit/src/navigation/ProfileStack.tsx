import React, { useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import NotificationScreen from '../screens/Common/NotificationsScreen';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { PasswordUpdateScreen } from '../screens/Auth/PasswordUpdate';
import { useAuth } from '../contexts/AuthContext';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Search: undefined;
  Notifications: undefined;
  SignIn: undefined;
  Cart : undefined;
  SignUp: undefined;
  PasswordUpdate: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  const auth = useAuth();
  
  // Handle the case when auth is null (context not provided)
  if (auth === null) {
    return null; // or return a loading spinner/placeholder
  }

  const { user } = auth;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in
        <>
          <Stack.Screen name="ProfileHome" component={ProfileScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
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
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="PasswordUpdate" component={PasswordUpdateScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
