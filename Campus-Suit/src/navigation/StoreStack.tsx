import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StoreHomeScreen } from '../screens/Store/StoreHomeScreen';
import { ProductDetailScreen } from '../screens/Store/ProductDetailScreen';
import { CartScreen } from '../screens/Store/CartScreen';
import { CheckoutScreen } from '../screens/Store/CheckoutScreen';
import { OrderStatusScreen } from '../screens/Store/OrderStatusScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';

export type StoreStackParamList = {
  StoreHome: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderStatus: { id?: string } | undefined;
  Search: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

export const StoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
