import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Loan } from './LoanComp/Loan';
import { LoanApplicant } from './LoanComp/LoanApplicant';
import { LoanState } from './LoanComp/LoanState';
import { LoanNotification } from './LoanComp/LoanNotification';

type ScreenType = 'loan' | 'applicant' | 'state' | 'notification';

type RootStackParamList = {
  AdminLoans: {
    screen: string;
    params: {
      activeScreen?: ScreenType;
    };
  };
};

export const AdminLoans = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminLoans'>>();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('loan');

  useEffect(() => {
    if (route.params?.params?.activeScreen) {
      setActiveScreen(route.params.params.activeScreen);
    }
  }, [route.params]);
  return (
    <View style={styles.container}>
      {/* LEFT SIDEBAR */}
      <View style={styles.leftPane}>
        <Text style={styles.headerTitle}>Exotic Store</Text>

        <View style={styles.menu}>
          {/* ADD LOAN */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setActiveScreen('loan')}
          >
            <MaterialIcons 
              name="request-page" 
              size={22} 
              style={[activeScreen === 'loan' ? styles.activeIcon : {color: '#fff'}]} 
            />
            <Text style={[styles.menuText, activeScreen === 'loan' && styles.activeMenuText]}>
              Add Loan
            </Text>
          </TouchableOpacity>

          {/* APPLICATIONS */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setActiveScreen('applicant')}
          >
            <MaterialIcons 
              name="description" 
              size={22} 
              style={activeScreen === 'applicant' ? styles.activeIcon : {color: '#fff'}} 
            />
            <Text style={[styles.menuText, activeScreen === 'applicant' && styles.activeMenuText]}>
              Applicants
            </Text>
          </TouchableOpacity>

          {/* LOAN STATE */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setActiveScreen('state')}
          >
            <Feather 
              name="layers" 
              size={22} 
              style={activeScreen === 'state' ? styles.activeIcon : {color: '#fff'}} 
            />
            <Text style={[styles.menuText, activeScreen === 'state' && styles.activeMenuText]}>
              Loan State
            </Text>
          </TouchableOpacity>

          {/* NOTIFICATIONS */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setActiveScreen('notification')}
          >
            <Ionicons 
              name="notifications-outline" 
              size={22} 
              style={activeScreen === 'notification' ? styles.activeIcon : {color: '#fff'}} 
            />
            <Text style={[styles.menuText, activeScreen === 'notification' && styles.activeMenuText]}>
              Notifications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RIGHT CONTENT AREA */}
      <View style={styles.rightPane}>
        {activeScreen === 'loan' && <Loan />}
        {activeScreen === 'applicant' && <LoanApplicant />}
        {activeScreen === 'state' && <LoanState />}
        {activeScreen === 'notification' && <LoanNotification />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
  },

  /* LEFT SIDEBAR */
  leftPane: {
    width: '38%',
    backgroundColor: '#2C3E50', // same as screenshots
    paddingTop: 24,
    paddingHorizontal: 14,
  },
  activeMenuButton: {
    // Remove background color and border
    // Change text and icon color to green
  },
  
  // Add styles for the active icon and text
  activeIcon: {
    color: '#4CAF50', // Green color for active icon
  },
  
  activeMenuText: {
    color: '#4CAF50', // Green color for active text
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },

  menu: {
    gap: 14,
  },

  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34495E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    paddingLeft: -10,
  },

  menuText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 14,
  },

  /* RIGHT SIDE */
  rightPane: {
    flex: 4,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
});
