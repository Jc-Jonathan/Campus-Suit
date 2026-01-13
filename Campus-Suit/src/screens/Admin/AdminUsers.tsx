import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type User = {
  userId: number;
  name: string;
  email: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://192.168.31.130:5000/api/auth';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of users');
      }
      
      // Transform data to match the User type
      const formattedUsers = data.map(user => ({
        userId: user.userId,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        country: user.country || 'N/A',
        phoneCode: user.phoneCode || '+1',
        phoneNumber: user.phoneNumber || 'N/A'
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
              });

              setUsers(prev =>
                prev.filter(user => user.userId !== userId)
              );
            } catch {
              Alert.alert('Error', 'Delete failed');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ marginTop: 60 }}
      />
    );
  }

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerCell, { width: 160 }]}>
        Name
      </Text>
      <Text style={[styles.cell, styles.headerCell, { width: 140 }]}>
        Country
      </Text>
      <Text style={[styles.cell, styles.headerCell, { width: 240 }]}>
        Email
      </Text>
      <Text style={[styles.cell, styles.headerCell, { width: 180 }]}>
        Phone
      </Text>
      <Text style={[styles.cell, styles.headerCell, { width: 80 }]}>
        Action
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: 160 }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.cell, { width: 140 }]} numberOfLines={1}>
        {item.country}
      </Text>
      <Text style={[styles.cell, { width: 240 }]} numberOfLines={1}>
        {item.email}
      </Text>
      <Text style={[styles.cell, { width: 180 }]}>
        {item.phoneCode} {item.phoneNumber}
      </Text>
      <View style={{ width: 80, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => deleteUser(item.userId)}
        >
          <MaterialIcons
            name="delete"
            size={22}
            color="red"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Users</Text>

      {/* Horizontal scroll for table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {renderHeader()}
          <FlatList
            data={users}
            keyExtractor={item => item.userId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#f0f2f5',
    borderTopWidth: 1,
    borderColor: '#dcdcdc',
  },
  cell: {
    fontSize: 13,
    color: '#333',
    paddingRight: 10,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
});
