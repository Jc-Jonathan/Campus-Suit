import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';

export const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // 🔹 added

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true); // 🔹 start loading

    try {
      const response = await fetch('http://192.168.31.130:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 🔹 backend error (like "User already exists")
        Alert.alert('Signup Failed', data.message || 'Something went wrong');
        return;
      }

      // 🔹 success popup
      Alert.alert('Success', 'You successfully signed up');

      // 🔹 optional: clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false); // 🔹 stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>Fill in your details to sign up.</Text>

      <View style={styles.form}>
        <AppInput label="Full Name" value={name} onChangeText={setName} />
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.actions}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <AppButton label="Sign Up" onPress={handleSignUp} />
          )}
        </View>
      </View>
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
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
});
