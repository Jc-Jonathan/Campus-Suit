import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchLoanApplications, fetchLoanDetails, LoanApplication } from '../../services/loanService';
import { theme } from '../../theme/theme';
import { format, parseISO } from 'date-fns';

export const LoanStatusScreen = () => {
  const [applications, setApplications] = useState<Array<LoanApplication & { deadline?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = 'http://192.168.31.130:5000';

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchLoanApplications();
      
      // Fetch loan details for each application to get the deadline
      const applicationsWithDeadlines = await Promise.all(
        data.map(async (app: LoanApplication) => {
          if (!app._id) {
            console.warn('Application missing ID:', app);
            return { ...app, deadline: 'N/A' };
          }
          
          try {
            const loanDetails = await fetchLoanDetails(app._id);
            return { 
              ...app, 
              deadline: loanDetails.applicationDeadline || 'No deadline set' 
            };
          } catch (error) {
            console.error(`Error fetching details for loan ${app._id}:`, error);
            return { 
              ...app, 
              deadline: 'Error loading deadline' 
            };
          }
        })
      );
      
      setApplications(applicationsWithDeadlines);
    } catch (err) {
      setError('Failed to load loan applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.danger }}>{error}</Text>
        <TouchableOpacity onPress={loadApplications} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Loan Applications" showBackButton={false} />
      <View>
        <FlatList
          data={applications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AppCard style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <Text style={styles.loanTitle}>{item.loanTitle}</Text>
                <StatusBadge status={item.status} />
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.statusText,
                  item.status === 'approved' ? styles.statusApproved :
                  item.status === 'rejected' ? styles.statusRejected :
                  styles.statusPending
                ]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Applied On:</Text>
                <Text style={styles.detailValue}>
                  {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                </Text>
              </View>
            </AppCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No loan applications found'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  listContent: {
    paddingBottom: 20,
  },
  loanCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  detailValue: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  statusText: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  statusApproved: {
    color: theme.colors.accent,
  },
  statusRejected: {
    color: theme.colors.danger,
  },
  statusPending: {
    color: theme.colors.textMuted,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});