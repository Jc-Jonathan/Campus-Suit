import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { theme } from '../../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

export type LoanCalculationProps = NativeStackScreenProps<LoansStackParamList, 'LoanCalculation'>;

export const LoanCalculationScreen: React.FC<LoanCalculationProps> = ({ route, navigation }) => {
  const { loanId, loanTitle, amount, interestRate, repaymentPeriod } = route.params;
  const { createLoanNotification } = useNotifications();
  const { user } = useAuth();

  const [currentAmount, setCurrentAmount] = useState(amount);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastNotifiedAmount, setLastNotifiedAmount] = useState(amount);
  const [completionNotified, setCompletionNotified] = useState(false);

  // Parse repayment period string (e.g., "2 weeks", "1 month", "5 days")
  const parseRepaymentPeriod = (period: string) => {
    const parts = period.toLowerCase().trim().split(' ');
    if (parts.length !== 2) return { value: 0, unit: 'weeks' };
    
    const value = parseInt(parts[0], 10);
    const unit = parts[1];
    
    return { value: isNaN(value) ? 0 : value, unit };
  };

  // Convert different time units to milliseconds
  const getUnitInMilliseconds = (unit: string) => {
    switch (unit) {
      case 'second':
      case 'seconds':
        return 1000;
      case 'minute':
      case 'minutes':
        return 1000 * 60;
      case 'hour':
      case 'hours':
        return 1000 * 60 * 60;
      case 'day':
      case 'days':
        return 1000 * 60 * 60 * 24;
      case 'week':
      case 'weeks':
        return 1000 * 60 * 60 * 24 * 7;
      case 'month':
      case 'months':
        return 1000 * 60 * 60 * 24 * 30; // Approximate
      case 'year':
      case 'years':
        return 1000 * 60 * 60 * 24 * 365; // Approximate
      default:
        return 1000 * 60 * 60 * 24 * 7; // Default to weeks
    }
  };

  // Storage keys for loan data
  const LOAN_STORAGE_KEY = `loan_${loanId}`;
  const START_TIME_KEY = `loan_start_${loanId}`;

  // Load saved loan data on component mount
  useEffect(() => {
    const loadLoanData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(LOAN_STORAGE_KEY);
        const savedStartTime = await AsyncStorage.getItem(START_TIME_KEY);
        
        if (savedData && savedStartTime) {
          // Load existing loan data
          const loanData = JSON.parse(savedData);
          const startTime = new Date(savedStartTime);
          
          setCurrentAmount(loanData.currentAmount);
          setStartDate(startTime);
          
          // Check if loan is already completed
          if (loanData.completed) {
            setTimeRemaining('Completed');
            setIsCompleted(true);
          } else {
            // Check if loan should be completed based on time
            const { value: periodValue, unit: periodUnit } = parseRepaymentPeriod(repaymentPeriod);
            const totalDurationMs = periodValue * getUnitInMilliseconds(periodUnit);
            const endTime = new Date(startTime.getTime() + totalDurationMs);
            
            if (new Date().getTime() >= endTime.getTime()) {
              setTimeRemaining('Completed');
              setIsCompleted(true);
            }
          }
        } else {
          // First time loading this loan - save initial data
          const initialData = {
            loanId,
            loanTitle,
            amount,
            interestRate,
            repaymentPeriod,
            currentAmount: amount,
            startDate: new Date().toISOString()
          };
          
          await AsyncStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(initialData));
          await AsyncStorage.setItem(START_TIME_KEY, new Date().toISOString());
        }
      } catch (error) {
        console.error('Error loading loan data:', error);
      }
    };

    loadLoanData();
  }, [loanId, loanTitle, amount, interestRate, repaymentPeriod]);

  // Calculate time remaining and update amount with interest
  useEffect(() => {
    // Don't start calculations if loan is already completed
    if (isCompleted) return;
    
    const { value: periodValue, unit: periodUnit } = parseRepaymentPeriod(repaymentPeriod);
    const totalDurationMs = periodValue * getUnitInMilliseconds(periodUnit);
    const endTime = new Date(startDate.getTime() + totalDurationMs);

    const interval = setInterval(async () => {
      const now = new Date();
      const elapsed = now.getTime() - startDate.getTime();
      const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
      
      // Calculate elapsed periods for interest calculation (use whole periods only)
      const unitMs = getUnitInMilliseconds(periodUnit);
      const elapsedPeriods = Math.floor(elapsed / unitMs);
      
      // Calculate new amount with simple interest
      const interestAmount = amount * (interestRate / 100) * elapsedPeriods;
      const newAmount = amount + interestAmount;
      setCurrentAmount(newAmount);
      
      // Send notification when amount increases (only once per period)
      if (newAmount > lastNotifiedAmount && user?.email && elapsedPeriods > 0) {
        const readerName = user.email.split('@')[0]; // Extract name from email
        createLoanNotification(
          readerName,
          loanTitle,
          amount,
          newAmount,
          interestRate,
          repaymentPeriod,
          'amount_increase'
        );
        setLastNotifiedAmount(newAmount);
      }
      
      // Save current state to storage
      try {
        const loanData = {
          loanId,
          loanTitle,
          amount,
          interestRate,
          repaymentPeriod,
          currentAmount: newAmount,
          startDate: startDate.toISOString()
        };
        await AsyncStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(loanData));
      } catch (error) {
        console.error('Error saving loan data:', error);
      }
      
      if (remainingMs > 0) {
        // Calculate remaining time components
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        
        // Format display based on original unit
        let displayText = '';
        if (periodUnit.includes('second')) {
          displayText = `${seconds}s`;
        } else if (periodUnit.includes('minute')) {
          displayText = `${minutes}m ${seconds}s`;
        } else if (periodUnit.includes('hour')) {
          displayText = `${hours}h ${minutes}m ${seconds}s`;
        } else if (periodUnit.includes('day')) {
          displayText = `${days}d ${hours}h ${minutes}m`;
        } else if (periodUnit.includes('week')) {
          const weeks = Math.floor(days / 7);
          const remainingDays = days % 7;
          displayText = `${weeks}w ${remainingDays}d ${hours}h`;
        } else if (periodUnit.includes('month')) {
          const months = Math.floor(days / 30);
          const remainingDays = days % 30;
          displayText = `${months}m ${remainingDays}d`;
        } else if (periodUnit.includes('year')) {
          const years = Math.floor(days / 365);
          const remainingDays = days % 365;
          displayText = `${years}y ${remainingDays}d`;
        } else {
          displayText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        
        setTimeRemaining(displayText);
      } else {
        setTimeRemaining('Completed');
        clearInterval(interval);
        
        // Send completion notification (only once)
        if (!completionNotified && user?.email) {
          const readerName = user.email.split('@')[0]; // Extract name from email
          createLoanNotification(
            readerName,
            loanTitle,
            amount,
            newAmount,
            interestRate,
            repaymentPeriod,
            'repayment_completed'
          );
          setCompletionNotified(true);
        }
        
        // Save completed status
        try {
          const completedData = {
            loanId,
            loanTitle,
            amount,
            interestRate,
            repaymentPeriod,
            currentAmount: newAmount,
            startDate: startDate.toISOString(),
            completed: true,
            completedAt: new Date().toISOString()
          };
          await AsyncStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(completedData));
        } catch (error) {
          console.error('Error saving completed loan data:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [amount, interestRate, repaymentPeriod, startDate, loanId, loanTitle, isCompleted]);

  // Get the period unit for display
  const getPeriodUnitDisplay = (period: string) => {
    const { unit } = parseRepaymentPeriod(period);
    return unit.charAt(0).toUpperCase() + unit.slice(1);
  };

  return (
    <View style={styles.container}>
      <Header title="Loan Calculation" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.loanCard}>
          <Text style={styles.loanTitle}>{loanTitle}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Original Amount:</Text>
            <Text style={styles.detailValue}>${amount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Rate:</Text>
            <Text style={styles.detailValue}>{interestRate}% per {getPeriodUnitDisplay(repaymentPeriod)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Repayment Period:</Text>
            <Text style={styles.detailValue}>{repaymentPeriod}</Text>
          </View>
          
          <View style={[styles.detailRow, styles.currentAmountRow]}>
            <Text style={styles.detailLabel}>Current Amount:</Text>
            <Text style={styles.currentAmount}>${currentAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Time Remaining:</Text>
            <Text style={styles.countdown}>{timeRemaining}</Text>
          </View>
        </AppCard>
        
        <AppCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • Your loan amount increases by {interestRate}% every {getPeriodUnitDisplay(repaymentPeriod)}
          </Text>
          <Text style={styles.infoText}>
            • The countdown shows remaining time for repayment
          </Text>
          <Text style={styles.infoText}>
            • Current amount includes accumulated interest
          </Text>
        </AppCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  loanCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
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
});

export default LoanCalculationScreen;