import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { AdminStackParamList } from '../../navigation/AdminStack';

export const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  const goToLoans = () => {
    navigation.navigate('AdminLoans');
  };

  const goToOrders = () => {
    navigation.navigate('AdminOrders');
  };

  const goToProducts = () => {
    navigation.navigate('AdminProducts');
  };

  const goToScholarships = () => {
    navigation.navigate('AdminScholarships');
  };

  const goToUsers = () => {
    navigation.navigate('AdminUsers');
  };

  const goToNotification = () => {
    navigation.navigate('AdminNotification');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Quick access to admin sections</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <AppButton label="Loan" onPress={goToLoans} />
          </View>
          <View style={styles.cell}>
            <AppButton label="Add Banners" onPress={goToOrders} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <AppButton label="Products" onPress={goToProducts} />
          </View>
          <View style={styles.cell}>
            <AppButton label="Scholarship" onPress={goToScholarships} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <AppButton label="Users" onPress={goToUsers} />
          </View>
          <View style={styles.cell}>
            <AppButton label="Notifications" onPress={goToNotification} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cell: {
    flex: 1,
  },
});
