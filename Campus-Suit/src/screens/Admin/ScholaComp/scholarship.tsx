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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

const API_URL = 'http://192.168.31.130:5000/api/scholarships';

interface Scholarship {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  amount: number;
  percentage: number;
  courseFileUrl?: string;
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
  const [courseFile, setCourseFile] = useState<any>(null);

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
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled) {
      setCourseFile(result.assets[0]);
    }
  };

  const handleAddScholarship = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.deadline ||
      !formData.amount ||
      !formData.percentage
    ) {
      alert('Please fill all fields');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('deadline', formData.deadline);
      form.append('amount', formData.amount);
      form.append('percentage', formData.percentage);

      if (courseFile) {
        form.append('courseFile', {
          uri: courseFile.uri,
          name: courseFile.name,
          type: 'application/pdf',
        } as any);
      }

      const res = await fetch(
        editingId ? `${API_URL}/${editingId}` : `${API_URL}/add`,
        {
          method: editingId ? 'PUT' : 'POST',
          body: form,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (!res.ok) throw new Error();

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
    } catch {
      alert('Operation failed');
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
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm', 'Delete this scholarship?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          fetchScholarships();
        },
      },
    ]);
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

            <TouchableOpacity style={styles.input} onPress={pickDocument}>
              <Text>
                {courseFile ? courseFile.name : 'Upload Course List (PDF)'}
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
                <Text style={{ color: '#2980b9', marginTop: 5 }}>
                  📄 {item.courseFileUrl.split('/').pop()}
                </Text>
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
});
