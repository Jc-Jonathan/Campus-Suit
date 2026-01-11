import React, { useState, useEffect } from 'react';
import { PickedFile } from '../../components/DocumentPickerButton';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { DocumentPickerButton } from '../../components/DocumentPickerButton';
import { theme } from '../../theme/theme';
import { API_URL } from '../../config';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type LoanApplyProps = NativeStackScreenProps<LoansStackParamList, 'LoanApply'>;

export const LoanApplyScreen: React.FC<LoanApplyProps> = ({ navigation, route }) => {
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
  const [idDocument, setIdDocument] = useState<PickedFile | null>(null);
  const [schoolIdDocument, setSchoolIdDocument] = useState<PickedFile | null>(null);
  const [agreementDocument, setAgreementDocument] = useState<PickedFile | null>(null);

  // Declaration checkboxes
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);

  // Signature
  const [signature, setSignature] = useState('');

  const [loading, setLoading] = useState(false);
  const [loanTitle, setLoanTitle] = useState('');
  const [loadingLoan, setLoadingLoan] = useState(true);
  const [emailError, setEmailError] = useState('');

  const submissionDate = new Date().toISOString().split('T')[0];

  // Fetch loan title on component mount
  useEffect(() => {
    const fetchLoanTitle = async () => {
      try {
        const { id } = route.params || {};
        if (!id) return;
        
        const response = await fetch(`${API_URL}/api/loans/loan/${id}`);
        if (!response.ok) throw new Error('Failed to fetch loan details');
        
        const data = await response.json();
        setLoanTitle(data.title || 'Loan');
      } catch (error) {
        console.error('Error fetching loan details:', error);
        setLoanTitle('Loan');
      } finally {
        setLoadingLoan(false);
      }
    };

    fetchLoanTitle();
  }, [route.params]);

   const canSubmit = confirmAccurate && agreeTerms && understandRisk;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validate email before submission
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      const formData = new FormData();
      
      // Add all form fields to formData
      formData.append('fullName', fullName);
      formData.append('dob', dob);
      formData.append('gender', gender);
      formData.append('phone', phone);
      formData.append('email', email);
      if (studentId) formData.append('studentId', studentId);
      formData.append('program', program);
      formData.append('yearOfStudy', yearOfStudy);
      formData.append('loanTitle', loanTitle);
      formData.append('amount', amount);
      formData.append('purpose', purpose);
      if (signature) formData.append('signature', signature);
      formData.append('confirmAccurate', confirmAccurate.toString());
      formData.append('agreeTerms', agreeTerms.toString());
      formData.append('understandRisk', understandRisk.toString());

      // Append files if they exist
      if (idDocument) {
        formData.append('idDocument', {
          uri: idDocument.uri,
          type: idDocument.type || 'application/octet-stream',
          name: idDocument.name || 'idDocument.jpg'
        } as any);
      }

      if (schoolIdDocument) {
        formData.append('schoolIdDocument', {
          uri: schoolIdDocument.uri,
          type: schoolIdDocument.type || 'application/octet-stream',
          name: schoolIdDocument.name || 'schoolIdDocument.jpg'
        } as any);
      }

      if (agreementDocument) {
        formData.append('agreementDocument', {
          uri: agreementDocument.uri,
          type: agreementDocument.type || 'application/pdf',
          name: agreementDocument.name || 'agreementDocument.pdf'
        } as any);
      }

      const response = await fetch(`${API_URL}/api/loanApplys`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      Alert.alert(
        'Application Submitted',
        'Your loan application has been submitted successfully!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('LoanStatus', { id: data.loanId || '' })
        }]
      );
    } catch (error) {
  console.error('Error submitting application:', error);
  const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
  Alert.alert('Error', errorMessage);
} finally {
  setLoading(false);
}
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
      {!loadingLoan && (
        <Text style={styles.applyTitle}>
          Applying for: <Text style={styles.loanTitle}>{loanTitle}</Text>
        </Text>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal information</Text>
        <AppInput 
        label="Full name" 
        placeholder='Enter Your Full Name'
        value={fullName} onChangeText={setFullName}
         />

        <AppInput
          label="Date of birth"
          value={dob}
          placeholder="YYYY-MM-DD"
          onFocus={() => setShowDobPicker(true)}
        />
        <AppInput 
        label="Gender" 
        placeholder='Enter Your Gender'
        value={gender} onChangeText={setGender} />
        <AppInput
          label="Phone number"
          placeholder='Enter your Phone Number'
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />
        <AppInput
          label="Email address"
          placeholder='Enter your Email'
          required={true}
          value={email}
          keyboardType="email-address"
          onChangeText={handleEmailChange}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <AppInput
          label="Student ID (if applicable)"
          placeholder='Enter your Student ID'
          value={studentId}
          onChangeText={setStudentId}
        />

        {/* Academic Information */}
        <Text style={styles.sectionTitle}>Academic information</Text>
        <AppInput
          label="Program of study"
          placeholder='Enter your Program of study'
          value={program}
          onChangeText={setProgram}
        />
        <AppInput
          label="Year of study"
          placeholder='Enter your Year of study'
          value={yearOfStudy}
          onChangeText={setYearOfStudy}
        />

        {/* Loan Details */}
        <Text style={styles.sectionTitle}>Loan details</Text>
        <AppInput
          label="Loan amount requested"
          placeholder='Enter your Loan amount requested'
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <AppInput
          label="Loan purpose (e.g. tuition, accommodation, emergency, books, transport)"
          placeholder='Enter your Loan purpose'
          value={purpose}
          multiline
          onChangeText={setPurpose}
        />

        {/* Required Documents */}
        <Text style={styles.sectionTitle}>Required documents</Text>
        <DocumentPickerButton 
          label="Upload Agreement Document" 
          onDocumentPicked={setAgreementDocument}
          value={agreementDocument?.name}
        />
        <DocumentPickerButton 
          label="National ID / Passport" 
          onDocumentPicked={setIdDocument}
          value={idDocument?.name}
        />
        <DocumentPickerButton 
          label="School ID" 
          onDocumentPicked={setSchoolIdDocument}
          value={schoolIdDocument?.name}
        />

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
  applyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: theme.spacing.lg,
  },
  loanTitle: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
});
