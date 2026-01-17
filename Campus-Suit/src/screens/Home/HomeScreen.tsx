import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Image, TouchableOpacity, Modal, Pressable, BackHandler, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderTab } from '../../components/Header';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARDS = [
  {
    key: 'loan',
    title: 'Easy Campus Loans',
    short: 'Quick access to student-friendly loans.',
    description:
      'Get flexible loan options designed for students. Compare offers, check eligibility instantly, and track your applications in one place.',
  },
  {
    key: 'scholarship',
    title: 'Scholarship Opportunities',
    short: 'Discover scholarships that match you.',
    description:
      'Browse curated scholarships based on your profile, eligibility, and interests. Save opportunities and apply directly from the app.',
  },
  {
    key: 'store',
    title: 'Campus Store Deals',
    short: 'Best deals on books, gadgets, and more.',
    description:
      'Explore exclusive discounts on textbooks, gadgets, and campus essentials. Order online and track your purchases easily.',
  }
];



const BUTTON_LABELS: Record<string, string> = {
  loan: 'Get a loan quote',
  scholarship: 'Find scholarships',
  store: 'Browse store deals',
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
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
      setActiveIndex(nextIndex);
    }, 4000);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Handle back button press if needed
      return false; // Return false to let the default back button behavior
    });

    return () => {
      clearInterval(interval);
      backHandler.remove(); // Proper way to remove the event listener
    };
  }, [activeIndex]);

  useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true }
      );

      return true; // ⛔ stop default back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [])
);


  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  const activeCard = CARDS[activeIndex];

  const handleCtaPress = () => {
    switch (activeCard.key) {
      case 'loan':
        navigation.navigate('Finance' as never);
        break;
      case 'scholarship':
        navigation.navigate('HomeScholarships' as never);
        break;
      case 'store':
        navigation.navigate('Store' as never);
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderTab />
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {CARDS.map(card => (
            <View key={card.key} style={[styles.card, { width }]}>                
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardShort}>{card.short}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {CARDS.map((card, index) => (
            <View
              key={card.key}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{activeCard.title}</Text>
        <Text style={styles.detailsDescription}>{activeCard.description}</Text>

        <View style={styles.imageCardContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={openImageModal}>
            <Image
               source={{ uri: homeBanners[activeIndex]?.imageUrl }}
               resizeMode="cover"
              style={styles.imageCard}
               />

            
            <View style={styles.imageOverlay}>
              <Text style={styles.imageTitle}>{activeCard.title}</Text>
              <View style={styles.imageButtonWrapper}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  activeOpacity={0.85}
                  onPress={handleCtaPress}
                >
                  <Text style={styles.ctaButtonLabel}>{BUTTON_LABELS[activeCard.key]}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeImageModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.8}
              onPress={closeImageModal}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
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
  carouselContainer: {
    height: 200,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardShort: {
    fontSize: 14,
    color: '#f5f5f5',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    opacity: 1,
  },
  detailsContainer: {
    flex: 1,
    padding: 24,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  detailsDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  imageCardContainer: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  imageCard: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'flex-end',
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  imageButtonWrapper: {
    alignSelf: 'flex-start',
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor:  theme.colors.primary,
  },
  ctaButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
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
