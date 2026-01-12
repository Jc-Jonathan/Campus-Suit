import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Country } from 'country-state-city';
import { theme } from '../../theme/theme';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';



export const SignUpScreen = () => {
  const countries = Country.getAllCountries();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [country, setCountry] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCountryChange = (isoCode: string) => {
    const selectedCountry = countries.find(
      (c) => c.isoCode === isoCode
    );

    if (selectedCountry) {
      setCountry(selectedCountry.name);
      setPhoneCode(`+${selectedCountry.phonecode}`);
    }
  };

  const handleSignUp = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !country ||
      !phoneNumber
    ) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://192.168.31.130:5000/api/auth/signup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            country,
            phoneCode,
            phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Signup Failed', data.message);
        return;
      }

      Alert.alert('Signup Success', ` You have successfully created an account`);

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setCountry('');
      setPhoneCode('');
    } catch {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
      <Text style={styles.title}>Create an account</Text>

      <View style={styles.form}>
        <AppInput label="Full Name" value={name} onChangeText={setName} />

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.countryContainer}>
          <Text style={styles.label}>Country</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={country}
              onValueChange={(isoCode) => handleCountryChange(isoCode)}
              style={styles.picker}
              dropdownIconColor="#666"
            >
              <Picker.Item 
                label="Select your country" 
                value="" 
                style={styles.pickerItem}
              />
              {countries.map((c) => (
                <Picker.Item
                  key={c.isoCode}
                  label={c.name}
                  value={c.isoCode}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.phoneRow}>
          <View style={styles.codeContainer}>
            <Text style={styles.inputLabel}>Code</Text>
            <View style={styles.codeInput}>
              <Text style={styles.codeText}>{phoneCode}</Text>
            </View>
          </View>
          <View style={styles.phoneContainer}>
            <AppInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

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

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <AppButton label="Sign Up" onPress={handleSignUp} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.title,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    fontWeight: '600',
  },
  countryContainer: {
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  codeContainer: {
    flex: 1,
    marginBottom: 16, // Match the label height of AppInput
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    height: 20, // Ensure consistent label height
  },
  codeInput: {
    height: 40, // Match the height of AppInput
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  codeText: {
    fontSize: 16,
    color: '#333',
  },
  phoneContainer: {
    flex: 2.5,
    marginBottom: 4, // Match the label height
  },
});
