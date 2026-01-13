// ProductNotification.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  message: string;
  date: string;
  recipients: number;
}

interface ProductNotificationProps {
  notifications: Notification[];
  onSendNotification: (message: string) => Promise<void>;
}

export const ProductNotification: React.FC<ProductNotificationProps> = ({ 
  notifications = [], 
  onSendNotification 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      setIsSending(true);
      await onSendNotification(message);
      setMessage('');
      Alert.alert('Success', 'Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationDate}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <Text style={styles.recipientCount}>
          {item.recipients} {item.recipients === 1 ? 'recipient' : 'recipients'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Send Notification</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your notification message here..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.disabledButton]}
          onPress={handleSend}
          disabled={isSending}
        >
          <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {isSending ? 'Sending...' : 'Send Notification'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Notifications</Text>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>Notifications you send will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  notificationsList: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recipientCount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
    textAlign: 'center',
  },
});