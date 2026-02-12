import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadScholarshipFileToCloudinary, UploadedScholarshipFile } from '../../../utils/uploadScholarshipFile';

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/scholarships';

// Helper function to extract filename from URL
const extractFileName = (url: string): string => {
  if (!url) return 'Unknown file';
  
  // Remove query parameters and hash
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Extract filename from path
  const fileName = cleanUrl.split('/').pop();
  
  // If it's a Cloudinary URL, decode and clean it
  if (url.includes('cloudinary.com')) {
    try {
      const decoded = decodeURIComponent(fileName || '');
      // Remove Cloudinary folder structure and version numbers
      const parts = decoded.split('/');
      const actualFileName = parts[parts.length - 1];
      return actualFileName || fileName || 'Unknown file';
    } catch {
      return fileName || 'Unknown file';
    }
  }
  
  return fileName || 'Unknown file';
};

interface Scholarship {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  amount: number;
  percentage: number;
  courseFileUrl?: string;
  courseFilePublicId?: string;
}

export const Scholarship: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    amount: '',
    percentage: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [courseFile, setCourseFile] = useState<UploadedScholarshipFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // ✅ FIX IS HERE
      setScholarships(data.data);
    } catch {
      alert('Failed to load scholarships');
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        deadline: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  const pickDocument = async () => {
    if (uploadingFile) {
      Alert.alert('Please wait', 'File is already uploading');
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const uploadedFile: UploadedScholarshipFile = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || null,
        size: file.size || 0,
      };

      setUploadingFile(true);
      
      try {
        const cloudinaryFile = await uploadScholarshipFileToCloudinary(uploadedFile);
        console.log('📥 Cloudinary upload result:', cloudinaryFile);
        setCourseFile(cloudinaryFile);
        console.log('✅ courseFile state set to:', cloudinaryFile);
      } catch (error) {
        console.error('Upload failed:', error);
        setCourseFile(null);
        console.log('❌ courseFile state set to null due to error');
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleAddScholarship = async () => {
    console.log('🚀 Starting handleAddScholarship');
    console.log('📁 Current courseFile state:', courseFile);
    console.log('📝 Current formData:', formData);
    
    if (
      !formData.title ||
      !formData.description ||
      !formData.deadline ||
      !formData.amount ||
      !formData.percentage
    ) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('deadline', formData.deadline);
      form.append('amount', formData.amount);
      form.append('percentage', formData.percentage);

      console.log('📋 FormData created with basic fields');

      // Send Cloudinary URL if file was uploaded
      if (courseFile && courseFile.cloudinaryUrl) {
        console.log('📤 Sending Cloudinary URL:', courseFile.cloudinaryUrl);
        console.log('🆔 Sending Public ID:', courseFile.publicId);
        form.append('courseFileUrl', courseFile.cloudinaryUrl);
        form.append('courseFilePublicId', courseFile.publicId || '');
      } else {
        console.log('⚠️ No course file data to send');
        console.log('courseFile exists:', !!courseFile);
        console.log('courseFile.cloudinaryUrl exists:', !!(courseFile?.cloudinaryUrl));
      }

      console.log('📤 About to send request to:', editingId ? `${API_URL}/${editingId}` : `${API_URL}/add`);
      console.log('📋 FormData entries:');
      console.log('  title:', formData.title);
      console.log('  description:', formData.description);
      console.log('  deadline:', formData.deadline);
      console.log('  amount:', formData.amount);
      console.log('  percentage:', formData.percentage);
      console.log('  courseFileUrl:', courseFile?.cloudinaryUrl || 'none');
      console.log('  courseFilePublicId:', courseFile?.publicId || 'none');

      const res = await fetch(
        editingId ? `${API_URL}/${editingId}` : `${API_URL}/add`,
        {
          method: editingId ? 'PUT' : 'POST',
          body: form,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (!res.ok) throw new Error('Failed to save scholarship');

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Operation failed');
      }

      fetchScholarships();
      setEditingId(null);
      setCourseFile(null);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        amount: '',
        percentage: '',
      });
      
      Alert.alert('Success', editingId ? 'Scholarship updated successfully!' : 'Scholarship added successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      console.error(' Scholarship operation failed:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item: Scholarship) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      deadline: item.deadline,
      amount: item.amount.toString(),
      percentage: item.percentage.toString(),
    });
    // Reset course file state when editing
    setCourseFile(null);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Scholarship',
      'Are you sure you want to delete this scholarship?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Scholarship deleted successfully');
                fetchScholarships();
              } else {
                Alert.alert('Error', 'Failed to delete scholarship');
              }
            } catch (error) {
              console.error('Error deleting scholarship:', error);
              Alert.alert('Error', 'Failed to delete scholarship');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Scholarship' : 'Scholarship'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Scholarship Title"
              value={formData.title}
              onChangeText={text => handleInputChange('title', text)}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={formData.description}
              onChangeText={text => handleInputChange('description', text)}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formData.deadline || 'Select Deadline'}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={text => handleInputChange('amount', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Percentage (%)"
              keyboardType="numeric"
              value={formData.percentage}
              onChangeText={text => handleInputChange('percentage', text)}
            />

            <TouchableOpacity style={styles.input} onPress={pickDocument} disabled={uploadingFile}>
              <Text>
                {uploadingFile ? 'Uploading...' : (courseFile ? courseFile.name : 'Upload Course List (PDF)')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonsc, styles.primaryButton]}
              onPress={handleAddScholarship}
            >
              <Text style={styles.buttonText}>
                {editingId ? 'Update' : '+Scholarship'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.formTitle, { marginTop: 30 }]}>
            Scholarships
          </Text>

          {scholarships.map(item => (
            <View key={item._id} style={styles.formContainer}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text>Deadline: {item.deadline}</Text>

              {item.courseFileUrl && (
                <View style={styles.courseFileContainer}>
                  <View style={styles.courseFileInfo}>
                    <Text style={{ color: '#2980b9', marginTop: 5 }}>
                      📄 {extractFileName(item.courseFileUrl)}
                    </Text>
                    {item.courseFileUrl.includes('cloudinary.com') && (
                      <View style={styles.cloudinaryBadge}>
                        <Text style={styles.cloudinaryBadgeText}>☁️ Cloud</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.buttonscc,
                    { backgroundColor: '#3498db', marginRight: 10 },
                  ]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.buttonscc,
                    { backgroundColor: '#e74c3c' },
                  ]}
                  onPress={() => handleDelete(item._id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
     backgroundColor: '#f5f5f5',
     marginRight: -25,
     marginLeft: -19,
    maxWidth: '155%', 
  },
  content: { flex: 1, padding: 20 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    marginBottom: 15,
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  buttonsc: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonscc: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontWeight: '600' },
  courseFileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  courseFileInfo: {
    flex: 1,
  },
  cloudinaryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  cloudinaryBadgeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
});
