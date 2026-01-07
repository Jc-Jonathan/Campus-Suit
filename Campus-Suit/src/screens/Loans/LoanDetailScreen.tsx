import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity, Modal, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { useAppData } from '../../contexts/AppDataContext';
import { Header, HeaderTab } from '../../components/Header';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export type LoanDetailProps = NativeStackScreenProps<LoansStackParamList, 'LoanDetail'>;

const { width } = Dimensions.get('window');
const HERO_IMAGES = [
  require('../../../assets/images/loan1.jpg'),
  require('../../../assets/images/loan2.jpg'),
];

export const LoanDetailScreen: React.FC<LoanDetailProps> = ({ route, navigation }) => {
  const { loanProducts } = useAppData();
  const product = loanProducts.find(p => p.id === route.params.id);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScrollRef = useRef<ScrollView | null>(null);
  const [heroModalVisible, setHeroModalVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (heroIndex + 1) % HERO_IMAGES.length;
      if (heroScrollRef.current) {
        heroScrollRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
      setHeroIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroIndex]);

  const handleHeroScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== heroIndex) {
      setHeroIndex(newIndex);
    }
  };

  const openHeroModal = () => {
    setHeroModalVisible(true);
  };

  const closeHeroModal = () => {
    setHeroModalVisible(false);
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <HeaderTab />
        <Header title="Loan" />
        <Text style={styles.muted}>Loan product not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderTab />
      <Header title={product.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCarousel}>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleHeroScrollEnd}
          >
            {HERO_IMAGES.map((img, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={openHeroModal}
                style={[styles.heroCard, { width: width - theme.spacing.lg * 2 }]}
              >
                <Image source={img} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroText}>Explore your chance to get a loan</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Text style={styles.rate}>{product.rate}% APR</Text>
        <Text style={styles.meta}>Maximum amount: ${product.maxAmount.toLocaleString()}</Text>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{product.description}</Text>

        <Text style={styles.sectionTitle}>Loan summary</Text>
        <Text style={styles.body}>
          This is a short explanation of how this loan works, including who it is designed for and how it
          can support your studies.
        </Text>

        <Text style={styles.sectionTitle}>Loan amount</Text>
        <Text style={styles.body}>Minimum loan amount: $500</Text>
        <Text style={styles.body}>
          Maximum loan amount: ${product.maxAmount.toLocaleString()}
        </Text>

        <Text style={styles.sectionTitle}>Interest structure</Text>
        <Text style={styles.body}>Type: Fixed interest, expressed as an annual percentage rate (APR).</Text>
        <Text style={styles.body}>
          Example: Interest rate {product.rate}% APR (approximately {(product.rate / 12).toFixed(2)}% per
          month).
        </Text>

        <Text style={styles.sectionTitle}>Repayment terms</Text>
        <Text style={styles.body}>
          Repayments are made in regular instalments. You can choose a weekly or monthly plan depending on
          your agreement.
        </Text>
        <Text style={styles.body}>Typical repayment duration: 6–24 months, depending on amount borrowed.</Text>

        <Text style={styles.sectionTitle}>Eligibility requirements</Text>
        <Text style={styles.body}>• Be an enrolled or admitted student.</Text>
        <Text style={styles.body}>• Provide a valid national ID or passport and proof of enrollment.</Text>
        <Text style={styles.body}>• Meet the minimum income or guarantor requirements set by the lender.</Text>

        <Text style={styles.sectionTitle}>Disbursement method</Text>
        <Text style={styles.body}>Approved funds are disbursed directly to your preferred channel:</Text>
        <Text style={styles.body}>• Bank transfer to your registered bank account; or</Text>
        <Text style={styles.body}>• Mobile money payout to your verified mobile wallet (where available).</Text>
        <AppButton
          label="Apply for this loan"
          onPress={() => navigation.navigate('LoanApply', { id: product.id })}
        />
      </ScrollView>
      <Modal
        visible={heroModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeHeroModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeHeroModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.8}
              onPress={closeHeroModal}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={HERO_IMAGES[heroIndex]}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  heroCarousel: {
    marginBottom: theme.spacing.lg,
  },
  heroCard: {
    height: 140,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  heroText: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  rate: { fontSize: theme.typography.subtitle, fontWeight: '700', color: theme.colors.primary },
  meta: { marginTop: 4, color: theme.colors.textMuted },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
    color: theme.colors.text,
  },
  body: { color: theme.colors.textMuted, lineHeight: 20 },
  muted: { padding: theme.spacing.lg, color: theme.colors.textMuted },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
