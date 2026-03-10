import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Scholarship } from './ScholaComp/scholarship';
import Admission from './ScholaComp/Admission';
import Applicant from './ScholaComp/Applicant';
import { Notificationsc as Notifications } from './ScholaComp/Notificationsc';

type ViewType = 'scholarships' | 'admissions' | 'applications' | 'notifications';

export const AdminScholarships = () => {
  const [currentView, setCurrentView] = useState<ViewType>('scholarships');

  /* ---------- RIGHT SIDE SCREENS ---------- */

  


  const renderRightContent = () => {
    switch (currentView) {
      case 'scholarships':
        return <Scholarship />;
      case 'admissions':
        return <Admission />;
      case 'applications':
        return <Applicant />; // Using Applicant instead of Applications
      case 'notifications':
        return <Notifications />;
      default:
        return null;
    }
  };

  /* ---------- MAIN LAYOUT ---------- */

  return (
    <View style={styles.container}>
      {/* LEFT SIDEBAR */}
      <View style={styles.sidebar}>
        <SidebarButton
          icon="add-circle-outline"
          label="Scholarships"
          active={currentView === 'scholarships'}
          onPress={() => setCurrentView('scholarships')}
        />
        <SidebarButton
          icon="school-outline"
          label="Admissions"
          active={currentView === 'admissions'}
          onPress={() => setCurrentView('admissions')}
        />
        <SidebarButton
          icon="document-text-outline"
          label="Applications"
          active={currentView === 'applications'}
          onPress={() => setCurrentView('applications')}
        />
        <SidebarButton
          icon="notifications-outline"
          label="Notifications"
          active={currentView === 'notifications'}
          onPress={() => setCurrentView('notifications')}
        />
      </View>

      {/* RIGHT CONTENT - Let the inner component handle scrolling */}
      <View style={styles.content}>
        {renderRightContent()}
      </View>
    </View>
  );
};

/* ---------- SIDEBAR BUTTON ---------- */

const SidebarButton = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.sideBtn, active && styles.sideBtnActive]}
  >
    <Ionicons
      name={icon}
      size={22}
      color={active ? '#4CAF50' : '#fff'}
    />
    <Text style={[styles.sideText, active && styles.sideTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ---------- STYLES (MATCH IMAGE) ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 140,
    backgroundColor: '#2c3e50',
    paddingTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  sideBtnActive: {
    backgroundColor: '#34495e',
  },
  sideText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  sideTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },

  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#2c3e50',
  },

  placeholder: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: '#999',
  },

  addBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },

  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
