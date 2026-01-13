import React, { useCallback } from 'react';
import { View, Text, StyleSheet, BackHandler, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';
import { AdminStackParamList } from '../../navigation/AdminStack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type AdminScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AdminScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => subscription.remove();
    }, [navigation])
);

  const goToLoans = () => navigation.navigate('AdminLoans');
  const goToOrders = () => navigation.navigate('AdminOrders');
  const goToProducts = () => navigation.navigate('AdminProducts');
  const goToScholarships = () => navigation.navigate('AdminScholarships');
  const goToUsers = () => navigation.navigate('AdminUsers');
  const goToNotification = () => navigation.navigate('AdminNotification');

  const auth = useAuth();
const handleExitDashboard = async () => {
  if (auth) {
    await auth.logout();
    // Reset the entire navigation stack and navigate to MainTabs
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  }
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        
        <View style={styles.exitButtonContainer}>
          <AppButton
            label="Exit Dashboard"
            onPress={handleExitDashboard}
            style={styles.exitButton}
            textStyle={styles.exitButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  exitButtonContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.xl,
    width: '100%',
  },
  exitButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'red',
  },
  exitButtonText: {
    color: 'red',
  },
});
