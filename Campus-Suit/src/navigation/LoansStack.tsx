import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoanListScreen } from '../screens/Loans/LoanListScreen';
import { LoanDetailScreen } from '../screens/Loans/LoanDetailScreen';
import { LoanApplyScreen } from '../screens/Loans/LoanApplyScreen';
import { LoanStatusScreen } from '../screens/Loans/LoanStatusScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';

export type LoansStackParamList = {
  LoanList: undefined;
  LoanDetail: { id: string };
  LoanApply: { id: string };
  LoanStatus: undefined;
  Search: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<LoansStackParamList>();

export const LoansStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoanList" component={LoanListScreen} />
    <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    <Stack.Screen name="LoanApply" component={LoanApplyScreen} />
    <Stack.Screen name="LoanStatus" component={LoanStatusScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
