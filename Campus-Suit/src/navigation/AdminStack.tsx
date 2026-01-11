import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboard } from '../screens/Admin/AdminDashboard';
import { AdminScholarships } from '../screens/Admin/AdminScholarships';
import { AdminLoans } from '../screens/Admin/AdminLoans';
import { AdminProducts } from '../screens/Admin/AdminProducts';
import { AdminOrders } from '../screens/Admin/AdminOrders';
import { AdminUsers } from '../screens/Admin/AdminUsers';
import { AdminNotification } from '../screens/Admin/AdminNotification';
import ApplicantDetail from '../screens/Admin/ScholaComp/ApplicantDetail';
import { Loan } from '../screens/Admin/LoanComp/Loan';
import { LoanApplicant } from '../screens/Admin/LoanComp/LoanApplicant';
import { LoanApplicantDetail } from '../screens/Admin/LoanComp/LoanApplicantDEtail';
import { LoanState } from '../screens/Admin/LoanComp/LoanState';
import { LoanNotification } from '../screens/Admin/LoanComp/LoanNotification';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminScholarships: undefined;
  AdminLoans: undefined;
  AdminProducts: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminNotification: undefined;
  ApplicantDetail: { id: string };
  // Admin Loan Management
  AdminLoan: undefined;
  LoanApplicant: { id: string };
  LoanApplicantDetail: { application: any };
  LoanState: { id: string };
  LoanNotification: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminScholarships" component={AdminScholarships} />
    <Stack.Screen name="AdminLoans" component={AdminLoans} />
    <Stack.Screen name="AdminProducts" component={AdminProducts} />
    <Stack.Screen name="AdminOrders" component={AdminOrders} />
    <Stack.Screen name="AdminUsers" component={AdminUsers} />
    <Stack.Screen name="AdminNotification" component={AdminNotification} />
    <Stack.Screen name="ApplicantDetail" component={ApplicantDetail} />
    
    {/* Admin Loan Management */}
    <Stack.Screen name="AdminLoan" component={Loan} />
    <Stack.Screen name="LoanApplicant" component={LoanApplicant} />
    <Stack.Screen 
      name="LoanApplicantDetail" 
      component={LoanApplicantDetail} 
      options={{ title: 'Application Details' }}
    />
    <Stack.Screen name="LoanState" component={LoanState} />
    <Stack.Screen name="LoanNotification" component={LoanNotification} />
  </Stack.Navigator>
);
