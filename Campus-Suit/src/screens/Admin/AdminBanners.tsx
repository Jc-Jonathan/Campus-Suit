import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../../theme/theme';
import { uploadImage } from '../../utils/uploadImage';

const API_BASE = 'http://192.168.31.130:5000';

export const AdminBanners: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [screen, setScreen] = useState('HOME');
  const [position, setPosition] = useState('CAROUSEL');
  const [priority, setPriority] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const [banners, setBanners] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // =========================
  // FETCH BANNERS
  // =========================
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/banners?admin=true`);
      const json = await res.json();
      setBanners(json.data || []);
    } catch {
      Alert.alert('Error', 'Failed to load banners');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // =========================
  // IMAGE PICK & UPLOAD
  // =========================
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setLoading(true);
        const url = await uploadImage(result.assets[0].uri);
        setImageUrl(url);
      }
    } catch {
      Alert.alert('Error', 'Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FRONTEND DUPLICATE CHECK
  // =========================
  // FRONTEND DUPLICATE CHECK
const bannerExists = () => {
  return banners.some(
    (b) =>
      b.screen === screen &&
      b.position === position &&
      b.priority === Number(priority) &&
      b._id !== editingId
  );
};


  // =========================
  // SAVE / UPDATE BANNER
  // =========================
  const saveBanner = async () => {
    if (!imageUrl) {
      Alert.alert('Validation', 'Please upload a banner image');
      return;
    }

    // 🚫 FRONTEND DUPLICATE GUARD
    if (!editingId && bannerExists()) {
      Alert.alert(
        'Banner Exists',
        'A banner already exists for this screen and position.\nPlease delete it first.'
      );
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_BASE}/api/banners/${editingId}`
        : `${API_BASE}/api/banners`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          screen,
          position,
          priority: Number(priority),
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to save banner');
        return;
      }

      Alert.alert('Success', editingId ? 'Banner updated' : 'Banner added');
      resetForm();
      fetchBanners();
    } catch {
      Alert.alert('Error', 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT BANNER
  // =========================
  const editBanner = (banner: any) => {
    setEditingId(banner._id);
    setImageUrl(banner.imageUrl);
    setScreen(banner.screen);
    setPosition(banner.position);
    setPriority(String(banner.priority));
    setIsActive(banner.isActive);

    // 🔥 GUARANTEED SCROLL AFTER RENDER
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  // =========================
  // DELETE BANNER
  // =========================
  const deleteBanner = (id: string) => {
    Alert.alert('Confirm', 'Delete this banner?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/api/banners/${id}`, {
              method: 'DELETE',
            });

            if (!res.ok) throw new Error();

            Alert.alert('Deleted', 'Banner deleted');
            fetchBanners();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setImageUrl(null);
    setScreen('HOME');
    setPosition('CAROUSEL');
    setPriority('1');
    setIsActive(true);
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {editingId ? 'Edit Banner' : 'Add Banner'}
      </Text>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Tap to upload banner</Text>
        )}
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

      {/* SCREEN */}
      <Text style={styles.label}>Screen</Text>
      <Picker selectedValue={screen} enabled={!editingId} onValueChange={setScreen}>
        <Picker.Item label="Home" value="HOME" />
        <Picker.Item label="Loan Detail" value="LOAN_DETAIL" />
        <Picker.Item label="Checkout" value="CHECKOUT" />
      </Picker>

      {/* POSITION */}
      <Text style={styles.label}>Position</Text>
      <Picker selectedValue={position} enabled={!editingId} onValueChange={setPosition}>
        <Picker.Item label="Carousel" value="CAROUSEL" />
        <Picker.Item label="Hero" value="HERO" />
        <Picker.Item label="QR Payment" value="QR_PAYMENT" />
      </Picker>

      {/* PRIORITY */}
      <Text style={styles.label}>Priority</Text>
      <TextInput
        style={styles.input}
        value={priority}
        placeholder="1 is for Loan , 2 is for scholarship and 3 for products"
        keyboardType="number-pad"
        onChangeText={setPriority}
      />

      {/* ACTIVE */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      {/* SAVE */}
      <TouchableOpacity style={styles.saveButton} onPress={saveBanner} disabled={loading}>
        <Text style={styles.saveText}>
          {editingId ? 'Update Banner' : 'Save Banner'}
        </Text>
      </TouchableOpacity>

      {/* LIST */}
      <Text style={[styles.title, { marginTop: 30 }]}>Available Banners</Text>

      {banners.map((banner) => (
        <View key={banner._id} style={styles.bannerCard}>
          <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
          <Text>Screen: {banner.screen}</Text>
          <Text>Position: {banner.position}</Text>
          <Text>Status: {banner.isActive ? 'Active' : 'Inactive'}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.editBtn} onPress={() => editBanner(banner)}>
              <Text>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteBanner(banner._id)}
            >
              <Text style={{ color: '#fff' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  imageBox: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageText: { fontWeight: '600' },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bannerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  bannerImage: {
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
  },
});
