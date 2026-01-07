import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScholarshipListScreen } from '../screens/Scholarships/ScholarshipListScreen';
import { ScholarshipDetailScreen } from '../screens/Scholarships/ScholarshipDetailScreen';
import { ScholarshipApplyScreen } from '../screens/Scholarships/ScholarshipApplyScreen';
import { ScholarshipStatusScreen } from '../screens/Scholarships/ScholarshipStatusScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';

export type ScholarshipsStackParamList = {
  ScholarshipList: undefined;
  ScholarshipDetail: { id: string };
  ScholarshipApply: { id: string };
  ScholarshipStatus: undefined;
  Search: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<ScholarshipsStackParamList>();

export const ScholarshipsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScholarshipList" component={ScholarshipListScreen} />
    <Stack.Screen name="ScholarshipDetail" component={ScholarshipDetailScreen} />
    <Stack.Screen name="ScholarshipApply" component={ScholarshipApplyScreen} />
    <Stack.Screen name="ScholarshipStatus" component={ScholarshipStatusScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
