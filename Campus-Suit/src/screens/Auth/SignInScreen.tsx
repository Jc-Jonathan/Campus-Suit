import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';

interface ApiResponse {
  userId?: number;
  email?: string;
  role?: string;
  message?: string;
  token?: string;
}

export const SignInScreen = () => {
  const auth = useAuth();
  const navigation = useNavigation<any>();
  
  if (!auth) {
    // This should never happen if the app is properly wrapped with AuthProvider
    throw new Error('Auth context is not available');
  }
  
  const { loginAsStudent, loginAsAdmin } = auth;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userLoading, setUserLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // 🔹 USER LOGIN (UNCHANGED)
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
        console.log('Login response:', data); // Add logging to debug
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

      if (!data.token) {
        Alert.alert('Error', 'Authentication token not received');
        return;
      }

      // The backend returns userId, email, and token
      // We'll use userId as a string for mongoId since the actual _id isn't returned
      // Consider updating the backend to return the _id field for better security
      await loginAsStudent(data.userId.toString(), data.userId, data.email!, data.token!);
      setPassword('');

      // Navigate to the Profile tab after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs', params: { screen: 'Profile' } }],
      });
    } catch {
      Alert.alert('Error', 'Server not reachable. Please check your connection and try again.');
      setPassword('');
    } finally {
      setUserLoading(false);
    }
  };

  // 🔹 ADMIN LOGIN (FIXED)
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

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Access Denied', data.message || 'Admin login failed');
      setPassword('');
      return;
    }

    // Show success message and navigate on OK press
    Alert.alert('Success', 'Admin login successful!', [
      {
        text: 'OK',
        onPress: async () => {
          if (!data.token) {
            Alert.alert('Error', 'No authentication token received');
            return;
          }
          await loginAsAdmin(email, data.token);
          // Navigate to the admin dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'Admin' }],
          });
        },
      },
    ]);
    
    setPassword('');

  } catch (error) {
    console.error('Admin login error:', error);
    Alert.alert('Error', 'Server not reachable');
    setPassword('');
  } finally {
    setAdminLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
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

            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.linkText}>Sign Up!!!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('PasswordUpdate')}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
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
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: '500',
    padding: 8,
  },
});
