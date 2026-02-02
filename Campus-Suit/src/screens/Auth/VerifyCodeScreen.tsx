import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import type { MainStackParamList } from '../../navigation/MainStack';
import { CommonActions } from '@react-navigation/native';

export const VerifyCodeScreen = ({ route }: any) => {
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!code || !password) {
      Alert.alert('Error', 'All fields required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        'http://192.168.31.130:5000/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            code,
            newPassword: password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert('Success', 'Password reset successful');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>

      <AppInput
        label="6-digit Code"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <AppInput
        label="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <AppButton
        label="Reset Password"
        onPress={handleReset}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
});
