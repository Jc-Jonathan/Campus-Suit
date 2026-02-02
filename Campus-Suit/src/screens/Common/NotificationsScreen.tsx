import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

type FilterType = 'ALL' | 'ANNOUNCEMENT' | 'SCHOLARSHIP';

type Notification = {
  _id: string;
  message: string;
  category: 'ANNOUNCEMENT' | 'SCHOLARSHIP';
  pdfUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
};

export default function NotificationScreen() {
  const {
    notifications,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useNotifications();

  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  /* ================= FETCH BASED ON FILTER ================= */
  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      if (filter === 'ALL') {
        await fetchNotifications();
      } else {
        await fetchNotifications(filter);
      }

      await fetchUnreadCount();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [filter])
  );

  /* ================= DOWNLOAD ================= */
  const confirmDownload = (url: string, fileName?: string) => {
    Alert.alert(
      'Download Document',
      'Do you want to download this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => downloadAndOpen(url, fileName) },
      ]
    );
  };

  const downloadAndOpen = async (url: string, fileName?: string) => {
    try {
      const dir = FileSystem.cacheDirectory + 'downloads/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      const safeName =
        fileName?.replace(/[^a-zA-Z0-9._-]/g, '_') ||
        `document_${Date.now()}.pdf`;

      const fileUri = dir + safeName;

      const result = await FileSystem.downloadAsync(url, fileUri);

      if (!result.uri) throw new Error('Download failed');

      // Android intent
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(result.uri);
          await IntentLauncher.startActivityAsync(
            'android.intent.action.VIEW',
            {
              data: contentUri,
              flags: 1,
              type: 'application/pdf',
            }
          );
          return;
        } catch {}
      }

      // Fallback (iOS + Android)
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Open Document',
      });
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Unable to open document. Please ensure a PDF reader is installed.'
      );
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No notifications found</Text>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <View style={{ flex: 1 }}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        {['ALL', 'ANNOUNCEMENT', 'SCHOLARSHIP'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList<Notification>
        data={notifications}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadNotifications}
          />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const unread =
            !readIds.has(item._id) &&
            !item.readBy?.includes(user?._id || '');

          return (
            <TouchableOpacity
              style={[styles.card, unread && styles.unreadCard]}
              activeOpacity={0.85}
              onPress={() => {
                setReadIds(prev => new Set(prev).add(item._id));
                markAsRead(item._id);
              }}
            >
              {/* CATEGORY */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              {/* MESSAGE */}
              <Text style={[styles.message, unread && styles.unreadText]}>
                {item.message}
              </Text>

              {/* DOCUMENT */}
              {item.category === 'SCHOLARSHIP' && item.pdfUrl && (
                <TouchableOpacity
                  style={styles.docBox}
                  onPress={() =>
                    confirmDownload(item.pdfUrl!, item.fileName)
                  }
                >
                  <Text style={styles.docText}>
                    📄 {item.fileName || 'Scholarship Document'}
                  </Text>
                  <Text style={styles.docHint}>Tap to download</Text>
                </TouchableOpacity>
              )}

              {/* DATE */}
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeff5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1,
  },
  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  filterActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#f5f7fa',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#f8fafc',
    paddingLeft: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '600',
  },
  docBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  docText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  docHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
