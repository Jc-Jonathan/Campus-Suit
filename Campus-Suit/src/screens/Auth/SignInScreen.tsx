import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';

interface ApiResponse {
  message?: string;
  userId?: number;
  role?: string;
}

export const SignInScreen = () => {
  const { loginAsStudent, loginAsAdmin } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userLoading, setUserLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // 🔹 EMAIL VALIDATION
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // 🔹 USER LOGIN
  const handleSignInAsUser = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }
     
    setUserLoading(true);

    try {
      const response = await fetch(
        'http://192.168.31.130:5000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      let data: ApiResponse = {};
      try {
        data = await response.json();
      } catch {
        data = { message: 'Invalid server response' };
      }

      if (!response.ok) {
  Alert.alert('Login Failed', data.message || 'Login failed');
  setPassword('');
  return;
}

if (!data.userId) {
  Alert.alert('Error', 'User ID not returned from server');
  return;
}

await loginAsStudent(data.userId);
setPassword('');

Alert.alert('Success', 'You successfully signed in', [
  {
    text: 'OK',
    onPress: () => navigation.navigate('ProfileHome'),
  },
]);


    } catch {
      Alert.alert('Error', 'Server not reachable');
      setPassword('');
    } finally {
      setUserLoading(false);
    }
  };
  
  // 🔹 ADMIN LOGIN
  const handleSignInAsAdmin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    setAdminLoading(true);

    try {
      const response = await fetch(
        'http://192.168.31.130:5000/api/admin/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      let data: ApiResponse = {};
      try {
        data = await response.json();
      } catch {
        data = { message: 'Invalid server response' };
      }

      if (!data.userId) {
        Alert.alert('Login Error', data.message || 'User ID not returned from server');
        return;
      }

     await loginAsStudent(data.userId);

      if (!response.ok) {
  Alert.alert('Access Denied', data.message || 'Admin login failed');
  setPassword('');
  return;
}

if (!data.userId) {
  Alert.alert('Login Error', 'User ID not returned from server');
  return;
}

await loginAsStudent(data.userId);
loginAsAdmin();

setPassword('');

Alert.alert('Success', 'Admin signed in successfully', [
  {
    text: 'OK',
    onPress: () =>
      navigation.navigate('Admin' as never, {
        screen: 'AdminDashboard',
      } as never),
  },
]);

    } catch {
      Alert.alert('Error', 'Server not reachable');
      setPassword('');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>
        Enter your details and choose how you want to sign in.
      </Text>

      <View style={styles.form}>
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
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate('PasswordUpdate')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.buttonsRow}>
          <AppButton
            label="Sign in as User"
            onPress={handleSignInAsUser}
            loading={userLoading}
          />
          <AppButton
            label="Sign in as Admin"
            onPress={handleSignInAsAdmin}
            loading={adminLoading}
            variant="outline"
          />
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
  buttonsRow: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  showPassword: {
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: 4,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    padding: 8,
    marginRight: 4,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
