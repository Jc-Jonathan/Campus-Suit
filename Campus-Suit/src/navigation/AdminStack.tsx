import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboard } from '../screens/Admin/AdminDashboard';
import { AdminScholarships } from '../screens/Admin/AdminScholarships';
import { AdminLoans } from '../screens/Admin/AdminLoans';
import { AdminProducts } from '../screens/Admin/AdminProducts';
import { AdminOrders } from '../screens/Admin/AdminOrders';
import { AdminUsers } from '../screens/Admin/AdminUsers';
import { AdminNotification } from '../screens/Admin/AdminNotification';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminScholarships: undefined;
  AdminLoans: undefined;
  AdminProducts: undefined;
  AdminOrders: undefined;
  AdminUsers: undefined;
  AdminNotification: undefined;
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
  </Stack.Navigator>
);
