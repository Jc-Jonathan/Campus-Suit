import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  LoanApplicantDetail: { application: any };
  // Add other screen params here as needed
};

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/loanApplys';

type LoanApplication = {
  _id: string;
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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchApplications = async () => {
  try {
    const response = await axios.get(API_URL);
    // Check if the response has a data property with the applications array
    const apps = response.data?.data || response.data || [];
    setApplications(Array.isArray(apps) ? apps : []);
  } catch (err) {
    setError('Failed to fetch loan applications');
    console.error('Error fetching applications:', err);
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
        applications.map((app) => (
          <TouchableOpacity 
            key={app._id} 
            style={styles.card}
            onPress={() => navigation.navigate('LoanApplicantDetail', { application: app })}
          >
            <Text style={styles.applicantName}>{app.fullName}</Text>
            <Text style={styles.loanTitle}>{app.loanTitle}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>{new Date(app.submissionDate).toLocaleDateString()}</Text>
              <Text style={styles.detailText}>•</Text>
              <Text style={styles.detailText}>{app.gender}</Text>
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
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.amount}>${app.amount.toLocaleString()}</Text>
            {app.interestRate !== undefined && app.interestRate !== null && (
              <Text style={styles.interestRate}>{app.interestRate}% APR</Text>
            )}
          </TouchableOpacity>
        ))
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
