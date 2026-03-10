import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { AdminNavigationProp, AdminStackParamList } from '../../../navigation/AdminStack';

const API_URL = 'https://campus-suit-szub.onrender.com';

type LoanApplication = {
  _id?: string;
  id?: string;
  fullName: string;
  loanTitle: string;
  submissionDate: string;
  gender: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  interestRate?: number;
};

export const LoanApplicant = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<AdminNavigationProp>();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Add timeout to prevent hanging
        const response = await axios.get(API_URL, { 
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // More robust data parsing
        let appsData = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            appsData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            appsData = response.data.data;
          } else if (response.data.loanApplications && Array.isArray(response.data.loanApplications)) {
            appsData = response.data.loanApplications;
          } else {
            console.log('Unexpected data structure:', response.data);
            appsData = [];
          }
        }
        
        // Filter out any invalid items
        const validApps = appsData.filter((app: any) => {
          if (!app || typeof app !== 'object') return false;
          const appId = app._id || app.id;
          return appId && typeof appId === 'string';
        });
        
        setApplications(validApps);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        
        // Handle different error types
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection.');
        } else if (err.code === 'NETWORK_ERROR') {
          setError('Network error. Please check internet connection.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to fetch applications: ${err.message || 'Unknown error'}`);
        }
        
        setApplications([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Loan Applications</Text>
      
      {applications.length === 0 ? (
        <Text style={styles.noData}>No loan applications found</Text>
      ) : (
        applications.map((app, index) => {
          if (!app || !(app._id || app.id)) return null;
          
          const appId = app._id || app.id;
          if (!appId) return null;
          
          // Safe date handling
          const safeSubmissionDate = app.submissionDate && 
            !isNaN(Date.parse(app.submissionDate)) ? 
            new Date(app.submissionDate).toLocaleDateString() : 'N/A';
          
          return (
            <TouchableOpacity 
              key={`${appId}-${index}`} // Use composite key for safety
              style={styles.card}
              onPress={() => {
                try {
                  // Navigate with ID only, not entire object
                  navigation.navigate('LoanApplicantDetail', { 
                    applicationId: appId 
                  });
                } catch (error) {
                  console.error('Navigation error:', error);
                  Alert.alert('Error', 'Cannot open application details');
                }
              }}
            >
              <Text style={styles.applicantName}>{app.fullName || 'N/A'}</Text>
              <Text style={styles.loanTitle}>{app.loanTitle || 'N/A'}</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                  {safeSubmissionDate}
                </Text>
                <Text style={styles.detailText}>•</Text>
                <Text style={styles.detailText}>{app.gender || 'N/A'}</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: app.status === 'approved' ? '#d4edda' : 
                                  app.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                  borderColor: app.status === 'approved' ? '#c3e6cb' : 
                              app.status === 'rejected' ? '#f5c6cb' : '#ffeeba'
                }]}>
                  <Text style={[styles.statusText, { 
                    color: app.status === 'approved' ? '#1a6b2dff' : 
                          app.status === 'rejected' ? '#e30e23ff' : '#856404'
                  }]}>
                    {(app.status || 'pending').charAt(0).toUpperCase() + (app.status || 'pending').slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.amount}>${(app.amount || 0).toLocaleString()}</Text>
              {typeof app.interestRate === 'number' && app.interestRate >= 0 && (
                <Text style={styles.interestRate}>{app.interestRate}% APR</Text>
              )}
            </TouchableOpacity>
          );
        }).filter(Boolean)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    marginBottom: 20,
    color: '#343a40',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  loanTitle: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6efd',
    marginTop: 4,
  },
  interestRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 2,
  },
  noData: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    margin: 20,
  },
});
