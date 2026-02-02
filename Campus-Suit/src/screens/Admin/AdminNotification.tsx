import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RecipientMode = 'ALL' | 'USERS';

interface User {
  _id: string;
  name: string;
  email: string;
  country: string;
  phoneNumber: string;
}

interface Notification {
  _id: string;
  message: string;
  targetType: RecipientMode;
  targetUsers: string[];
}

const AdminNotification = () => {
  const { userToken } = useAuth();

  const [message, setMessage] = useState('');
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('ALL');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    if (recipientMode === 'USERS') fetchUsers();
  }, [recipientMode]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('http://192.168.31.130:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ================= FETCH NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        'http://192.168.31.130:5000/api/notifications',
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const data = await res.json();
      setNotifications(data);
    } catch {
      Alert.alert('Error', 'Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ================= SEND / UPDATE ================= */
  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message is required');
      return;
    }

    if (recipientMode === 'USERS' && selectedUsers.length === 0) {
      Alert.alert('Error', 'Select at least one user');
      return;
    }

    const url = editingId
      ? `http://192.168.31.130:5000/api/notifications/${editingId}`
      : 'http://192.168.31.130:5000/api/notifications';

    const method = editingId ? 'PUT' : 'POST';

    try {
      setSending(true);
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
  message,
  category: 'ANNOUNCEMENT', // 🔥
  type: recipientMode,
  recipients: recipientMode === 'USERS' ? selectedUsers : [],
}),

      });

      Alert.alert('Success', editingId ? 'Updated' : 'Sent');
      resetForm();
      fetchNotifications();
    } catch {
      Alert.alert('Error', 'Action failed');
    } finally {
      setSending(false);
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setMessage('');
    setRecipientMode('ALL');
    setSelectedUsers([]);
    setEditingId(null);
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Notifications</Text>

      {/* ===== COMPOSE CARD ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {editingId ? 'Edit Notification' : 'Create Notification'}
        </Text>

        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Write notification message..."
          value={message}
          onChangeText={setMessage}
        />

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              recipientMode === 'ALL' && styles.toggleActive,
            ]}
            onPress={() => {
              setRecipientMode('ALL');
              setSelectedUsers([]);
            }}
          >
            <Text style={styles.toggleText}>All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              recipientMode === 'USERS' && styles.toggleActive,
            ]}
            onPress={() => setRecipientMode('USERS')}
          >
            <Text style={styles.toggleText}>Specific Users</Text>
          </TouchableOpacity>
        </View>

        {recipientMode === 'USERS' && (
          <View style={styles.userList}>
            {loadingUsers ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userRow}
                    onPress={() => toggleUser(item._id)}
                  >
                    <View>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userMeta}>{item.email}</Text>
                      <Text style={styles.userMeta}>
                        {item.country} • {item.phoneNumber}
                      </Text>
                    </View>
                    {selectedUsers.includes(item._id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#2ecc71"
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.primaryText}>
            {sending ? 'Processing...' : editingId ? 'Update' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== NOTIFICATION LIST ===== */}
      <Text style={styles.sectionHeader}>Sent Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.notificationText}>{item.message}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item._id);
                  setMessage(item.message);
                  setRecipientMode(item.targetType);
                  setSelectedUsers(item.targetUsers || []);
                }}
              >
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Confirm', 'Delete notification?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await fetch(
                          `http://192.168.31.130:5000/api/notifications/${item._id}`,
                          {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${userToken}`,
                            },
                          }
                        );
                        fetchNotifications();
                      },
                    },
                  ])
                }
              >
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default AdminNotification;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },

  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    marginBottom: 12,
  },

  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#eaf2ff', borderColor: '#4c6ef5' },
  toggleText: { fontWeight: '500' },

  userList: { maxHeight: 220, marginBottom: 12 },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  userName: { fontWeight: '600' },
  userMeta: { fontSize: 12, color: '#666' },

  primaryBtn: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '600' },

  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },

  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  notificationText: { marginBottom: 6 },

  actionRow: { flexDirection: 'row', gap: 20 },
  edit: { color: '#4c6ef5' },
  delete: { color: '#e03131' },
});
