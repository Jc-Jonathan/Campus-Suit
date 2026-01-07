import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, Platform, Modal, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScholarshipsStackParamList } from '../../navigation/ScholarshipsStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { DocumentPickerButton } from '../../components/DocumentPickerButton';
import { theme } from '../../theme/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type ScholarshipApplyProps = NativeStackScreenProps<
  ScholarshipsStackParamList,
  'ScholarshipApply'
>;

export const ScholarshipApplyScreen: React.FC<ScholarshipApplyProps> = ({ navigation }) => {
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
  const [address, setAddress] = useState('');

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
  const [scholarshipName, setScholarshipName] = useState('');
  const [appliedBefore, setAppliedBefore] = useState('');
  const [reason, setReason] = useState('');
  const [financialNeed, setFinancialNeed] = useState('');

  const [loading, setLoading] = useState(false);

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
    
    setLoading(true);
    
    try {
      const formData = new FormData();

      // Add text fields
      const applicationData = {
        fullName,
        dob,
        country,
        countryCode,
        phoneLocal,
        gender,
        email,
        address,
        studentId,
        institution,
        program,
        yearOfStudy,
        expectedGraduation,
        gpa,
        scholarshipName,
        appliedBefore,
        reason,
        financialNeed,
      };

      // Append text fields
      Object.entries(applicationData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append files if they exist using the FormData from the document
      if (documents.nationalId) {
        // Get the file from the FormData and append it directly
        const file = documents.nationalId.data.get('file');
        if (file) {
          formData.append('nationalId', file);
        }
      }

      if (documents.transcript) {
        const file = documents.transcript.data.get('file');
        if (file) {
          formData.append('transcript', file);
        }
      }

      if (documents.recommendation) {
        const file = documents.recommendation.data.get('file');
        if (file) {
          formData.append('recommendation', file);
        }
      }

      if (documents.enrollmentProof) {
        formData.append('enrollmentProof', {
          uri: documents.enrollmentProof.uri,
          name: documents.enrollmentProof.name,
          type: documents.enrollmentProof.type || 'application/octet-stream',
        } as any);
      }

      if (documents.other) {
        formData.append('other', {
          uri: documents.other.uri,
          name: documents.other.name,
          type: documents.other.type || 'application/octet-stream',
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
      Alert.alert('Application submitted', 'This is a mocked submission.');
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
        <AppInput
          label="Email address"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
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
        <AppInput
          label="Home address"
          value={address}
          multiline
          onChangeText={setAddress}
        />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
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
