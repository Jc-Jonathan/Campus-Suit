import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminNavigationProp, AdminStackParamList } from '../../../navigation/AdminStack';
import { useNotifications } from '../../../contexts/NotificationContext';

type ApplicationData = {
  _id?: string;
  id?: string;
  applicationId?: number;
  // Personal Information
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  studentId?: string;
  homeAddress?: string;
  // Academic Information
  program?: string;
  yearOfStudy?: string;
  // Loan Details
  loanTitle?: string;
  amount?: number;
  repaymentPeriod?: string;
  purpose?: string;
  interestRate?: number;
  // Document URLs
  idDocumentUrl?: string;
  schoolIdDocumentUrl?: string;
  agreementDocumentUrl?: string;
  // Status and dates
  status?: 'pending' | 'approved' | 'rejected';
  submissionDate?: string;
  createdAt?: string;
  loanStartAt?: string;
  loanEndAt?: string;
  // Additional fields
  signature?: string;
  confirmAccurate?: boolean;
  agreeTerms?: boolean;
  understandRisk?: boolean;
};

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailItem = ({ label, value }: DetailItemProps) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value !== null && value !== undefined ? value.toString() : 'N/A'}</Text>
  </View>
);

const DocumentItem = ({ label, url, onPress }: { label: string; url?: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.documentItem} onPress={onPress} disabled={!url}>
    <View style={styles.documentLeft}>
      <MaterialIcons 
        name={url ? 'description' : 'error-outline'} 
        size={24} 
        color={url ? '#0d6efd' : '#dc3545'} 
      />
      <Text style={styles.documentName}>{label}</Text>
    </View>
    {url ? (
      <MaterialIcons name="download" size={24} color="#0d6efd" />
    ) : (
      <Text style={styles.missingText}>Missing</Text>
    )}
  </TouchableOpacity>
);

