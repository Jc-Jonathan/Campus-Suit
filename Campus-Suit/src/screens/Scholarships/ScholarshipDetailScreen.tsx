import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScholarshipsStackParamList } from '../../navigation/ScholarshipsStack';
import { MainStackParamList } from '../../navigation/MainStack';
import { Header, HeaderTab } from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useAuth } from '../../contexts/AuthContext';

export type ScholarshipDetailProps = NativeStackScreenProps<
  ScholarshipsStackParamList,
  'ScholarshipDetail'
>;

const BASE_URL = 'http://192.168.31.130:5000';

export const ScholarshipDetailScreen: React.FC<ScholarshipDetailProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const { id } = route.params;

  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/scholarships/${id}`);
        const json = await res.json();

        if (!json.success) {
          Alert.alert('Error', 'Scholarship not found');
          return;
        }

        setScholarship(json.data);
      } catch {
        Alert.alert('Error', 'Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  const handleApplyNow = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You must be logged in to apply for this scholarship.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AuthFlow' as keyof MainStackParamList }],
                })
              ),
          },
        ]
      );
      return;
    }

    navigation.navigate('ScholarshipApply', {
      scholarshipId: scholarship._id,
      scholarshipTitle: scholarship.title,
    });
  };

  const handleCourseDownload = () => {
    if (!scholarship?.courseFileUrl) {
      Alert.alert('Unavailable', 'No course list uploaded.');
      return;
    }

    Alert.alert('Download Course List', 'Proceed with download?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Download',
        onPress: () =>
          Linking.openURL(`${BASE_URL}${scholarship.courseFileUrl}`),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!scholarship) {
    return (
      <View style={styles.container}>
        <HeaderTab />
        <Header title="Scholarship" />
        <Text style={styles.muted}>Scholarship not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title={scholarship.title} subtitle="Scholarship Details" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* AMOUNT CARD */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Scholarship Amount</Text>
          <Text style={styles.amountValue}>
            ${scholarship.amount?.toLocaleString()}
          </Text>
          <Text style={styles.deadline}>
            Deadline: {scholarship.deadline}
          </Text>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{scholarship.description}</Text>
        </View>

        {/* COVERAGE */}
        {scholarship.percentage !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coverage</Text>
            <View style={styles.coverageBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.coverageText}>
                {scholarship.percentage}% covered
              </Text>
            </View>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handleCourseDownload}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={styles.secondaryText}>Course List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={handleApplyNow}
          >
            <Text style={styles.primaryText}>Apply Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
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

  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },

  amountLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.primary,
    marginVertical: 6,
  },

  deadline: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: theme.colors.text,
  },

  body: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },

  coverageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 6,
    gap: 6,
  },

  coverageText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },

  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    opacity: 0.9,
  },

  secondaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    elevation: 4,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
  },

  muted: {
    padding: 20,
    color: theme.colors.textMuted,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
