import React, { useState, useEffect } from 'react';
import { PickedFile } from '../../components/DocumentPickerButton';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, Platform, Modal, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { HeaderTab } from '../../components/Header';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { DocumentPickerButton } from '../../components/DocumentPickerButton';
import { theme } from '../../theme/theme';
import { API_URL } from '../../config';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { uploadLoanDocumentToCloudinary, UploadedLoanDocument } from '../../utils/uploadLoanDocuments';

export type LoanApplyProps = NativeStackScreenProps<LoansStackParamList, 'LoanApply'>;

export const LoanApplyScreen: React.FC<LoanApplyProps> = ({ navigation, route }) => {
  const { userId, loading: authLoading } = useAuth();
  const { createLoanApplicationNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

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
  const [idDocument, setIdDocument] = useState<UploadedLoanDocument | null>(null);
  const [schoolIdDocument, setSchoolIdDocument] = useState<UploadedLoanDocument | null>(null);
  const [agreementDocument, setAgreementDocument] = useState<UploadedLoanDocument | null>(null);
  const [uploadingIdDocument, setUploadingIdDocument] = useState(false);
  const [uploadingSchoolIdDocument, setUploadingSchoolIdDocument] = useState(false);
  const [uploadingAgreementDocument, setUploadingAgreementDocument] = useState(false);
  const [idDocumentError, setIdDocumentError] = useState(false);
  const [schoolIdDocumentError, setSchoolIdDocumentError] = useState(false);
  const [agreementDocumentError, setAgreementDocumentError] = useState(false);

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
  const [homeAddress, setHomeAddress] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [addressText, setAddressText] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanDetails, setLoanDetails] = useState<any>(null);

  const submissionDate = new Date().toISOString().split('T')[0];

  // Function to handle document upload to Cloudinary
  const handleDocumentUpload = async (
    file: PickedFile | null,
    setUploader: (doc: UploadedLoanDocument | null) => void,
    setUploading: (loading: boolean) => void,
    documentType: string,
    setError: (error: boolean) => void
  ) => {
    if (!file || loading) return;

    try {
      setUploading(true);
      setError(false);
      const uploadedFile: UploadedLoanDocument = {
        uri: file.uri,
        name: file.name,
        type: file.type || 'application/pdf',
        size: file.size || 0,
      };

      const cloudinaryFile = await uploadLoanDocumentToCloudinary(uploadedFile);
      setUploader(cloudinaryFile);
      console.log(`✅ ${documentType} uploaded to Cloudinary:`, cloudinaryFile.cloudinaryUrl);
    } catch (error) {
      console.error(`❌ Failed to upload ${documentType}:`, error);
      setError(true);
      // Don't set the document on failure - keep it null so "No document selected" shows
      Alert.alert('Upload Error', `Failed to upload ${documentType}. Please check your internet connection and try again.`);
    } finally {
      setUploading(false);
    }
  };

  // Individual document upload handlers are now inline in the JSX

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
        setLoanDetails(data);
        setRepaymentPeriod(data.repaymentPeriod || '');
        setInterestRate(data.interestRate?.toString() || '');
      } catch (error) {
        console.error('Error fetching loan details:', error);
        setLoanTitle('Loan');
      } finally {
        setLoadingLoan(false);
      }
    };

    fetchLoanTitle();
  }, [route.params]);
    
