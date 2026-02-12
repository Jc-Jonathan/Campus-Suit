import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScholarshipsStackParamList } from '../../navigation/ScholarshipsStack';
import { useNavigation } from '@react-navigation/native';
import { AppCard } from '../../components/AppCard';
import { HeaderTab } from '../../components/Header';
import { Loader } from '../../components/Loader';
import { theme } from '../../theme/theme';

const BASE_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev';

export type ScholarshipListProps = NativeStackScreenProps<
  ScholarshipsStackParamList,
  'ScholarshipList'
>;

export const ScholarshipListScreen: React.FC = () => {
  const navigation = useNavigation<ScholarshipListProps['navigation']>();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScholarships = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${BASE_URL}/api/scholarships`);
      
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Server returned an HTML page. The API endpoint might be incorrect or the server might be down.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch scholarships');
      }
      
      setScholarships(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setRefreshing(false);
      console.error('Error fetching scholarships:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Error: ${errorMessage}. Please check if the server is running and the API endpoint is correct.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const onRefresh = () => {
    fetchScholarships();
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Text style={styles.pageTitle}>Available Scholarships</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={scholarships}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ScholarshipDetail', {
                id: item._id, // 🔑 PASS MONGO _id
              })
            }
          >
            <AppCard>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>
                {item.percentage && (
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{item.percentage}%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.amount}>
                ${item.amount?.toLocaleString()}
              </Text>
              <Text style={styles.deadline}>
                Deadline: {item.deadline}
              </Text>
            </AppCard>
          </TouchableOpacity>
        )}
      />
      
      {/* View Status Button */}
      <TouchableOpacity 
        style={styles.viewStatusButton}
        onPress={() => navigation.navigate('ScholarshipStatus')}
      >
        <Text style={styles.viewStatusButtonText}>View Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop:2,
    marginLeft:-10,
    marginBottom: theme.spacing.lg,
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  list: { padding: theme.spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  percentageBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  percentageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: '600',
    fontSize: theme.typography.subtitle,
    color: theme.colors.text,
  },
  amount: {
    marginTop: theme.spacing.sm,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deadline: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  viewStatusButton: {
    position: 'absolute',
    bottom: 3,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewStatusButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
