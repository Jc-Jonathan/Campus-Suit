import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/scholarshipApplications';

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

export const Notificationsc: React.FC = () => {
  const [apps, setApps] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, userToken } = useAuth();

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
      const notificationData = {
        message: message.trim(),
        type: 'APPROVED_STUDENTS', 
        recipients: selectedApps.map(app => app._id), 
        createdBy: user?._id || 'admin',
        category: 'SCHOLARSHIP'
      };

      await axios.post('https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/notifications', notificationData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Success', 'Notification sent successfully');
      setMessage('');
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
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
            placeholderTextColor="#999"
            blurOnSubmit={false}
            returnKeyType="none"
            keyboardType="default"
            autoCorrect={true}
            autoCapitalize="sentences"
          />
          
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

      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={true}
      >
        {apps.map((item) => (
          <View key={item._id} style={{ marginBottom: 10 }}>
            {renderStudentCard({ item })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: -25,
    marginLeft: -20,
    marginRight: -30,
    backgroundColor: '#f4f6f8',
  },
  headerContainer: {
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
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
  studentCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  cardContent: {
    width: '100%',
    padding: 0,
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
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
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
    flex: 1,
    paddingHorizontal: 8,
  },
  cellText: {
    fontSize: 13,
    color: '#333',
  },
  nameCell: {
    flex: 2,
  },
  emailCell: {
    flex: 2,
  },
  programCell: {
    flex: 1.5,
  },
});
