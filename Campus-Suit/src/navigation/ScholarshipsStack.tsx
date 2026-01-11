import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScholarshipListScreen } from '../screens/Scholarships/ScholarshipListScreen';
import { ScholarshipDetailScreen } from '../screens/Scholarships/ScholarshipDetailScreen';
import { ScholarshipApplyScreen } from '../screens/Scholarships/ScholarshipApplyScreen';
import { ScholarshipStatusScreen } from '../screens/Scholarships/ScholarshipStatusScreen';
import { SearchScreen } from '../screens/Common/SearchScreen';
import { NotificationsScreen } from '../screens/Common/NotificationsScreen';
import Applicant from '../screens/Admin/ScholaComp/Applicant';
import ApplicantDetail from '../screens/Admin/ScholaComp/ApplicantDetail';
import Admission from '../screens/Admin/ScholaComp/Admission';

export type ScholarshipsStackParamList = {
  ScholarshipList: undefined;
  ScholarshipDetail: { id: string };
  ScholarshipApply: { 
    scholarshipId: string;
    scholarshipTitle?: string;
  };
  ScholarshipStatus: undefined;
  Search: undefined;
  Notifications: undefined;
  Applicants: undefined;
  ApplicantDetail: undefined;
  Admission: undefined;
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
    <Stack.Screen 
      name="Applicants" 
      component={Applicant} 
      options={{ title: 'Applicants' }}
    />
    <Stack.Screen 
      name="ApplicantDetail" 
      component={ApplicantDetail} 
      options={{ title: 'Applicant Details' }}
    />
    <Stack.Screen 
      name="Admission" 
      component={Admission} 
      options={{ title: 'Admission' }}
    />
  </Stack.Navigator>
);
