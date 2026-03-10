import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';

export type AuthFlowParamList = {
  Auth: undefined;
  // Add other auth-related screens here if needed
};

const Stack = createNativeStackNavigator<AuthFlowParamList>();

export const AuthFlow = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthStack} />
  </Stack.Navigator>
);
