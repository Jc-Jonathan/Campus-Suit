import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { AdminStack } from './AdminStack';
import { AuthFlow } from './AuthFlow';
import { TabsFlow } from './TabsFlow';

export type MainStackParamList = {
  Tabs: undefined;
  Admin: undefined;
  AuthFlow: undefined;
  // Add other screens that should be accessible from the root navigator
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabsFlow} />
    <Stack.Screen name="Admin" component={AdminStack} />
    <Stack.Screen name="AuthFlow" component={AuthFlow} />
  </Stack.Navigator>
);
