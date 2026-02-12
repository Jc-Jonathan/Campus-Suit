import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchLoanApplications, fetchLoanDetails, LoanApplication } from '../../services/loanService';
import { theme } from '../../theme/theme';
import { format, parseISO } from 'date-fns';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export const LoanStatusScreen = () => {
  const navigation = useNavigation<NavigationProp<LoansStackParamList, 'LoanStatus'>>();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Array<LoanApplication & { 
    deadline?: string;
    interestRate?: number;
    repaymentPeriod?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const API_BASE = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev';

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchLoanApplications();
      console.log('Fetched loan applications:', data);
      
      // Filter applications to show only those belonging to the logged-in user
      const userApplications = data.filter((app: LoanApplication) => {
        if (!user?.email) return false;
        return app.email === user.email;
      });
      
      console.log('Filtered applications for user:', user?.email, userApplications);
      
      // The interestRate and repaymentPeriod are now directly available in the loan applications
      const applicationsWithDetails = userApplications.map((app: LoanApplication) => ({
        ...app,
        interestRate: app.interestRate,
        repaymentPeriod: app.repaymentPeriod || 'Not specified'
      }));
      
      console.log('Applications with details:', applicationsWithDetails);
      setApplications(applicationsWithDetails);
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

  const toggleCardExpansion = (loanId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(loanId)) {
      newExpanded.delete(loanId);
    } else {
      newExpanded.add(loanId);
    }
    setExpandedCards(newExpanded);
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
      <HeaderTab />
      <View>
        <FlatList
          data={applications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isExpanded = expandedCards.has(item._id);
            
            return (
              <View style={styles.loanCardTouchable}>
                <View style={styles.loanCard}>
                  {/* Header with icon and status */}
                  <View style={styles.loanHeader}>
                    <View style={styles.titleContainer}>
                      <Ionicons name="card-outline" size={20} color={theme.colors.primary} style={styles.loanIcon} />
                      <Text style={styles.loanTitle}>{item.loanTitle}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>
                  
                  {/* Status row with icon */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusContainer}>
                      <Ionicons 
                        name={item.status === 'approved' ? 'checkmark-circle' : 
                              item.status === 'rejected' ? 'close-circle' : 'time'} 
                        size={16} 
                        color={item.status === 'approved' ? theme.colors.accent :
                               item.status === 'rejected' ? theme.colors.danger :
                               theme.colors.textMuted} 
                        style={styles.statusIcon} 
                      />
                      <Text style={[
                        styles.statusText,
                        item.status === 'approved' ? styles.statusApproved :
                        item.status === 'rejected' ? styles.statusRejected :
                        styles.statusPending
                      ]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Expanded details with icons */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailContainer}>
                          <Ionicons name="cash-outline" size={16} color={theme.colors.textMuted} style={styles.detailIcon} />
                          <Text style={styles.detailLabel}>Amount</Text>
                        </View>
                        <Text style={styles.detailValue}>
                          ${item.amount ? item.amount.toLocaleString() : 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailContainer}>
                          <Ionicons name="pricetag-outline" size={16} color={theme.colors.textMuted} style={styles.detailIcon} />
                          <Text style={styles.detailLabel}>Interest Rate</Text>
                        </View>
                        <Text style={styles.detailValue}>
                          {item.interestRate ? `${item.interestRate}% APR` : 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailContainer}>
                          <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} style={styles.detailIcon} />
                          <Text style={styles.detailLabel}>Repayment Period</Text>
                        </View>
                        <Text style={styles.detailValue}>
                          {item.repaymentPeriod || 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailContainer}>
                          <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} style={styles.detailIcon} />
                          <Text style={styles.detailLabel}>Applied On</Text>
                        </View>
                        <Text style={styles.detailValue}>
                          {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* View More/Less button with icon */}
                  <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => toggleCardExpansion(item._id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={16} 
                      color={theme.colors.primary} 
                      style={styles.viewMoreIcon} 
                    />
                    <Text style={styles.viewMoreText}>
                      {isExpanded ? 'View Less' : 'View More'}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Approved loan navigation with enhanced styling */}
                  {item.status === 'approved' && (
                    <TouchableOpacity 
                      style={styles.calculationButton}
                      onPress={() => {
                        console.log('Navigating to LoanCalculation with:', {
                          loanId: item._id,
                          loanTitle: item.loanTitle,
                          amount: item.amount,
                          interestRate: item.interestRate || 0,
                          repaymentPeriod: item.repaymentPeriod || 'Not specified'
                        });
                        navigation.navigate('LoanCalculation', {
                          loanId: item._id,
                          loanTitle: item.loanTitle,
                          amount: item.amount,
                          interestRate: item.interestRate || 0,
                          repaymentPeriod: item.repaymentPeriod || 'Not specified'
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="calculator-outline" size={18} color="#fff" style={styles.calculationIcon} />
                      <Text style={styles.calculationText}>View Loan Calculation</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
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
    backgroundColor: '#f8fafc',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loanCardTouchable: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  loanIcon: {
    marginRight: 8,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  statusRow: {
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusApproved: {
    color: '#10b981',
  },
  statusRejected: {
    color: '#ef4444',
  },
  statusPending: {
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  expandedContent: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 12,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewMoreIcon: {
    marginRight: 6,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  calculationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calculationIcon: {
    marginRight: 8,
  },
  calculationText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});