import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScholarshipsStackParamList } from '../../navigation/ScholarshipsStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { DocumentPickerButton } from '../../components/DocumentPickerButton';
import { theme } from '../../theme/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export type ScholarshipApplyProps = NativeStackScreenProps<
  ScholarshipsStackParamList,
  'ScholarshipApply'
>;

export const ScholarshipApplyScreen: React.FC<ScholarshipApplyProps> = ({ navigation, route }) => {
  const { scholarshipId } = route.params;
  const [scholarshipTitle, setScholarshipTitle] = useState('');
  const [loadingScholarship, setLoadingScholarship] = useState(true);


  // Get current location function
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Get address from coordinates
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const { street, city, region, country, postalCode } = geocode[0];
        const address = `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country || ''} ${postalCode || ''}`;
        setAddressText(address);
        setAddress(address);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  // Handle map press to select location
  const handleMapPress = async (e: any) => {
    const newLocation = {
      coords: {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    setLocation(newLocation);
    
    // Get address from coordinates
    const geocode = await Location.reverseGeocodeAsync({
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
    });

    if (geocode.length > 0) {
      const { street, city, region, country, postalCode } = geocode[0];
      const address = `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country || ''} ${postalCode || ''}`;
      setAddressText(address);
    }
  };

  // Fetch scholarship details
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const res = await fetch(
          `http://192.168.31.130:5000/api/scholarships/${scholarshipId}` 
        );
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error('Failed to load scholarship');
        }

        setScholarshipTitle(json.data.title);
      } catch (error) {
        Alert.alert('Error', 'Failed to load scholarship details');
        navigation.goBack();
      } finally {
        setLoadingScholarship(false);
      }
    };

    fetchScholarship();
  }, [scholarshipId, navigation]);
  // Applicant information
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('+');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [address, setAddress] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [addressText, setAddressText] = useState('');
  const { user } = useAuth();
  
  // Auto-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Academic information
  const [studentId, setStudentId] = useState('');
  const [institution, setInstitution] = useState('');
  const [program, setProgram] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [expectedGraduation, setExpectedGraduation] = useState('');
  const [expectedGradDate, setExpectedGradDate] = useState<Date | null>(null);
  const [showExpectedGradPicker, setShowExpectedGradPicker] = useState(false);
  const [gpa, setGpa] = useState('');

  // Scholarship details
  const [scholarshipName, setScholarshipName] = useState(scholarshipTitle);
  const [appliedBefore, setAppliedBefore] = useState('');
  const [reason, setReason] = useState('');
  const [financialNeed, setFinancialNeed] = useState('');

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const validateEmail = (email: string) => {
    // More comprehensive email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+\.[^\s@]+$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailTouched) {
      if (!text) {
        setEmailError('Email is required');
      } else if (!validateEmail(text)) {
        setEmailError('Please enter a valid email address (e.g., example@domain.com)');
      } else {
        setEmailError('');
      }
    }
  };
  
  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email) {
      const errorMsg = 'Email is required';
      setEmailError(errorMsg);
      Alert.alert('Validation Error', errorMsg);
    } else if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address (e.g., example@domain.com)';
      setEmailError(errorMsg);
      Alert.alert('Invalid Email', errorMsg);
    } else {
      setEmailError('');
    }
  };

  interface PickedFile {
  uri: string;
  name: string;
  type: string | null;
  size: number;
  data:FormData;
}
  
  // Document states
  const [documents, setDocuments] = useState({
    nationalId: null as PickedFile | null,
    transcript: null as PickedFile | null,
    recommendation: null as PickedFile | null,
    enrollmentProof: null as PickedFile | null,
    other: null as PickedFile | null,
  });

  const handleDocumentPicked = (type: keyof typeof documents) => (file: { uri: string; name: string; type: string | null; size: number } | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    // Validate all required fields including email
    setEmailTouched(true);
    if (!email) {
      const errorMsg = 'Email is required';
      setEmailError(errorMsg);
      Alert.alert('Validation Error', errorMsg);
      return;
    } else if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address (e.g., example@domain.com)';
      setEmailError(errorMsg);
      Alert.alert('Invalid Email', errorMsg);
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();

      // Append text fields
      formData.append('fullName', fullName);
      if (dobDate) formData.append('dob', dobDate.toISOString().split('T')[0]);
      formData.append('gender', gender);
      formData.append('email', email);
      formData.append('country', country);
      formData.append('countryCode', countryCode);
      formData.append('phoneLocal', phoneLocal);
      formData.append('address', address);
      formData.append('studentId', studentId);
      formData.append('institution', institution);
      formData.append('program', program);
      formData.append('yearOfStudy', yearOfStudy);
      formData.append('gpa', gpa);
      formData.append('scholarshipName', scholarshipName);
      formData.append('appliedBefore', appliedBefore);
      formData.append('reason', reason);
      formData.append('financialNeed', financialNeed);
      formData.append('scholarshipId', scholarshipId);
      formData.append('scholarshipTitle', scholarshipTitle);

      // Append files if they exist
      if (documents.nationalId) {
        formData.append('nationalId', {
          uri: documents.nationalId.uri,
          type: documents.nationalId.type || 'application/octet-stream',
          name: documents.nationalId.name || 'nationalId.jpg'
        } as any);
      }

      if (documents.transcript) {
        formData.append('transcript', {
          uri: documents.transcript.uri,
          type: documents.transcript.type || 'application/pdf',
          name: documents.transcript.name || 'transcript.pdf'
        } as any);
      }

      if (documents.recommendation) {
        formData.append('recommendation', {
          uri: documents.recommendation.uri,
          type: documents.recommendation.type || 'application/pdf',
          name: documents.recommendation.name || 'recommendation.pdf'
        } as any);
      }

      if (documents.enrollmentProof) {
        formData.append('enrollmentProof', {
          uri: documents.enrollmentProof.uri,
          type: documents.enrollmentProof.type || 'application/pdf',
          name: documents.enrollmentProof.name || 'enrollmentProof.pdf'
        } as any);
      }

      if (documents.other) {
        formData.append('other', {
          uri: documents.other.uri,
          type: documents.other.type || 'application/octet-stream',
          name: documents.other.name || 'other_document.pdf'
        } as any);
      }

      const response = await fetch('http://192.168.31.130:5000/api/scholarshipApplications', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit application');
      }

      Alert.alert('Success', 'Your application has been submitted successfully!');
      navigation.goBack();
    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ScholarshipStatus');
    }, 800);
  };

  const handleDobChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDobPicker(false);
      return;
    }

    const currentDate = selectedDate ?? dobDate ?? new Date();
    setDobDate(currentDate);
    const formatted = currentDate.toISOString().split('T')[0];
    setDob(formatted);
    if (Platform.OS !== 'ios') {
      setShowDobPicker(false);
    }
  };

  const handleExpectedGradChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowExpectedGradPicker(false);
      return;
    }

    const currentDate = selectedDate ?? expectedGradDate ?? new Date();
    setExpectedGradDate(currentDate);
    const formatted = currentDate.toISOString().split('T')[0];
    setExpectedGraduation(formatted);
    if (Platform.OS !== 'ios') {
      setShowExpectedGradPicker(false);
    }
  };

  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);

  const FALLBACK_COUNTRIES: { name: string; code: string }[] = [
    { name: 'Zimbabwe', code: '+263' },
    { name: 'South Africa', code: '+27' },
    { name: 'Botswana', code: '+267' },
    { name: 'Zambia', code: '+260' },
    { name: 'Kenya', code: '+254' },
    { name: 'Nigeria', code: '+234' },
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'Canada', code: '+1' },
    { name: 'India', code: '+91' },
    { name: 'Australia', code: '+61' },
  ];

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd');
        const data: any[] = await res.json();
        const mapped = data
          .map(item => {
            const name = item?.name?.common as string | undefined;
            const root = item?.idd?.root as string | undefined; // e.g. "+"
            const suffixes = item?.idd?.suffixes as string[] | undefined; // e.g. ["263"]
            if (!name || !root || !suffixes || suffixes.length === 0) return null;
            return { name, code: `${root}${suffixes[0]}` };
          })
          .filter(Boolean) as { name: string; code: string }[];

        // Sort alphabetically by name
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch (e) {
        // On failure, fall back to the small static list
        setCountries(FALLBACK_COUNTRIES);
      }
    };

    loadCountries();
  }, []);

  const handleSelectCountry = (name: string, code: string) => {
    setCountry(name);
    setCountryCode(code);
    setCountryPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Apply" subtitle="Scholarship application" />
      <ScrollView contentContainerStyle={styles.content}>
        {!loadingScholarship && (
          <Text style={styles.applyTitle}>
            Applying for: {scholarshipTitle}
          </Text>
        )}
        {/* Applicant Information */}
        <Text style={styles.sectionTitle}>Applicant Information</Text>
        <AppInput label="Full name" value={fullName} onChangeText={setFullName} />
        <Text style={styles.fieldLabel}>Country</Text>
        <TouchableOpacity
          style={styles.dateField}
          activeOpacity={0.8}
          onPress={() => setCountryPickerVisible(true)}
        >
          <Text style={country ? styles.dateValue : styles.datePlaceholder}>
            {country || 'Select country'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.fieldLabel}>Date of birth</Text>
        <TouchableOpacity
          style={styles.dateField}
          activeOpacity={0.8}
          onPress={() => setShowDobPicker(true)}
        >
          <Text style={dob ? styles.dateValue : styles.datePlaceholder}>
            {dob || 'Select date'}
          </Text>
        </TouchableOpacity>
        <AppInput label="Gender" value={gender} onChangeText={setGender} />
        <View style={styles.inputContainer}>
          <AppInput
            label="Email address"
            value={user?.email || email}
            keyboardType="email-address"
            placeholder='Enter your email'
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            editable={!user?.email} // Make field read-only if user is logged in
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
        <Text style={styles.fieldLabel}>Phone number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.phonePrefix}>
            <Text style={styles.phonePrefixText}>{countryCode}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={phoneLocal}
            onChangeText={setPhoneLocal}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
        <View style={styles.addressContainer}>
          <View style={styles.addressInputWrapper}>
            <AppInput
              label="Home address"
              value={address}
              multiline
              onChangeText={setAddress}
              style={{ width: '100%' }}
            />
          </View>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => {
              setLocationModalVisible(true);
              getCurrentLocation();
            }}
          >
            <Ionicons name="location" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Academic Information */}
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <AppInput
          label="Student ID (if any)"
          value={studentId}
          onChangeText={setStudentId}
        />
        <AppInput
          label="Current institution"
          value={institution}
          onChangeText={setInstitution}
        />
        <AppInput
          label="Program of study"
          value={program}
          onChangeText={setProgram}
        />
        <AppInput
          label="Year of study"
          value={yearOfStudy}
          onChangeText={setYearOfStudy}
        />
        <Text style={styles.fieldLabel}>Expected graduation date</Text>
        <TouchableOpacity
          style={styles.dateField}
          activeOpacity={0.8}
          onPress={() => setShowExpectedGradPicker(true)}
        >
          <Text style={expectedGraduation ? styles.dateValue : styles.datePlaceholder}>
            {expectedGraduation || 'Select date'}
          </Text>
        </TouchableOpacity>
        <AppInput
          label="Current GPA / average"
          value={gpa}
          keyboardType="decimal-pad"
          onChangeText={setGpa}
        />

        {/* Scholarship Details */}
        <Text style={styles.sectionTitle}>Scholarship Details</Text>
        <AppInput
          label="Scholarship applying for"
          value={scholarshipName}
          onChangeText={setScholarshipName}
        />
        <AppInput
          label="Have you applied before? (Yes/No)"
          value={appliedBefore}
          onChangeText={setAppliedBefore}
        />
        <AppInput
          label="Reason for applying"
          value={reason}
          multiline
          onChangeText={setReason}
        />
        <AppInput
          label="Financial need / purpose (short paragraph)"
          value={financialNeed}
          multiline
          onChangeText={setFinancialNeed}
        />

        {/* Supporting Documents */}
        <Text style={styles.sectionTitle}>Supporting Documents</Text>
        <DocumentPickerButton 
          label="National ID / Passport" 
          onDocumentPicked={handleDocumentPicked('nationalId')}
          value={documents.nationalId?.name}
        />
        <DocumentPickerButton 
          label="Academic transcript / results" 
          onDocumentPicked={handleDocumentPicked('transcript')}
          value={documents.transcript?.name}
        />
        <DocumentPickerButton 
          label="Recommendation letter" 
          onDocumentPicked={handleDocumentPicked('recommendation')}
          value={documents.recommendation?.name}
        />
        <DocumentPickerButton 
          label="Proof of enrollment" 
          onDocumentPicked={handleDocumentPicked('enrollmentProof')}
          value={documents.enrollmentProof?.name}
        />
        <DocumentPickerButton 
          label="Any other required document" 
          onDocumentPicked={handleDocumentPicked('other')}
          value={documents.other?.name}
        />

        <AppButton label="Submit application" onPress={handleSubmit} loading={loading} />
      </ScrollView>
      {showDobPicker && (
        <DateTimePicker
          value={dobDate ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDobChange}
        />
      )}
      {showExpectedGradPicker && (
        <DateTimePicker
          value={expectedGradDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleExpectedGradChange}
        />
      )}
      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={styles.countryModalBackdrop}>
          <View style={styles.countryModalContent}>
            <Text style={styles.countryModalTitle}>Select country</Text>
            <ScrollView>
              {(countries.length ? countries : FALLBACK_COUNTRIES).map(c => (
                <TouchableOpacity
                  key={c.name}
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(c.name, c.code)}
                >
                  <Text style={styles.countryItemText}>{c.name} ({c.code})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AppButton label="Close" variant="ghost" onPress={() => setCountryPickerVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Location</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                />
              </MapView>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.addressPreview}>
            <Text style={styles.addressLabel}>Selected Address:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {addressText || 'No address selected'}
            </Text>
          </View>
          
          <View style={styles.modalButtons}>
            <AppButton
              label="Use Current Location"
              onPress={getCurrentLocation}
              variant="outline"
              // Remove icon prop as it's not supported by AppButton
              style={styles.locationIconButton}
            />
            <AppButton
              label="Confirm Location"
              onPress={() => {
                setAddress(addressText);
                setLocationModalVisible(false);
              }}
              disabled={!location}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  // Location picker styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  locationButton: {
    marginTop: 20,
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
  },
inputContainer: {
  marginBottom: theme.spacing.md, // or whatever spacing you prefer
  width: '200%',
},
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
  },
  addressPreview: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  addressLabel: {
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
  addressText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  modalButtons: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  addressInputWrapper: {
    flex: 1,
    marginRight: 10,
  },
  locationIconButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  applyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  fieldLabel: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dateField: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  datePlaceholder: {
    color: theme.colors.textMuted,
  },
  dateValue: {
    color: theme.colors.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  phonePrefix: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  phonePrefixText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  countryModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryModalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  countryModalTitle: {
    fontWeight: '600',
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  countryItem: {
    paddingVertical: theme.spacing.sm,
  },
  countryItemText: {
    color: theme.colors.text,
  },
});

export default ScholarshipApplyScreen;
