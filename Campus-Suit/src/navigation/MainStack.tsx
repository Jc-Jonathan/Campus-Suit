import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { AdminStack } from './AdminStack';

export type MainStackParamList = {
  Tabs: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabs} />
    <Stack.Screen name="Admin" component={AdminStack} />
  </Stack.Navigator>
);
