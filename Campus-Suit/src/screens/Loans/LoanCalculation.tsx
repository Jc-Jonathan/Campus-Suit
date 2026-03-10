import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { theme } from '../../theme/theme';
import { fetchLoanCalculation, LoanCalculation } from '../../services/loanService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export type LoanCalculationProps = NativeStackScreenProps<LoansStackParamList, 'LoanCalculation'>;

export const LoanCalculationScreen: React.FC<LoanCalculationProps> = ({ route, navigation }: LoanCalculationProps) => {
  const { loanId, loanTitle, amount, interestRate, repaymentPeriod } = route.params;
  const { createLoanNotification } = useNotifications();
  const { user } = useAuth();

  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch loan calculation from backend
  const fetchCalculation = async () => {
    try {
      console.log('Fetching calculation for loanId:', loanId);
      const response = await fetchLoanCalculation(loanId);
      console.log('Calculation response:', response);
      setCalculation(response.calculation);

      // Send notification if loan is approved and user is logged in
      if (response.calculation.isApproved && user?.email) {
        const readerName = user.email.split('@')[0];

        // Send notification for amount increase
        if (response.calculation.elapsedPeriods > 0 && response.calculation.interestAccrued > 0) {
          createLoanNotification(
            readerName,
            loanTitle,
            response.calculation.originalAmount,
            response.calculation.currentAmount,
            response.calculation.interestRate || interestRate,
            response.calculation.repaymentPeriod || repaymentPeriod,
            'amount_increase'
          );
        }

        // Send completion notification
        if (response.calculation.isCompleted) {
          createLoanNotification(
            readerName,
            loanTitle,
            response.calculation.originalAmount,
            response.calculation.currentAmount,
            response.calculation.interestRate || interestRate,
            response.calculation.repaymentPeriod || repaymentPeriod,
            'repayment_completed'
          );
        }
      }
    } catch (err: any) {
      console.error('Error fetching calculation:', err);
      
      // More specific error messages
      if (err.response?.status === 404) {
        setError('Loan not found. Please check the loan ID and try again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to load loan calculation: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load calculation on component mount
  useEffect(() => {
    fetchCalculation();
  }, [loanId]);

  // Auto-refresh calculation every 1 second for active loans
  useEffect(() => {
    if (!calculation?.isApproved || calculation?.isCompleted) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      fetchCalculation();
    }, 1000);

    return () => clearInterval(interval);
  }, [calculation?.isApproved, calculation?.isCompleted, loanId]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCalculation();
  };

  // Get the period unit for display
  const getPeriodUnitDisplay = (period: string) => {
    if (!period) return 'Weeks';
    const parts = period.toLowerCase().trim().split(' ');
    const unit = parts.length > 1 ? parts[1] : 'weeks';
    return unit.charAt(0).toUpperCase() + unit.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Loan Calculation" showBackButton={true} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading loan calculation...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Loan Calculation" showBackButton={true} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color="#fff" style={styles.retryIcon} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!calculation) {
    return (
      <View style={styles.container}>
        <Header title="Loan Calculation" showBackButton={true} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No calculation data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Loan Calculation" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.loanCard}>
          <View style={styles.headerRow}>
            <Text style={styles.loanTitle}>{loanTitle}</Text>
            {refreshing && <ActivityIndicator size="small" color={theme.colors.primary} />}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Original Amount:</Text>
            <Text style={styles.detailValue}>${calculation.originalAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Rate:</Text>
            <Text style={styles.detailValue}>
              {calculation.interestRate || interestRate}% per {getPeriodUnitDisplay(calculation.repaymentPeriod || repaymentPeriod)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Repayment Period:</Text>
            <Text style={styles.detailValue}>{calculation.repaymentPeriod || repaymentPeriod}</Text>
          </View>

          {calculation.isApproved ? (
            <>
              <View style={[styles.detailRow, styles.currentAmountRow]}>
                <Text style={styles.detailLabel}>Current Amount:</Text>
                <Text style={styles.currentAmount}>${calculation.currentAmount.toLocaleString()}</Text>
              </View>

              {calculation.interestAccrued > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Accrued:</Text>
                  <Text style={styles.interestAmount}>+${calculation.interestAccrued.toLocaleString()}</Text>
                </View>
              )}

              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Time Remaining:</Text>
                <Text style={[styles.countdown, calculation.isCompleted && styles.completedCountdown]}>
                  {calculation.timeRemaining}
                </Text>
                {calculation.isCompleted && (
                  <Text style={styles.completedText}>Loan Completed</Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.notApprovedContainer}>
              <Ionicons name="alert-circle" size={24} color={theme.colors.warning} style={styles.notApprovedIcon} />
              <Text style={styles.notApprovedText}>Loan not yet approved</Text>
              <Text style={styles.notApprovedSubtext}>Check back once your loan is approved</Text>
            </View>
          )}
        </AppCard>

        <AppCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          {calculation.isApproved ? (
            <>
              <Text style={styles.infoText}>
                • Your loan amount increases by {calculation.interestRate || interestRate}% every {getPeriodUnitDisplay(calculation.repaymentPeriod || repaymentPeriod)}
              </Text>
              <Text style={styles.infoText}>
                • The countdown shows remaining time for repayment
              </Text>
              <Text style={styles.infoText}>
                • Current amount includes accumulated interest
              </Text>
              <Text style={styles.infoText}>
                • Data refreshes automatically every 1 second
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                • Your loan application is currently {calculation.timeRemaining.toLowerCase()}
              </Text>
              <Text style={styles.infoText}>
                • Once approved, interest calculation will begin
              </Text>
              <Text style={styles.infoText}>
                • You'll receive notifications when status changes
              </Text>
            </>
          )}
        </AppCard>

        {calculation.isApproved && !calculation.isCompleted && (
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color={theme.colors.primary} style={styles.refreshIcon} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  loanCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  currentAmountRow: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  currentAmount: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  interestAmount: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.radius.md,
  },
  countdownLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  countdown: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.accent,
    textAlign: 'center',
  },
  completedCountdown: {
    color: theme.colors.success,
  },
  completedText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  notApprovedContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.radius.md,
  },
  notApprovedIcon: {
    marginBottom: theme.spacing.md,
  },
  notApprovedText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: theme.spacing.sm,
  },
  notApprovedSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  infoCard: {
    padding: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: theme.spacing.md,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoanCalculationScreen;