import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/loanApplys';

export const LoanState = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLoans(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      Alert.alert('Error', 'Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`${API_URL}/${id}`);
      fetchLoans();
    } catch (error) {
      console.error('Error deleting loan:', error);
      Alert.alert('Error', 'Failed to delete loan application');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');

  const TableHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.wide]}>Full Name</Text>
      <Text style={styles.headerCell}>Phone</Text>
      <Text style={[styles.headerCell, styles.wide]}>Email</Text>
      <Text style={styles.headerCell}>Loan Title</Text>
      <Text style={styles.headerCell}>Amount</Text>
      <Text style={styles.headerCell}>Status</Text>
      <Text style={styles.headerCell}>Action</Text>
    </View>
  );

  const renderRow = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.wide]}>{item.fullName || 'N/A'}</Text>
      <Text style={styles.cell}>{item.phone || 'N/A'}</Text>
      <Text style={[styles.cell, styles.wide]}>{item.email || 'N/A'}</Text>
      <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">
        {item.loanTitle || 'N/A'}
      </Text>
      <Text style={styles.cell}>${item.amount?.toLocaleString() || '0'}</Text>
      <Text 
        style={[
          styles.cell, 
          item.status === 'approved' ? styles.approvedStatus : styles.rejectedStatus
        ]}
      >
        {item.status?.toUpperCase() || 'PENDING'}
      </Text>
      <TouchableOpacity
        style={styles.actionCell}
        onPress={() => 
          Alert.alert(
            'Delete Application',
            'Are you sure you want to delete this application?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => handleDelete(item._id)
              },
            ]
          )
        }
        disabled={deletingId === item._id}
      >
        {deletingId === item._id ? (
          <ActivityIndicator size="small" color="#dc3545" />
        ) : (
          <MaterialIcons name="delete" size={22} color="#dc3545" />
        )}
      </TouchableOpacity>
    </View>
  );

  const Table = ({ data }: { data: any[] }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <TableHeader />
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View style={styles.emptyContainer as any}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titleApproved}>Approved Loans</Text>
      <Table data={approvedLoans} />

      <Text style={styles.titleRejected}>Rejected Loans</Text>
      <Table data={rejectedLoans} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    minWidth: "120%",
    marginLeft: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleApproved: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 10,
  },
  titleRejected: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 30,
    marginBottom: 10,
    paddingLeft: 10,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    alignItems: 'center',
  },
  headerCell: {
    paddingHorizontal: 30,
    fontWeight: 'bold',
    color: '#495057',
    fontSize: 12,
    minWidth: 100,
  },
  cell: {
    paddingHorizontal: 8,
    color: '#212529',
    fontSize: 13,
    minWidth: 100,
  },
  wide: {
    minWidth: 150,
  },
  actionCell: {
    width: 50,
    alignItems: 'center',
  },
  approvedStatus: {
    color: '#28a745',
    fontWeight: '600',
  },
  rejectedStatus: {
    color: '#dc3545',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
