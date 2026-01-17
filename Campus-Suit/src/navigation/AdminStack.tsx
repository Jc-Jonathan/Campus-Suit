import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboard } from '../screens/Admin/AdminDashboard';
import { AdminScholarships } from '../screens/Admin/AdminScholarships';
import { AdminLoans } from '../screens/Admin/AdminLoans';
import { AdminProducts } from '../screens/Admin/AdminProducts';
import { AdminBanners } from '../screens/Admin/AdminBanners';
import { AdminUsers } from '../screens/Admin/AdminUsers';
import { AdminNotification } from '../screens/Admin/AdminNotification';
import ApplicantDetail from '../screens/Admin/ScholaComp/ApplicantDetail';
import { Loan } from '../screens/Admin/LoanComp/Loan';
import { LoanApplicant } from '../screens/Admin/LoanComp/LoanApplicant';
import { LoanApplicantDetail } from '../screens/Admin/LoanComp/LoanApplicantDEtail';
import { LoanState } from '../screens/Admin/LoanComp/LoanState';
import { LoanNotification } from '../screens/Admin/LoanComp/LoanNotification';
import { EditProduct } from '../screens/Admin/ProductsComp/EditProduct';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Make sure to export this type as it's imported in other files
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminScholarships: undefined;
  AdminLoans: undefined;
  AdminProducts: undefined;
  AdminBanners: undefined;
  AdminUsers: undefined;
  AdminNotification: undefined;
  ApplicantDetail: { id: string };
  // Admin Loan Management
  AdminLoan: undefined;
  LoanApplicant: { id: string };
  LoanApplicantDetail: { application: any };
  LoanState: { id: string };
  LoanNotification: undefined;
  // Products Management
  EditProduct: { 
    product: { 
      _id: string;
      productId: number;
      name: string;
      imageUrl: string;
      newPrice: number;
      oldPrice?: number;
      createdAt?: string;
      updatedAt?: string;
      __v?: number;
    } 
  };
};

// Export the Stack type for use in other components
export type AdminNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AdminStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const Stack = createNativeStackNavigator<AdminStackParamList>();
export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminScholarships" component={AdminScholarships} />
    <Stack.Screen name="AdminLoans" component={AdminLoans} />
    <Stack.Screen name="AdminProducts" component={AdminProducts} />
    <Stack.Screen name="AdminBanners" component={AdminBanners} />
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
    <Stack.Screen 
      name="EditProduct" 
      component={EditProduct} 
      options={{ title: 'Edit Product' }}
    />
  </Stack.Navigator>
);
