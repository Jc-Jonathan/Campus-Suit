import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header, HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppData } from '../../contexts/AppDataContext';
import { theme } from '../../theme/theme';

export const ScholarshipStatusScreen: React.FC = () => {
  const { scholarshipApplications, scholarships } = useAppData();

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="My applications" subtitle="Scholarship status" />
      <FlatList
        contentContainerStyle={styles.list}
        data={scholarshipApplications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const s = scholarships.find(sc => sc.id === item.scholarshipId);
          return (
            <AppCard>
              <Text style={styles.title}>{s?.title ?? 'Scholarship'}</Text>
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
