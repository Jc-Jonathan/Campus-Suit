import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/loanApplys';

// Safe type definitions
type LoanData = {
  _id?: string;
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  loanTitle?: string;
  amount?: number;
  status?: 'pending' | 'approved' | 'rejected';
};

export const LoanState = () => {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(true);

  const fetchLoans = useCallback(async () => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(API_URL, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!mounted) return;
      
      // More robust data parsing
      let loansData: any[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          loansData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          loansData = response.data.data;
        } else if (response.data.loanApplications && Array.isArray(response.data.loanApplications)) {
          loansData = response.data.loanApplications;
        } else {
          console.warn('Unexpected data structure:', response.data);
          loansData = [];
        }
      }
      
      // Filter out any invalid items with stricter validation
      const validLoans = loansData.filter((loan: any): loan is LoanData => {
        if (!loan || typeof loan !== 'object') return false;
        const itemId = loan._id || loan.id;
        return itemId && typeof itemId === 'string';
      });
      
      if (mounted) {
        setLoans(validLoans);
      }
    } catch (err: any) {
      if (!mounted) return;
      
      console.error('Error fetching loans:', err);
      
      // Handle different error types - ignore cancellation errors
      if (err.code === 'ECONNABORTED' || err.name === 'CanceledError' || err.message?.includes('canceled')) {
        // Don't set error for cancelled requests
        return;
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check internet connection.');
      } else {
        setError(`Failed to fetch loans: ${err.message || 'Unknown error'}`);
      }
      
      if (mounted) {
        setLoans([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [mounted]);

  const handleDelete = useCallback(async (id: string) => {
    if (!id || !mounted) {
      Alert.alert('Error', 'Invalid loan ID');
      return;
    }
    
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this loan application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!mounted) return;
            
            try {
              setDeletingId(id);
              
              await axios.delete(`${API_URL}/${id}`, {
                timeout: 15000,
                headers: { 'Content-Type': 'application/json' },
              });
              
              if (mounted) {
                setLoans(prev => prev.filter(loan => (loan._id || loan.id) !== id));
                Alert.alert('Success', 'Loan application deleted successfully');
              }
            } catch (error: any) {
              if (!mounted) return;
              
              console.error('Error deleting loan:', error);
              
              // Handle different error types - ignore cancellation errors
              if (error.code === 'ECONNABORTED' || error.name === 'CanceledError' || error.message?.includes('canceled')) {
                // Don't show error for cancelled requests
                return;
              } else if (error.response?.status === 404) {
                Alert.alert('Error', 'Loan application not found');
              } else if (error.response?.status === 500) {
                Alert.alert('Error', 'Server error. Please try again later');
              } else {
                Alert.alert('Error', 'Failed to delete loan application');
              }
            } finally {
              if (mounted) {
                setDeletingId(null);
              }
            }
          },
        },
      ]
    );
  }, [mounted]);

  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [fetchLoans])
  );

  useEffect(() => {
    fetchLoans();
    
    return () => {
      setMounted(false);
    };
  }, [fetchLoans]);

  // Memoized filtered data to prevent re-renders
  const approvedLoans = React.useMemo(() => 
    loans.filter(loan => loan.status === 'approved'), 
    [loans]
  );
  
  const rejectedLoans = React.useMemo(() => 
    loans.filter(loan => loan.status === 'rejected'), 
    [loans]
  );

  const keyExtractor = useCallback((item: LoanData, index: number) => {
    if (!item) return `loan-${index}`;
    const itemId = item._id || item.id;
    return itemId || `loan-${index}`;
  }, []);

  const renderRow = useCallback(({ item }: { item: LoanData }) => {
    const itemId = item._id || item.id;
    if (!itemId) return null;
    
    const isDeleting = deletingId === itemId;
    
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.wide]}>{item.fullName || 'N/A'}</Text>
        <Text style={styles.cell}>{item.phone || 'N/A'}</Text>
        <Text style={[styles.cell, styles.wide]}>{item.email || 'N/A'}</Text>
        <Text style={styles.cell}>{item.loanTitle || 'N/A'}</Text>
        <Text style={styles.cell}>${item.amount || '0'}</Text>
        <Text style={[
          styles.cell,
          item.status === 'approved' ? styles.approvedStatus :
          item.status === 'rejected' ? styles.rejectedStatus :
          styles.pendingStatus
        ]}>
          {item.status || 'pending'}
        </Text>
        <View style={styles.actionCell}>
          <TouchableOpacity
            onPress={() => handleDelete(itemId)}
            disabled={isDeleting}
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          >
            <MaterialIcons 
              name="delete" 
              size={20} 
              color={isDeleting ? "#ccc" : "#dc3545"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [deletingId, handleDelete]);

  const TableHeader = React.useCallback(() => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.wide]}>Full Name</Text>
      <Text style={styles.headerCell}>Phone</Text>
      <Text style={[styles.headerCell, styles.wide]}>Email</Text>
      <Text style={styles.headerCell}>Loan Title</Text>
      <Text style={styles.headerCell}>Amount</Text>
      <Text style={styles.headerCell}>Status</Text>
      <Text style={styles.headerCell}>Action</Text>
    </View>
  ), []);

  const Table = React.useCallback(({ data }: { data: LoanData[] }) => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={true}
      style={styles.horizontalScroll}
      contentContainerStyle={styles.horizontalContent}
    >
      <View style={styles.tableContainer}>
        <TableHeader />
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          extraData={deletingId}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
          ListFooterComponent={<View style={styles.tableFooter} />}
        />
      </View>
    </ScrollView>
  ), [renderRow, keyExtractor, deletingId, TableHeader]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading loan applications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLoans}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titleApproved}>Approved Loans ({approvedLoans.length})</Text>
      <Table data={approvedLoans} />

      <Text style={styles.titleRejected}>Rejected Loans ({rejectedLoans.length})</Text>
      <Table data={rejectedLoans} />
      
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft:-20,
    marginRight:-20,
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#0d6efd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  horizontalScroll: {
    flex: 1,
  },
  horizontalContent: {
    flexGrow: 1,
  },
  tableContainer: {
    minWidth: 800,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
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
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  approvedStatus: {
    color: '#28a745',
    fontWeight: '600',
  },
  rejectedStatus: {
    color: '#dc3545',
    fontWeight: '600',
  },
  pendingStatus: {
    color: '#ffc107',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6c757d',
    fontStyle: 'italic',
    fontSize: 16,
  },
  tableFooter: {
    height: 20,
  },
  footer: {
    height: 40,
  },
});
