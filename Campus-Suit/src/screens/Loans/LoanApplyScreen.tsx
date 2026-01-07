import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { DocumentPickerButton } from '../../components/DocumentPickerButton';
import { theme } from '../../theme/theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type LoanApplyProps = NativeStackScreenProps<LoansStackParamList, 'LoanApply'>;

export const LoanApplyScreen: React.FC<LoanApplyProps> = ({ navigation }) => {
  // Personal information
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  // Academic information
  const [program, setProgram] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  // Loan details
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  // Declaration checkboxes
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);

  // Signature
  const [signature, setSignature] = useState('');

  const [loading, setLoading] = useState(false);

  const submissionDate = new Date().toISOString().split('T')[0];

   const canSubmit = confirmAccurate && agreeTerms && understandRisk;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Application submitted', 'Loan application submitted (mock).');
      navigation.navigate('LoanStatus');
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

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Loan application" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal information</Text>
        <AppInput label="Full name" value={fullName} onChangeText={setFullName} />
        <AppInput
          label="Date of birth"
          value={dob}
          placeholder="YYYY-MM-DD"
          onFocus={() => setShowDobPicker(true)}
        />
        <AppInput label="Gender" value={gender} onChangeText={setGender} />
        <AppInput
          label="Phone number"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />
        <AppInput
          label="Email address"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <AppInput
          label="Student ID (if applicable)"
          value={studentId}
          onChangeText={setStudentId}
        />

        {/* Academic Information */}
        <Text style={styles.sectionTitle}>Academic information</Text>
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

        {/* Loan Details */}
        <Text style={styles.sectionTitle}>Loan details</Text>
        <AppInput
          label="Loan amount requested"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <AppInput
          label="Loan purpose (e.g. tuition, accommodation, emergency, books, transport)"
          value={purpose}
          multiline
          onChangeText={setPurpose}
        />

        {/* Required Documents */}
        <Text style={styles.sectionTitle}>Required documents</Text>
        <DocumentPickerButton label="National ID / Passport" />
        <DocumentPickerButton label="School ID" />

        {/* Declaration */}
        <Text style={styles.sectionTitle}>Declaration</Text>
        <TouchableOpacity
          style={styles.declarationRow}
          activeOpacity={0.8}
          onPress={() => setConfirmAccurate(prev => !prev)}
        >
          <View style={[styles.checkbox, confirmAccurate && styles.checkboxChecked]} />
          <Text style={styles.declarationText}>
            I confirm the information I provided is accurate.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declarationRow}
          activeOpacity={0.8}
          onPress={() => setAgreeTerms(prev => !prev)}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]} />
          <Text style={styles.declarationText}>
            I agree to the loan terms and repayment schedule.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declarationRow}
          activeOpacity={0.8}
          onPress={() => setUnderstandRisk(prev => !prev)}
        >
          <View style={[styles.checkbox, understandRisk && styles.checkboxChecked]} />
          <Text style={styles.declarationText}>
            I understand that providing false information may result in rejection.
          </Text>
        </TouchableOpacity>

        {/* Signature & Submission */}
        <Text style={styles.sectionTitle}>Signature & submission</Text>
        <AppInput
          label="Digital signature (optional)"
          value={signature}
          onChangeText={setSignature}
          placeholder="Type your full name"
        />
        <Text style={styles.submissionDate}>Submission date: {submissionDate}</Text>

        <AppButton
          label="Submit application"
          onPress={canSubmit ? handleSubmit : () => {}}
          loading={loading}
        />
      </ScrollView>
      {showDobPicker && (
        <DateTimePicker
          value={dobDate ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDobChange}
        />
      )}
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
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  declarationText: {
    flex: 1,
    color: theme.colors.text,
  },
  submissionDate: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.textMuted,
  },
});