useEffect(() => {
  if (authLoading) return; // Wait for auth restore
  if (!userId) return;

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setProfileError(null);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/me/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');

      const user = await res.json();
      console.log('Fetched user profile:', user);

      // Update form fields with user data
      setEmail(user.email || '');
      // Combine country code with phone number if both exist
      const formattedPhone = user.phoneNumber 
        ? `${user.phoneCode || ''} ${user.phoneNumber}`.trim()
        : '';
      setPhone(formattedPhone);
      setFullName(user.fullName || '');
      setGender(user.gender || '');
      
      // Format and set date of birth if available
      if (user.dob) {
        const formattedDob = new Date(user.dob).toISOString().split('T')[0];
        setDob(formattedDob);
        setDobDate(new Date(user.dob));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setProfileError('Failed to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserProfile();
}, [userId, authLoading]);


   const canSubmit = confirmAccurate && agreeTerms && understandRisk;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  

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
        const address = `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country || ''} ${postalCode || ''}`.trim();
        setAddressText(address);
        setHomeAddress(address);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    }
  };

  const handleMapRegionChange = async (region: any) => {
    const newLocation = {
      coords: {
        latitude: region.latitude,
        longitude: region.longitude,
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
      const address = `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${region ? region + ', ' : ''}${country || ''} ${postalCode || ''}`.trim();
      setAddressText(address);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validate required fields
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!homeAddress?.trim()) {
      Alert.alert('Validation Error', 'Please enter your home address');
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
      formData.append('homeAddress', homeAddress);
      formData.append('program', program);
      formData.append('yearOfStudy', yearOfStudy);
      formData.append('loanTitle', loanTitle);
      formData.append('amount', amount);
      formData.append('repaymentPeriod', repaymentPeriod);
      formData.append('interestRate', interestRate);
      formData.append('purpose', purpose);
      if (signature) formData.append('signature', signature);
      formData.append('confirmAccurate', confirmAccurate.toString());
      formData.append('agreeTerms', agreeTerms.toString());
      formData.append('understandRisk', understandRisk.toString());

      // Append Cloudinary URLs if documents were uploaded
      if (idDocument && idDocument.cloudinaryUrl) {
        console.log('📤 Sending National ID URL:', idDocument.cloudinaryUrl);
        formData.append('idDocumentUrl', idDocument.cloudinaryUrl);
        formData.append('idDocumentPublicId', idDocument.publicId || '');
      } else {
        console.log('⚠️ No National ID document uploaded');
      }

      if (schoolIdDocument && schoolIdDocument.cloudinaryUrl) {
        console.log('📤 Sending School ID URL:', schoolIdDocument.cloudinaryUrl);
        formData.append('schoolIdDocumentUrl', schoolIdDocument.cloudinaryUrl);
        formData.append('schoolIdDocumentPublicId', schoolIdDocument.publicId || '');
      } else {
        console.log('⚠️ No School ID document uploaded');
      }

      if (agreementDocument && agreementDocument.cloudinaryUrl) {
        console.log('📤 Sending Agreement URL:', agreementDocument.cloudinaryUrl);
        formData.append('agreementDocumentUrl', agreementDocument.cloudinaryUrl);
        formData.append('agreementDocumentPublicId', agreementDocument.publicId || '');
      } else {
        console.log('⚠️ No Agreement document uploaded');
      }

      console.log('📋 About to send loan application with Cloudinary URLs');

      const response = await fetch(`${API_URL}/api/loanApplys`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with the correct boundary
        headers: {
          'Accept': 'application/json',
        },
      });


      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
      }

      // Create loan application notification after successful submission
      await createLoanApplicationNotification(
        fullName,
        email,
        loanTitle,
        amount,
        interestRate
      );

      Alert.alert(
        'Application Submitted',
        'Your loan application has been submitted successfully!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('LoanStatus', { id: data.loanId || '' })
        }]
      );
    } catch (error: unknown) {
      let errorMessage = 'Failed to submit application. Please check your internet connection and try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        errorMessage = error.message || errorMessage;
      }

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response: { data: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      }

      Alert.alert('Error', errorMessage
      );
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
           value={isLoading ? 'Loading...' : (phone || 'Not provided')}
           editable={false}
           placeholder="Loading..."
         />
       
         <AppInput
           label="Email address"
           value={email}
           editable={false}
           placeholder="Loading..."
         />

         
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

<View style={styles.addressContainer}>
          <View style={styles.addressInputWrapper}>
            <AppInput
              label="Home address"
              placeholder="Enter your home address"
              value={homeAddress}
              multiline
              onChangeText={setHomeAddress}
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
                  onRegionChangeComplete={handleMapRegionChange}
                  showsUserLocation={true}
                  followsUserLocation={true}
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
            
            <View style={styles.modalFooter}>
              <AppButton
                label="Confirm Location"
                onPress={() => {
                  setHomeAddress(addressText);
                  setLocationModalVisible(false);
                }}
                disabled={!location}
              />
            </View>
          </View>
        </Modal>


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
          label="Repayment period"
          placeholder="e.g. 6 months"
          value={repaymentPeriod}
          editable={false}
          />

        <AppInput
          label="Interest Rate"
          placeholder="Interest rate"
          value={interestRate ? `${interestRate}% APR` : ''}
          editable={false}
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
        <View>
          <DocumentPickerButton 
            label="Upload Agreement Document" 
            onDocumentPicked={(file) => handleDocumentUpload(file, setAgreementDocument, setUploadingAgreementDocument, 'Agreement Document', setAgreementDocumentError)}
            value={agreementDocument?.name}
            loading={uploadingAgreementDocument}
          />
          {agreementDocumentError && (
            <Text style={styles.errorText}>Please add Agreement Document</Text>
          )}
        </View>
        <View>
          <DocumentPickerButton 
            label="National ID / Passport" 
            onDocumentPicked={(file) => handleDocumentUpload(file, setIdDocument, setUploadingIdDocument, 'National ID', setIdDocumentError)}
            value={idDocument?.name}
            loading={uploadingIdDocument}
          />
          {idDocumentError && (
            <Text style={styles.errorText}>Please add National ID / Passport</Text>
          )}
        </View>
        <View>
          <DocumentPickerButton 
            label="School ID" 
            onDocumentPicked={(file) => handleDocumentUpload(file, setSchoolIdDocument, setUploadingSchoolIdDocument, 'School ID', setSchoolIdDocumentError)}
            value={schoolIdDocument?.name}
            loading={uploadingSchoolIdDocument}
          />
          {schoolIdDocumentError && (
            <Text style={styles.errorText}>Please add School ID</Text>
          )}
        </View>

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
  // Location picker styles
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
  locationButton: {
    marginTop:20,
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
  },
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
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
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
  modalFooter: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
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
