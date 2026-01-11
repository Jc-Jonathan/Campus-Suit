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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScholarshipsStackParamList } from '../../navigation/ScholarshipsStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export type ScholarshipDetailProps = NativeStackScreenProps<
  ScholarshipsStackParamList,
  'ScholarshipDetail'
>;

const BASE_URL = 'http://192.168.31.130:5000';

export const ScholarshipDetailScreen: React.FC<ScholarshipDetailProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;

  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 FETCH SINGLE SCHOLARSHIP BY ID
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
      } catch (err) {
        Alert.alert('Error', 'Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  // 🔹 DOWNLOAD COURSE LIST WITH CONFIRMATION
  const handleCourseDownload = () => {
    if (!scholarship?.courseFileUrl) {
      Alert.alert('Unavailable', 'No course list uploaded.');
      return;
    }

    Alert.alert(
      'Download Course List',
      'Do you want to download the course list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            const fileUrl = `${BASE_URL}${scholarship.courseFileUrl}`;
            Linking.openURL(fileUrl);
          },
        },
      ]
    );
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
        <Text style={styles.amount}>
          ${scholarship.amount?.toLocaleString()}
        </Text>

        <Text style={styles.deadline}>
          Deadline: {scholarship.deadline}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{scholarship.description}</Text>

        {scholarship.percentage !== undefined && (
          <>
            <Text style={styles.sectionTitle}>Coverage</Text>
            <Text style={styles.body}>
              {scholarship.percentage}% coverage
            </Text>
          </>
        )}

        {/* 🔹 ACTION BUTTONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.courseButton}
            activeOpacity={0.85}
            onPress={handleCourseDownload}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Course List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ScholarshipApply', {
                scholarshipId: scholarship._id,
                scholarshipTitle: scholarship.title
              })
            }
          >
            <Text style={styles.applyButtonText}>APPLY NOW</Text>
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
  },
  amount: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deadline: {
    marginTop: 4,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: '600',
    fontSize: 16,
  },
  body: {
    marginTop: 6,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  courseButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  applyButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
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
