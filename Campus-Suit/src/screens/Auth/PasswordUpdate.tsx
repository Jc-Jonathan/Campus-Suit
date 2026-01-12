import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { theme } from '../../theme/theme';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';

export const PasswordUpdateScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      await fetch('http://192.168.31.130:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      Alert.alert(
        'Check your email',
        'A password reset link has been sent to your Gmail.',
        [
          {
            text: 'Open Gmail',
            onPress: () => Linking.openURL('mailto:'),
          },
          { text: 'OK' },
        ]
      );

      setEmail('');
    } catch {
      Alert.alert('Error', 'Server not reachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we’ll send you a link to reset your password.
      </Text>

      <AppInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppButton
        label="Send Reset Link"
        onPress={handleResetPassword}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
});
