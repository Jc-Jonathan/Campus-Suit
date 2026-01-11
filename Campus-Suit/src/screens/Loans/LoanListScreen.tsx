import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { theme } from '../../theme/theme';

const API_BASE = 'http://192.168.31.130:5000';

type Loan = {
  loanId: number;
  title: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  applicationDeadline?: string;
};

export const LoanListScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackScreenProps<LoansStackParamList, 'LoanList'>['navigation']>();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLoans = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/api/loans`);
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      console.error('Failed to fetch loans', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch loans only once when component mounts
  useEffect(() => {
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

 const navigateToStatus = () => {
  navigation.navigate('LoanStatus', { id: undefined }); // or provide an actual ID if you have one
};

  return (
    <View style={styles.container}>
      <HeaderTab />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Loans</Text>
        <Text style={styles.headerSubtitle}>Explore student-friendly loan options</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={loans}
        keyExtractor={item => item.loanId.toString()}
        refreshing={refreshing}
        onRefresh={fetchLoans}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('LoanDetail', {
                  id: item.loanId.toString(),
                })
              }
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{item.interestRate}% APR</Text>
                </View>
              </View>

              <Text style={styles.amount}>
                ${item.minAmount.toLocaleString()} - ${item.maxAmount.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {item.applicationDeadline && (
              <Text style={styles.deadline}>
                🗓️ Apply by: {new Date(item.applicationDeadline).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      />
      
      <TouchableOpacity 
        style={styles.statusButton}
        onPress={navigateToStatus}
      >
        <Text style={styles.statusButtonText}>View Loan Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.xxl,
    position: 'relative',
  },
  list: { 
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 80, // Extra padding to account for the fixed button
  },
  statusButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  metaContainer: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  rateBadge: {
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rateText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  deadline: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
});
