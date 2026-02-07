import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, HeaderTab } from '../../components/Header';
import { AppCard } from '../../components/AppCard';
import { StatusBadge } from '../../components/StatusBadge';
import { theme } from '../../theme/theme';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  scholarshipTitle?: string;
  provider?: string;
  email?: string;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const API_URL = 'http://192.168.31.130:5000/api/scholarshipApplications';

export const ScholarshipStatusScreen: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data) {
        // Transform the response data to match our interface
        const apps = Array.isArray(response.data) ? response.data : [response.data];
        const appsWithTitles = apps.map((app: any) => ({
          id: app._id || app.id || Math.random().toString(),
          scholarshipId: app.scholarshipId || '',
          status: app.status || 'pending',
          submittedAt: app.createdAt || new Date().toISOString(),
          scholarshipTitle: app.scholarshipTitle || 'Scholarship',
          provider: app.provider || 'University',
          email: app.email || '' // Add email field for filtering
        }));
        
        // Filter applications to show only those belonging to the logged-in user
        const userApplications = appsWithTitles.filter((app: ScholarshipApplication & { email?: string }) => {
          if (!user?.email) return false;
          return app.email === user.email;
        });
        
        console.log('Filtered applications for user:', user?.email, userApplications);
        setApplications(userApplications);
        setError(null); // Clear any previous errors
      } else {
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please pull down to refresh.');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="My applications" subtitle="Scholarship status" />
      <FlatList
        contentContainerStyle={styles.list}
        data={applications}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchApplications}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ? error : 'No scholarship applications found'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text style={styles.title}>{item.scholarshipTitle}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Status:</Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Applied on:</Text>
              <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
            </View>
            {item.provider && (
              <Text style={styles.provider}>Provided by: {item.provider}</Text>
            )}
          </AppCard>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  list: { 
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl 
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  title: { 
    fontSize: 18,
    fontWeight: '600', 
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
    width: 80,
  },
  date: {
    color: theme.colors.text,
  },
  provider: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontSize: 14,
  },
});