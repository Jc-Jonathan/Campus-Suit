import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { PasswordUpdateScreen } from '../screens/Auth/PasswordUpdate';
import {VerifyCodeScreen} from '../screens/Auth/VerifyCodeScreen';
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  PasswordUpdate: undefined;
  VerifyCode: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="PasswordUpdate" component={PasswordUpdateScreen}/>
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen}/>
    </Stack.Navigator>
  );
};
