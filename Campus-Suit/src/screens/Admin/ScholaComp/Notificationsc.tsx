// src/screens/Admin/screens/Notifications/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = 'http://192.168.31.130:5000/api/scholarshipApplications';

interface ScholarshipApplication {
  _id: string;
  fullName: string;
  email: string;
  country: string;
  countryCode: string;
  phoneLocal: string;
  program: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedUser?: string;
  createdAt: string;
  selected?: boolean;
}

interface NotificationData {
  message: string;
  targetUsers: string[];
  targetType: string;
  createdBy: string;
  pdfUrl?: string;
  fileName?: string;
}

export const Notificationsc: React.FC = () => {
  const [apps, setApps] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [document, setDocument] = useState<{ uri: string, name: string, type: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { user, userToken } = useAuth();

  // Update the fetchApprovedApplications function
  const fetchApprovedApplications = async () => {
    try {
      const response = await axios.get(API_URL);
      const approvedApps = response.data
        .filter((app: ScholarshipApplication) => app.status === 'approved')
        .map((app: ScholarshipApplication) => ({ ...app, selected: false }));
      setApps(approvedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setApps(apps.map(app =>
      app._id === id ? { ...app, selected: !app.selected } : app
    ));
  };

  const selectAll = () => {
    const allSelected = apps.every(app => app.selected);
    setApps(apps.map(app => ({ ...app, selected: !allSelected })));
  };

  const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setDocument({
        uri: file.uri,
        name: file.name || 'document.pdf',
        type: file.mimeType || 'application/pdf'
      });
    }
  } catch (err) {
    console.error('Error picking document:', err);
    Alert.alert('Error', 'Failed to pick document');
  }
};

  const uploadDocument = async (uri: string, name: string) => {
    const formData = new FormData();
    
    // For React Native, we need to create a file object in a specific way
    const file = {
      uri,
      name,
      type: 'application/pdf',
    };

    // @ts-ignore - TypeScript doesn't like appending a file object to FormData
    formData.append('file', file);

    try {
      const response = await axios.post('http://192.168.31.130:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.data && response.data.fileUrl) {
        return response.data.fileUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: any;
            status?: number;
            headers?: any;
            [key: string]: any;
          };
          request?: any;
          message?: string;
        };
        
        if ('response' in axiosError && axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
          console.error('Response headers:', axiosError.response.headers);
        } else if ('request' in axiosError && axiosError.request) {
          // The request was made but no response was received
          console.error('No response received:', axiosError.request);
        } else if ('message' in axiosError && axiosError.message) {
          // Something happened in setting up the request that triggered an Error
          console.error('Error:', axiosError.message);
        }
      }
      throw new Error('Failed to upload document');
    }
  };

const sendNotification = async () => {
  if (!message.trim()) {
    Alert.alert('Error', 'Please enter a message');
    return;
  }

  const selectedApps = apps.filter(app => app.selected);
  if (selectedApps.length === 0) {
    Alert.alert('Error', 'Please select at least one student');
    return;
  }

  setIsSending(true);

  try {
    let pdfUrl = '';
    let fileName = '';

    if (document) {
      pdfUrl = await uploadDocument(document.uri, document.name);
      fileName = document.name;
    }

    const notificationData = {
      message: message.trim(),
      type: 'APPROVED_STUDENTS', // Changed from targetType to type
      recipients: selectedApps.map(app => app._id), // Changed from targetUsers to recipients
      createdBy: user?._id || 'admin',
      ...(pdfUrl && { pdfUrl, fileName })
    };

    await axios.post('http://192.168.31.130:5000/api/notifications', notificationData, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    Alert.alert('Success', 'Notification sent successfully');
    setMessage('');
    setDocument(null);
    setApps(apps.map(app => ({ ...app, selected: false })));
  } catch (error: unknown) {
    console.error('Error sending notification:', error);
    const errorMessage = error && typeof error === 'object' && 'response' in error && 
                       typeof error.response === 'object' && error.response && 'data' in error.response &&
                       error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
                     ? String(error.response.data.message)
                     : 'Failed to send notification';
    Alert.alert('Error', errorMessage);
  } finally {
    setIsSending(false);
  }
};

  useEffect(() => {
    fetchApprovedApplications();
  }, []);

  const renderStudentCard = ({ item }: { item: ScholarshipApplication }) => (
    <TouchableOpacity
      style={[styles.studentCard, item.selected && styles.selectedCard]}
      onPress={() => toggleSelect(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.checkbox, item.selected && { backgroundColor: '#4CAF50' }]}>
            {item.selected && <MaterialIcons name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.fullName}
          </Text>
        </View>
        <Text style={styles.cardEmail} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={styles.cardProgram} numberOfLines={1}>
          {item.program}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <Text style={styles.titleApproved}>Send Notifications to Approved Students</Text>
      <View style={styles.messageContainer}>
        <Text style={styles.sectionTitle}>Compose Message</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message here..."
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
        />

        <View style={styles.documentContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <MaterialIcons name="attach-file" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>
              {document ? 'Change Document' : 'Attach Document (PDF)'}
            </Text>
          </TouchableOpacity>
          {document && (
            <View style={styles.documentInfo}>
              <MaterialIcons name="description" size={20} color="#666" />
              <Text style={styles.documentName} numberOfLines={1}>
                {document.name}
              </Text>
              <TouchableOpacity onPress={() => setDocument(null)}>
                <MaterialIcons name="close" size={20} color="#f44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.disabledButton]}
          onPress={sendNotification}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send Notification</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Students</Text>
        <TouchableOpacity onPress={selectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {apps.every(a => a.selected) ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FlatList
          data={apps}
          renderItem={renderStudentCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.studentList}
          style={{ flex: 1, width: '100%' }}
          ListHeaderComponent={renderHeader}
          ListHeaderComponentStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginRight: -30,
    marginLeft: -15,
    backgroundColor: '#f4f6f8',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6f8',
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  studentsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    marginLeft: -20,
    marginRight: -15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectAllButton: {
    padding: 4,
  },
  selectAllText: {
    marginTop: -15,
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 16,
  },
  studentList: {
    width: '100%',
    padding: 0,
  },
  studentCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  cardContent: {
    width: '100%',
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  cardProgram: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  cardSeparator: {
    width: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 14,
  },
  documentContainer: {
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingTop: 15,
    paddingBottom: 12,
    marginLeft: -12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  documentName: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleApproved: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#90caf9',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  medium: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedRow: {
    backgroundColor: '#e8f5e9',
  },
  cell: {
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 8,
    flex: 1,
  },
  checkboxContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});