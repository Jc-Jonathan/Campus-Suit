import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StoreHomeScreen } from '../screens/Store/StoreHomeScreen';
import { ProductDetailScreen } from '../screens/Store/ProductDetailScreen';
import { CartScreen } from '../screens/Store/CartScreen';
import { CheckoutScreen } from '../screens/Store/CheckoutScreen';
import { TrackingScreen } from '../screens/Store/TrackingScreen';
import { OrderDisplay } from '../screens/Store/OrderDisplay';
import { OrderStatusScreen } from '../screens/Store/OrderStatusScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import NotificationScreen from '../screens/Common/NotificationsScreen';
import { OrderDetailshow } from '../screens/Admin/ProductsComp/OrderDetailshow';

export type StoreStackParamList = {
  StoreHome: undefined;
  ProductDetail: { productId: number};
  Cart: undefined;
  Checkout: { cartItems: any[], totalPrice: number, source?: 'cart' | 'product' };
  Tracking: { orderId?: number };
  OrderDisplay: undefined;
  OrderDetailshow: { orderId: number };
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
    <Stack.Screen name="Tracking" component={TrackingScreen} />
    <Stack.Screen name="OrderDisplay" component={OrderDisplay} />
    <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationScreen} />
    <Stack.Screen name="OrderDetailshow" component={OrderDetailshow} />
  </Stack.Navigator>
);
