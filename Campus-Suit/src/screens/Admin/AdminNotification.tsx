import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  message: string;
  recipients: number;
  date: string;
  status: 'sent' | 'scheduled' | 'draft';
}

const MOCK_USERS = [
  { id: '1', name: 'All Students' },
  { id: '2', name: 'All Faculty' },
  { id: '3', name: 'IT Department' },
  { id: '4', name: 'Finance Department' },
  { id: '5', name: 'Selected Students' },
];

export const AdminNotification: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load sample notifications
  useEffect(() => {
    // This would be replaced with an API call in a real app
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        message: 'Campus will be closed tomorrow due to maintenance',
        recipients: 2,
        date: '2024-01-03',
        status: 'sent'
      },
      {
        id: '2',
        message: 'New scholarship opportunities available',
        recipients: 1,
        date: '2024-01-02',
        status: 'sent'
      }
    ];
    setNotifications(sampleNotifications);
  }, []);

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (selectedRecipients.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      message: message.trim(),
      recipients: selectedRecipients.length,
      date: new Date().toISOString().split('T')[0],
      status: 'sent'
    };

    if (editingId) {
      setNotifications(notifications.map(n => 
        n.id === editingId ? { ...newNotification, id: editingId } : n
      ));
      setEditingId(null);
    } else {
      setNotifications([newNotification, ...notifications]);
    }

    // Reset form
    setMessage('');
    setSelectedRecipients([]);
  };

  const handleEdit = (notification: Notification) => {
    setMessage(notification.message);
    setEditingId(notification.id);
    // In a real app, you would load the actual recipients
    setSelectedRecipients(Array(notification.recipients).fill('1'));
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setNotifications(notifications.filter(n => n.id !== id));
            if (editingId === id) {
              setEditingId(null);
              setMessage('');
              setSelectedRecipients([]);
            }
          }
        }
      ]
    );
  };

  const renderRecipientItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.recipientItem,
        selectedRecipients.includes(item.id) && styles.selectedRecipient
      ]}
      onPress={() => toggleRecipient(item.id)}
    >
      <Text style={styles.recipientText}>{item.name}</Text>
      {selectedRecipients.includes(item.id) && (
        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationDate}>{item.date}</Text>
        <View style={styles.notificationActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <View style={styles.notificationFooter}>
        <Text style={styles.recipientCount}>
          {item.recipients} {item.recipients === 1 ? 'recipient' : 'recipients'}
        </Text>
        <View style={[
          styles.statusBadge,
          item.status === 'sent' ? styles.statusSent : 
          item.status === 'scheduled' ? styles.statusScheduled : 
          styles.statusDraft
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Send Notification</Text>
        
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          numberOfLines={4}
          placeholder="Type your notification message here..."
          value={message}
          onChangeText={setMessage}
        />

        <Text style={styles.label}>Select Recipients</Text>
        <FlatList
          data={MOCK_USERS}
          renderItem={renderRecipientItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recipientsList}
          contentContainerStyle={styles.recipientsListContent}
        />

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {editingId ? 'Update Notification' : 'Send Notification'}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setEditingId(null);
              setMessage('');
              setSelectedRecipients([]);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  recipientsList: {
    marginBottom: 20,
  },
  recipientsListContent: {
    paddingVertical: 4,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedRecipient: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  recipientText: {
    marginRight: 6,
    color: '#2c3e50',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  notificationsList: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  notificationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recipientCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusSent: {
    backgroundColor: '#e8f5e9',
  },
  statusScheduled: {
    backgroundColor: '#e3f2fd',
  },
  statusDraft: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#95a5a6',
    fontSize: 16,
  },
});