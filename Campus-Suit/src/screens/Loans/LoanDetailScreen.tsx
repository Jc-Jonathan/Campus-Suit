import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { Header, HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { CommonActions } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackParamList } from '../../navigation/MainStack';

export type LoanDetailProps = NativeStackScreenProps<
  LoansStackParamList,
  'LoanDetail'
>;

const { width } = Dimensions.get('window');
const API_BASE = 'http://192.168.31.130:5000';

export const LoanDetailScreen: React.FC<LoanDetailProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const { id } = route.params;

  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [heroModalVisible, setHeroModalVisible] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/loans/loan/${id}`);
        const data = await response.json();
        setLoan(data);
      } catch {
        Alert.alert('Error', 'Unable to load loan');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, [id, navigation]);

  useEffect(() => {
    fetch(`${API_BASE}/api/banners?screen=LOAN_DETAIL&position=HERO`)
      .then(res => res.json())
      .then(json => setHeroImages(json.data || []))
      .catch(console.error);
  }, []);

  const handleApplyLoan = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to apply', [
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
      ]);
      return;
    }

    navigation.navigate('LoanApply', { id: loan.loanId });
  };

  const downloadDocument = async () => {
    if (!loan?.documentUrl) {
      Alert.alert('No document available');
      return;
    }

    const url = `${API_BASE}${loan.documentUrl}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.container}>
        <HeaderTab />
        <Header title="Loan" />
        <Text style={styles.muted}>Loan not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Loan Details" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* TITLE */}
        <Text style={styles.title}>{loan.title}</Text>

        {/* HERO */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {heroImages.map(item => (
            <TouchableOpacity
              key={item._id}
              style={styles.heroCard}
              onPress={() => setHeroModalVisible(true)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.statText}>{loan.interestRate}% APR</Text>
          </View>
          <View style={styles.statChipSecondary}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.statTextSecondary}>
              ${loan.minAmount.toLocaleString()} – ${loan.maxAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Section title="Description" text={loan.description} />
          <Section title="Repayment Period" text={loan.repaymentPeriod} />
          <Section title="Eligibility" text={loan.eligibility || 'Not specified'} />
          <Section title="Benefits" text={loan.benefits || 'Not specified'} />
        </View>

        {/* ACTIONS */}
        <View style={styles.actionBox}>
          <AppButton label="Download Loan Form" onPress={downloadDocument} variant="outline" />
          <View style={{ height: 12 }} />
          <AppButton label="Apply for this Loan" onPress={handleApplyLoan} />
        </View>
      </ScrollView>

      {/* IMAGE MODAL */}
      <Modal transparent visible={heroModalVisible}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setHeroModalVisible(false)}
        >
          <Image
            source={{ uri: heroImages[0]?.imageUrl }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
};

const Section = ({ title, text }: { title: string; text: string }) => (
  <>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.body}>{text}</Text>
  </>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    color: theme.colors.text,
  },

  heroCard: {
    width: width - 32,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 4,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 16,
  },

  statChip: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  statText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  statChipSecondary: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  statTextSecondary: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '700',
    color: theme.colors.text,
  },

  body: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    fontSize: 14,
  },

  actionBox: {
    marginTop: 24,
  },

  muted: {
    padding: 20,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalImage: {
    width: '90%',
    height: '70%',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
