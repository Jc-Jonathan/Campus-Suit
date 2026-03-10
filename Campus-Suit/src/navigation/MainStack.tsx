import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { AdminStack } from './AdminStack';
import { AuthFlow } from './AuthFlow';
import { TabsFlow } from './TabsFlow';
import { useAuth } from '../contexts/AuthContext';

export type MainStackParamList = {
  Tabs: undefined;
  Admin: { userToken: string };
  AuthFlow: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  const { userToken } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsFlow} />
      {userToken ? (
        <Stack.Screen 
          name="Admin" 
          component={AdminStack} 
          initialParams={{ userToken }}
        />
      ) : (
        <Stack.Screen name="AuthFlow" component={AuthFlow} />
      )}
    </Stack.Navigator>
  );
};
