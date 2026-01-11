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
import { theme } from '../../theme/theme';

export type LoanDetailProps = NativeStackScreenProps<
  LoansStackParamList,
  'LoanDetail'
>;

const { width } = Dimensions.get('window');

const HERO_IMAGES = [
  require('../../../assets/images/loan1.jpg'),
  require('../../../assets/images/loan2.jpg'),
];

// 🔴 CHANGE TO YOUR SERVER IP
const API_BASE = 'http://192.168.31.130:5000';

export const LoanDetailScreen: React.FC<LoanDetailProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;

  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroModalVisible, setHeroModalVisible] = useState(false);
  const heroScrollRef = useRef<ScrollView | null>(null);

  // =======================
  // FETCH LOAN FROM BACKEND
  // =======================
  useEffect(() => {
    const fetchLoan = async () => {
      try {
        setLoading(true);

        const loanId = Number(id);
        if (isNaN(loanId)) throw new Error('Invalid loan ID');

        const response = await fetch(
          `${API_BASE}/api/loans/loan/${loanId}`
        );

        if (!response.ok) throw new Error('Failed to fetch loan details');

        const data = await response.json();
        setLoan(data);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Unable to load loan');
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  // =======================
  // HERO AUTO SLIDE
  // =======================
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (heroIndex + 1) % HERO_IMAGES.length;
      heroScrollRef.current?.scrollTo({
        x: next * width,
        animated: true,
      });
      setHeroIndex(next);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroIndex]);

  // =======================
  // DOWNLOAD DOCUMENT
  // =======================
  const downloadDocument = async () => {
    if (!loan?.documentUrl) {
      Alert.alert('No document', 'No loan form attached');
      return;
    }

    const url = `${API_BASE}${loan.documentUrl}`;

    Alert.alert(
      'Download Loan Form',
      'Do you want to download this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            const supported = await Linking.canOpenURL(url);
            if (supported) Linking.openURL(url);
            else Alert.alert('Error', 'Cannot open document');
          },
        },
      ]
    );
  };

  // =======================
  // LOADING / ERROR STATES
  // =======================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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

  // =======================
  // MAIN UI
  // =======================
  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title="Loan Details" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* TITLE */}
        <Text style={styles.title}>{loan.title}</Text>

        {/* HERO */}
        <ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.heroWrapper}
        >
          {HERO_IMAGES.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setHeroModalVisible(true)}
              style={[styles.heroCard, { width: width - 32 }]}
            >
              <Image source={img} style={styles.heroImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.rate}>{loan.interestRate}% APR</Text>
          <Text style={styles.meta}>
            Amount: ${loan.minAmount.toLocaleString()} – $
            {loan.maxAmount.toLocaleString()}
          </Text>

          {loan.applicationDeadline && (
            <>
              <Text style={styles.sectionTitle}>Application Deadline</Text>
              <Text style={styles.body}>{loan.applicationDeadline}</Text>
            </>
          )}
        </View>

        {/* DETAILS CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{loan.description}</Text>

          <Text style={styles.sectionTitle}>Repayment Period</Text>
          <Text style={styles.body}>{loan.repaymentPeriod}</Text>

          <Text style={styles.sectionTitle}>Eligibility</Text>
          <Text style={styles.body}>{loan.eligibility || 'Not specified'}</Text>

          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.body}>{loan.benefits || 'Not specified'}</Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionBox}>
          <AppButton
            label="Download Loan Form"
            onPress={downloadDocument}
            variant="outline"
          />

          <View style={{ height: 12 }} />

          <AppButton
            label="Apply for this loan"
            onPress={() =>
              navigation.navigate('LoanApply', { id: loan.loanId })
            }
          />
        </View>
      </ScrollView>

      {/* IMAGE MODAL */}
      <Modal transparent visible={heroModalVisible}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setHeroModalVisible(false)}
        >
          <Image
            source={HERO_IMAGES[heroIndex]}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
};

// =======================
// STYLES
// =======================
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

  heroWrapper: {
    marginBottom: 16,
  },

  heroCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 4,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  rate: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 6,
  },

  meta: {
    color: theme.colors.textMuted,
    marginBottom: 12,
    fontSize: 14,
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
    marginTop: 8,
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
