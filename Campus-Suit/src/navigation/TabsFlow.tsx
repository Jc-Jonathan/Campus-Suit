import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';

export type TabsFlowParamList = {
  MainTabsScreen: undefined;
  // Add other auth-related screens here if needed
};

const Stack = createNativeStackNavigator<TabsFlowParamList>();

export const TabsFlow = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabsScreen" component={MainTabs} />
  </Stack.Navigator>
);