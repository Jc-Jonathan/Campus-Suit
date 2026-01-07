import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../../contexts/AppDataContext';
import { Header, HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { Loader } from '../../components/Loader';
import { theme } from '../../theme/theme';

export type LoanListProps = NativeStackScreenProps<LoansStackParamList, 'LoanList'>;

export const LoanListScreen: React.FC = () => {
  const { loanProducts, isLoading } = useAppData();
  const navigation = useNavigation<LoanListProps['navigation']>();

  if (isLoading) return <Loader />;

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Finance" subtitle="Student-friendly loan options" />
      <FlatList
        contentContainerStyle={styles.list}
        data={loanProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('LoanDetail', { id: item.id })}>
            <AppCard>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.meta}>Rate: {item.rate}% APR</Text>
              <Text style={styles.meta}>Up to ${item.maxAmount.toLocaleString()}</Text>
            </AppCard>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  title: { fontWeight: '600', fontSize: theme.typography.subtitle, color: theme.colors.text },
  meta: { marginTop: 4, color: theme.colors.textMuted },
});
