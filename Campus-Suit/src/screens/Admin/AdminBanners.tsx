import React, { useState } from 'react';
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [screen, setScreen] = useState('HOME');
  const [position, setPosition] = useState('CAROUSEL');
  const [priority, setPriority] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // =========================
  // PICK & UPLOAD IMAGE
  // =========================
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!res.canceled && res.assets[0]?.uri) {
        setLoading(true);
        const url = await uploadImage(res.assets[0].uri);
        setImageUrl(url);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE BANNER
  // =========================
  const saveBanner = async () => {
    if (!imageUrl) {
      Alert.alert('Validation', 'Please upload a banner image');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          screen,
          position,
          priority: Number(priority),
          isActive,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        throw new Error('Failed to save banner');
      }

      Alert.alert('Success', 'Banner added successfully');

      // RESET FORM
      setImageUrl(null);
      setPriority('1');
      setIsActive(true);
      setScreen('HOME');
      setPosition('CAROUSEL');
    } catch (err) {
      Alert.alert('Error', 'Could not save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Banner</Text>

      {/* IMAGE UPLOAD */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Tap to upload banner image</Text>
        )}
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

      {/* SCREEN */}
      <Text style={styles.label}>Screen</Text>
      <Picker selectedValue={screen} onValueChange={setScreen}>
        <Picker.Item label="Home" value="HOME" />
        <Picker.Item label="Loan Detail" value="LOAN_DETAIL" />
        <Picker.Item label="Checkout" value="CHECKOUT" />
      </Picker>

      {/* POSITION */}
      <Text style={styles.label}>Position</Text>
      <Picker selectedValue={position} onValueChange={setPosition}>
        <Picker.Item label="Home Carousel" value="CAROUSEL" />
        <Picker.Item label="Loan Hero" value="HERO" />
        <Picker.Item label="Checkout QR" value="QR_PAYMENT" />
      </Picker>

      {/* PRIORITY */}
      <Text style={styles.label}>Priority (Lower shows first)</Text>
      <TextInput
        value={priority}
        onChangeText={setPriority}
        keyboardType="number-pad"
        style={styles.input}
      />

      {/* ACTIVE */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveBanner}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? 'Saving...' : 'Save Banner'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    color: theme.colors.text,
  },
  imageBox: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
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
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
