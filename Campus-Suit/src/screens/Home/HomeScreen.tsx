import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  BackHandler,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderTab } from '../../components/Header';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const CARDS = [
  {
    key: 'loan',
    title: 'Easy Campus Loans',
    short: 'Student-friendly loan solutions',
    description:
      'Get flexible loan options designed for students. Compare offers, check eligibility instantly, and track applications in one place.',
  },
  {
    key: 'scholarship',
    title: 'Scholarship Opportunities',
    short: 'Scholarships made for you',
    description:
      'Browse curated scholarships based on your profile. Save opportunities and apply directly from the app.',
  },
  {
    key: 'store',
    title: 'Campus Store Deals',
    short: 'Best campus essentials',
    description:
      'Exclusive discounts on textbooks, gadgets, and essentials. Order online and track purchases easily.',
  },
];

const BUTTON_LABELS: Record<string, string> = {
  loan: 'Get a loan quote',
  scholarship: 'Find scholarships',
  store: 'Browse store',
};

export const HomeScreen: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const navigation = useNavigation<any>();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [homeBanners, setHomeBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://192.168.31.130:5000/api/banners?screen=HOME&position=CAROUSEL')
      .then(res => res.json())
      .then(json => setHomeBanners(json.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % CARDS.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const activeCard = CARDS[activeIndex];

  const handleCtaPress = () => {
    if (activeCard.key === 'loan') navigation.navigate('Finance');
    if (activeCard.key === 'scholarship') navigation.navigate('HomeScholarships');
    if (activeCard.key === 'store') navigation.navigate('Store');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HeaderTab />

      {/* HERO CAROUSEL */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {CARDS.map(card => (
            <View key={card.key} style={[styles.heroCard, { width }]}>
              <Text style={styles.heroTitle}>{card.title}</Text>
              <Text style={styles.heroSubtitle}>{card.short}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {CARDS.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{activeCard.title}</Text>
        <Text style={styles.sectionDescription}>{activeCard.description}</Text>

        {/* BANNER */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.bannerCard}
          onPress={() => setImageModalVisible(true)}
        >
          <Image
            source={{ uri: homeBanners[activeIndex]?.imageUrl }}
            style={styles.bannerImage}
          />

          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>{activeCard.title}</Text>

            <TouchableOpacity style={styles.ctaButton} onPress={handleCtaPress}>
              <Text style={styles.ctaText}>{BUTTON_LABELS[activeCard.key]}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* IMAGE MODAL */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setImageModalVisible(false)}>
          <View style={styles.modalContent}>
            <Ionicons
              name="close"
              size={28}
              color="#fff"
              style={styles.modalClose}
            />
            <Image
              source={{ uri: homeBanners[activeIndex]?.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  carouselWrapper: {
    height: 220,
  },

  heroCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },

  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#eaeaea',
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.4,
    marginHorizontal: 4,
  },

  dotActive: {
    opacity: 1,
  },

  content: {
    padding: 24,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
  },

  sectionDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },

  bannerCard: {
    marginTop: 28,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
  },

  bannerImage: {
    height: 200,
    width: '100%',
  },

  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
    justifyContent: 'flex-end',
  },

  bannerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },

  modalContent: {
    height: '80%',
  },

  modalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },

  modalImage: {
    width: '100%',
    height: '100%',
  },
});