export const LoanApplicantDetail = () => {
  const route = useRoute<RouteProp<AdminStackParamList, 'LoanApplicantDetail'>>();
  const navigation = useNavigation<AdminNavigationProp>();
  const { applicationId } = route.params;
  const { addNotification } = useNotifications();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(true);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setError('No application ID provided');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://campus-suit-szub.onrender.com/api/loanApplys/${applicationId}`,
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data && response.data.success && mounted) {
        console.log('📋 API Response Data:', JSON.stringify(response.data.data, null, 2));
        setApplication(response.data.data);
      }
    } catch (err: any) {
      if (mounted) {
        console.error('Error fetching application:', err);
        if (err.response?.status === 404) {
          setError('Application not found');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection.');
        } else {
          setError('Failed to load application data');
        }
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [applicationId, mounted]);

  useEffect(() => {
    fetchApplication();
    
    return () => {
      setMounted(false);
    };
  }, [fetchApplication]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0d6efd" style={styles.centered} />
      </View>
    );
  }

  if (error || !application) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'No application data available'}</Text>
      </View>
    );
  }

  const handleDownload = async (url: string | null | undefined, documentName: string) => {
    if (!url || !mounted) {
      if (mounted) {
        Alert.alert('Error', 'Document URL is not available');
      }
      return;
    }

    try {
      setLoading(true);
      
      let fileUrl = url;
      if (!url.startsWith('http')) {
        fileUrl = `https://campus-suit-szub.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
      }

      try {
        new URL(fileUrl);
      } catch {
        throw new Error('Invalid document URL');
      }

      console.log('📥 Downloading document:', documentName);
      console.log('🔗 URL:', fileUrl);
      
      const fileName = documentName || fileUrl.split('/').pop()?.split('?')[0] || 'document.pdf';
      
      Alert.alert(
        'Download Document',
        `Download "${fileName}"?`,
        [
          {
            text: 'Open in Browser',
            onPress: async () => {
              try {
                if (!mounted) return;
                console.log('🌐 Opening in browser:', fileUrl);
                await Linking.openURL(fileUrl);
              } catch (browserError) {
                console.error('❌ Browser error:', browserError);
                if (mounted) {
                  Alert.alert('Error', 'Could not open in browser. Please try again.');
                }
              }
            },
          },
          {
            text: 'Share Link',
            onPress: async () => {
              try {
                if (!mounted) return;
                console.log('📤 Sharing link:', fileUrl);
                await Share.share({
                  message: `Document: ${fileName}\n${fileUrl}`,
                  title: fileName,
                });
              } catch (shareError) {
                console.error('❌ Share error:', shareError);
                if (mounted) {
                  Alert.alert('Error', 'Could not share document link.');
                }
              }
            },
          },
          {
            text: 'Copy URL',
            onPress: async () => {
              try {
                if (!mounted) return;
                console.log('📋 Copying URL:', fileUrl);
                await Share.share({
                  message: fileUrl,
                  title: 'Document URL',
                });
                if (mounted) {
                  Alert.alert('Success', 'Document URL copied to clipboard!');
                }
              } catch (copyError) {
                console.error('❌ Copy error:', copyError);
                if (mounted) {
                  Alert.alert('Error', 'Could not copy URL.');
                }
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error handling download:', error);
      if (mounted) {
        Alert.alert(
          'Download Error',
          'Failed to process document. Please try again or contact support if the issue persists.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!application || !mounted) return;
    
    try {
      if (newStatus === 'approved') {
        setApproving(true);
      } else {
        setRejecting(true);
      }
      
      const appId = application._id || application.id;
      if (!appId) {
        throw new Error('Application ID not found');
      }
      
      // Update application status - backend will automatically send email
      const response = await axios.patch(
        `https://campus-suit-szub.onrender.com/api/loanApplys/${appId}`,
        { status: newStatus },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success && mounted) {
        // Create notification for the customer
        if (application.email && addNotification) {
          try {
            await addNotification({
              message: `Your loan application for "${application.loanTitle || 'N/A'}" has been ${newStatus}`,
              category: 'LOAN',
              targetUsers: [application.email],
              shopInfo: {
                customerEmail: application.email,
                loanDetails: {
                  applicationId: appId,
                  loanTitle: application.loanTitle,
                  amount: application.amount,
                  status: newStatus,
                  fullName: application.fullName
                }
              }
            });
            console.log('🔔 Notification created for:', application.email);
          } catch (notificationError) {
            console.error('❌ Failed to create notification:', notificationError);
            // Continue even if notification fails
          }
        }

        Alert.alert(
          'Success', 
          `Application has been ${newStatus}. ${application.fullName || 'Applicant'} has been notified via email from the backend.`,
          [
            { 
              text: 'OK', 
              onPress: () => mounted && navigation.goBack()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      if (mounted) {
        if (error.code === 'ECONNABORTED') {
          Alert.alert('Timeout', 'Request timed out. Please try again.');
        } else if (error.response?.status === 404) {
          Alert.alert('Error', 'Application not found');
        } else {
          Alert.alert('Error', 'Failed to update application status');
        }
      }
    } finally {
      if (mounted) {
        setApproving(false);
        setRejecting(false);
      }
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${month} ${day}, ${year} at ${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Application ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Information</Text>
          <DetailItem label="Application ID" value={application.applicationId} />
          <DetailItem label="Full Name" value={application.fullName} />
          <DetailItem label="Email" value={application.email} />
          <DetailItem label="Phone" value={application.phone} />
          <DetailItem label="Home Address" value={application.homeAddress} />
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <DetailItem 
            label="Date of Birth" 
            value={safeFormatDate(application.dob)} 
          />
          <DetailItem label="Gender" value={application.gender} />
         
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occupation Information</Text>
           <DetailItem label="Occupation" value={application.studentId} />
          <DetailItem label="Occupation ID" value={application.program} />
          <DetailItem label="Year of Occcupation" value={application.yearOfStudy} />
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          <DetailItem label="Loan Title" value={application.loanTitle} />
          <DetailItem label="Amount" value={application.amount ? `$${application.amount.toLocaleString()}` : 'N/A'} />
          <DetailItem label="Interest Rate" value={application.interestRate !== undefined && application.interestRate !== null ? `${application.interestRate}% APR` : 'N/A'} />
          <DetailItem label="Repayment Period" value={application.repaymentPeriod} />
          <DetailItem label="Purpose" value={application.purpose} />
        </View>

        {/* Application Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <DetailItem 
            label="Submission Date" 
            value={formatDate(application.submissionDate)} 
          />
          <DetailItem 
            label="Created Date" 
            value={formatDate(application.createdAt)} 
          />
          <View style={[styles.statusContainer, {
            backgroundColor: application.status === 'approved' ? '#d4edda' : 
                            application.status === 'rejected' ? '#f8d7da' : '#fff3cd',
            borderColor: application.status === 'approved' ? '#c3e6cb' : 
                        application.status === 'rejected' ? '#f5c6cb' : '#ffeeba'
          }]}>
            <Text style={[styles.statusText, {
              color: application.status === 'approved' ? '#155724' : 
                    application.status === 'rejected' ? '#721c24' : '#856404'
            }]} >
              {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Agreement Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement Information</Text>
          <DetailItem label="Signature" value={application.signature ? 'Provided' : 'Not Provided'} />
          <DetailItem label="Information Confirmed Accurate" value={application.confirmAccurate ? 'Yes' : 'No'} />
          <DetailItem label="Terms Agreed" value={application.agreeTerms ? 'Yes' : 'No'} />
          <DetailItem label="Risk Understood" value={application.understandRisk ? 'Yes' : 'No'} />
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <DocumentItem 
            label="National ID/ Passport Document" 
            url={application.idDocumentUrl}
            onPress={() => application.idDocumentUrl && handleDownload(application.idDocumentUrl, 'ID Document')}
          />
          <DocumentItem 
            label="Occupation ID Document" 
            url={application.schoolIdDocumentUrl}
            onPress={() => application.schoolIdDocumentUrl && handleDownload(application.schoolIdDocumentUrl, 'School ID Document')}
          />
          <DocumentItem 
            label="Agreement Document" 
            url={application.agreementDocumentUrl}
            onPress={() => application.agreementDocumentUrl && handleDownload(application.agreementDocumentUrl, 'Agreement Document')}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {application.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleStatusUpdate('rejected')}
            disabled={rejecting}
          >
            {rejecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reject</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.approveButton]}
            onPress={() => handleStatusUpdate('approved')}
            disabled={approving}
          >
            {approving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Approve</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, 
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    marginLeft: 12,
    fontSize: 15,
    color: '#212529',
  },
  missingText: {
    color: '#dc3545',
    fontStyle: 'italic',
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});

export default LoanApplicantDetail;