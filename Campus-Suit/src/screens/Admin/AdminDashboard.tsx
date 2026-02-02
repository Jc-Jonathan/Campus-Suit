import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { AdminStackParamList } from '../../navigation/AdminStack';
import { RootStackParamList } from '../../types/navigation';

type AdminScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

type AdminDashboardRouteProp = RouteProp<AdminStackParamList, 'AdminDashboard'>;

type DashboardRouteParams = {
  userToken: string;
};

const AdminDashboard = () => {
  const navigation = useNavigation<AdminScreenNavigationProp>();
  const route = useRoute<AdminDashboardRouteProp>();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Tabs' as never);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const cards = [
    { label: 'Loans', icon: 'cash-outline', onPress: () => navigation.navigate('AdminLoans') },
    { label: 'Banners', icon: 'images-outline', onPress: () => navigation.navigate('AdminBanners') },
    { label: 'Products', icon: 'cube-outline', onPress: () => navigation.navigate('AdminProducts') },
    { label: 'Scholarships', icon: 'school-outline', onPress: () => navigation.navigate('AdminScholarships') },
    { label: 'Users', icon: 'people-outline', onPress: () => navigation.navigate('AdminUsers') },
    { 
      label: 'Notifications', 
      icon: 'notifications-outline', 
      onPress: () => navigation.navigate('AdminNotification', { userToken: route.params?.userToken || '' }) 
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage application content and users
        </Text>
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        {cards.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon as any}
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.cardText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },

  subtitle: {
    color: '#eaeaea',
    fontSize: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,

    // Shadow (Android + iOS)
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
