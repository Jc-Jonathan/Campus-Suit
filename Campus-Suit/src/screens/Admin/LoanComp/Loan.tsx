import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentPickerAsset } from 'expo-document-picker';
import { theme } from '../../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

type DocumentResult = DocumentPickerAsset | null;

const API_URL = 'http://192.168.31.130:5000/api/loans';

export const Loan = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [document, setDocument] = useState<DocumentResult>(null);
  const [isUploading, setIsUploading] = useState(false);
 const [repaymentValue, setRepaymentValue] = useState('');
const [repaymentUnit, setRepaymentUnit] = useState<'SECOND' |'MINUTE' |'HOUR' |'DAY' |'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
  const [eligibility, setEligibility] = useState('');
  const [documents, setDocuments] = useState('');
  const [deadline, setDeadline] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [benefits, setBenefits] = useState('');

  // 🔽 ADDED STATES
  const [loans, setLoans] = useState<any[]>([]);
  const [editingLoanId, setEditingLoanId] = useState<number | null>(null);

  // 🔽 FETCH LOANS
  const fetchLoans = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Ensure data is an array before setting it to state
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      Alert.alert('Error', 'Failed to load loans');
      setLoans([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setDocument(result.assets[0]);
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

 const handleSubmit = async () => {
  if (!document) {
    Alert.alert('Error', 'Please upload a document');
    return;
  }

  if (
    !title ||
    !description ||
    !minAmount ||
    !maxAmount ||
    !interestRate ||
    !repaymentValue ||
    !repaymentUnit
  ) {
    Alert.alert('Missing Fields', 'Please fill all required fields');
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    const repaymentPeriod = `${repaymentValue} ${repaymentUnit.toLowerCase()}${Number(repaymentValue) > 1 ? 's' : ''}`;
    // Append all form fields
    formData.append('title', title);
    formData.append('description', description);
    formData.append('minAmount', minAmount);
    formData.append('maxAmount', maxAmount);
    formData.append('interestRate', interestRate);
    formData.append('repaymentPeriod', repaymentPeriod);

    if (eligibility) formData.append('eligibility', eligibility);
    if (documents) formData.append('requiredDocuments', documents);
    if (deadline) formData.append('applicationDeadline', deadline);
    if (processingTime) formData.append('processingTime', processingTime);
    if (benefits) formData.append('benefits', benefits);

    // Append the document
    if (document) {
      // Create a file object for the document
      const file = {
        uri: document.uri,
        type: document.mimeType || 'application/octet-stream',
        name: document.name || 'document',
      } as any;

      formData.append('document', file);
    }

    const url = editingLoanId ? `${API_URL}/${editingLoanId}` : API_URL;
    const method = editingLoanId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      body: formData,
      // Don't set Content-Type header - let the browser set it with the correct boundary
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save loan');
    }

    Alert.alert(
      'Success',
      editingLoanId ? 'Loan updated successfully' : 'Loan added successfully'
    );

    // Reset form
    setTitle('');
    setDescription('');
    setMinAmount('');
    setMaxAmount('');
    setInterestRate('');
    setRepaymentValue('');
    setRepaymentUnit('MONTH');
    setEligibility('');
    setDocuments('');
    setDeadline('');
    setProcessingTime('');
    setBenefits('');
    setDocument(null);
    setEditingLoanId(null);
    
    // Refresh the loans list
    fetchLoans();
  } catch (error) {
    console.error('Error saving loan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save loan';
  Alert.alert('Error', errorMessage);
  } finally {
    setIsUploading(false);
  }
};

  // 🔽 EDIT LOAN
  const handleEdit = (loan: any) => {
    setEditingLoanId(loan.loanId);
    setTitle(loan.title);
    setDescription(loan.description);
    setMinAmount(String(loan.minAmount));
    setMaxAmount(String(loan.maxAmount));
    setInterestRate(String(loan.interestRate));
   const [value, unit] = loan.repaymentPeriod.split(' ');
   setRepaymentValue(value);
    setRepaymentUnit(unit.toUpperCase());
    setEligibility(loan.eligibility || '');
    setDocuments(loan.requiredDocuments || '');
    setDeadline(loan.applicationDeadline || '');
    setProcessingTime(loan.processingTime || '');
    setBenefits(loan.benefits || '');
  };

  // 🔽 DELETE LOAN
  const handleDelete = (loanId: number) => {
    Alert.alert('Confirm', 'Delete this loan?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_URL}/${loanId}`, { method: 'DELETE' });
          fetchLoans();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>
        {editingLoanId ? 'Edit Loan' : 'Add New Loan'}
      </Text>

      {/* ================= FORM (UNCHANGED) ================= */}
      {/* LOAN DETAILS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Loan Details</Text>

        <TextInput
          placeholder="Loan Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Loan Description"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Min Amount"
            style={[styles.input1, styles.halfInput]}
            keyboardType="numeric"
            value={minAmount}
            onChangeText={setMinAmount}
          />
          <TextInput
            placeholder="Max Amount"
            style={[styles.input1, styles.halfInput]}
            keyboardType="numeric"
            value={maxAmount}
            onChangeText={setMaxAmount}
          />
        </View>

        <TextInput
          placeholder="Interest Rate (%)"
          style={styles.input1}
          keyboardType="numeric"
          value={interestRate}
          onChangeText={setInterestRate}
        />

        <View style={styles.repaymentRow}>
  <TextInput
    placeholder="Number"
    style={[styles.input, styles.repaymentNumber]}
    keyboardType="numeric"
    value={repaymentValue}
    onChangeText={setRepaymentValue}
  />

  <View style={styles.repaymentPicker}>
    <Picker
      selectedValue={repaymentUnit}
      onValueChange={(itemValue) => {
        try {
          console.log('Picker value changed:', itemValue);
          if (itemValue) {
            setRepaymentUnit(itemValue);
          }
        } catch (error) {
          console.error('Picker error:', error);
        }
      }}
    >
      <Picker.Item label="Seconds" value="SECOND" />
      <Picker.Item label="Minutes" value="MINUTE" />
      <Picker.Item label="Hours" value="HOUR" />
      <Picker.Item label="Days" value="DAY" />
      <Picker.Item label="Weeks" value="WEEK" />
      <Picker.Item label="Months" value="MONTH" />
      <Picker.Item label="Years" value="YEAR" />
    </Picker>
  </View>

      </View>

      </View>

      {/* ELIGIBILITY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Eligibility</Text>

        <TextInput
          placeholder="Who can apply?"
          style={styles.input}
          value={eligibility}
          onChangeText={setEligibility}
        />

        <TextInput
          placeholder="Required Documents"
          style={[styles.input, styles.textArea]}
          value={documents}
          onChangeText={setDocuments}
          multiline
        />
      </View>

      {/* APPLICATION INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Application Info</Text>

        <View>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Text style={{ color: deadline ? '#000' : '#A0AEC0' }}>
              {deadline || 'Select Application Deadline'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={deadline ? new Date(deadline) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDeadline(format(selectedDate, 'yyyy-MM-dd'));
                }
              }}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          )}
        </View>

        <TextInput
          placeholder="Processing Time (e.g.48 hours)"
          style={styles.input}
          value={processingTime}
          onChangeText={setProcessingTime}
        />
      </View>

      {/* BENEFITS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Loan Benefits</Text>

        <TextInput
          placeholder="Benefits (e.g. No collateral, Fast approval)"
          style={[styles.input, styles.textArea]}
          value={benefits}
          onChangeText={setBenefits}
          multiline
        />
      </View>

      {/* DOCUMENT UPLOAD */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Document Upload</Text>

        <TouchableOpacity
          style={styles.documentButton}
          onPress={pickDocument}
        >
          <Ionicons name="cloud-upload-outline" size={22} color="#2C3E50" />
          <Text style={styles.documentButtonText}>
            {document?.name || 'Upload Document'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUBMIT BUTTON */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.submitText}>
          {editingLoanId ? 'Update Loan' : 'Add Loan'}
        </Text>
      </TouchableOpacity>

      {/* ================= AVAILABLE LOANS ================= */}
      <Text style={[styles.screenTitle, { marginTop: 30 }]}>
        Available Loans
      </Text>

      {loans.map(loan => (
        <View key={loan.loanId} style={styles.card}>
          <Text style={{ fontWeight: '700' }}>{loan.title}</Text>
          <Text>{loan.description}</Text>
          <Text>
            Amount: {loan.minAmount} - {loan.maxAmount}
          </Text>
          <Text>Interest: {loan.interestRate}%</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => handleEdit(loan)}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(loan.loanId)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 16,
    minWidth: '100%',
    marginLeft: -15,
    marginRight: -15,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2C3E50',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: '120%',
    marginLeft: -15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#34495E',
  },

  input: {
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  datePicker: {
    width: '100%',
    backgroundColor: 'white',
  },
  input1: {
    backgroundColor: '#F2F4F7',
    minWidth: '100%',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  halfInput: {
    width: '48%',
  },

  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  repaymentRow: {
  flexDirection: 'row',
  gap: 10,
},

repaymentNumber: {
  flex: 1,
},

repaymentPicker: {
  flex: 1,
  minWidth:15,
  backgroundColor: '#F2F4F7',
  borderRadius: 5,
  marginBottom:20,
  justifyContent: 'center',
},

picker: {
  height: 50,
  width: '100%',
  backgroundColor: '#F2F4F7',
},

pickerItem: {
  height: 50,
  fontSize: 14,
  color: '#333',
},

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primarySoft,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: theme.colors.primarySoft,
  },
  documentButtonText: {
    marginLeft: 10,
    color: theme.colors.text,
  },
  // 🔹 ADDED STYLES (ONLY NEW)
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editBtn: { backgroundColor: '#27AE60' },
  deleteBtn: { backgroundColor: '#E74C3C' },
  actionText: { color: '#fff', fontWeight: '600' },
});
