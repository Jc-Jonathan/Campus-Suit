import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header, HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppData } from '../../contexts/AppDataContext';
import { theme } from '../../theme/theme';

export const LoanStatusScreen: React.FC = () => {
  const { loanApplications, loanProducts } = useAppData();

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Loan status" subtitle="Track your applications" />
      <FlatList
        contentContainerStyle={styles.list}
        data={loanApplications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const loan = loanProducts.find(l => l.id === item.loanProductId);
          return (
            <AppCard>
              <Text style={styles.title}>{loan?.name ?? 'Loan product'}</Text>
              <Text style={styles.date}>Submitted: {item.submittedAt}</Text>
              <StatusBadge status={item.status} />
            </AppCard>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  title: { fontWeight: '600', color: theme.colors.text },
  date: { marginTop: 4, color: theme.colors.textMuted },
});
