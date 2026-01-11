import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoanListScreen } from '../screens/Loans/LoanListScreen';
import { LoanDetailScreen } from '../screens/Loans/LoanDetailScreen';
import { LoanApplyScreen } from '../screens/Loans/LoanApplyScreen';
import { LoanStatusScreen } from '../screens/Loans/LoanStatusScreen';

// In LoansStack.tsx
export type LoansStackParamList = {
  LoanList: undefined;
  LoanDetail: { 
    id: string;
    product?: {
      id: string;
      name: string;
      rate: number;
      maxAmount: number;
      description: string;
    };
  };
  LoanApply: { id: string };
  LoanStatus: { id?: string };
};

const Stack = createNativeStackNavigator<LoansStackParamList>();

export const LoansStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoanList">
    <Stack.Screen name="LoanList" component={LoanListScreen} />
    <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    <Stack.Screen name="LoanApply" component={LoanApplyScreen} />
    <Stack.Screen name="LoanStatus" component={LoanStatusScreen} />
  </Stack.Navigator>
);
