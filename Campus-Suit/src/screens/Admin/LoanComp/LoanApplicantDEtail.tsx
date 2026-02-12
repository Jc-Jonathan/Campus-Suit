import React, { useState } from 'react';
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

type RootStackParamList = {
  LoanApplicant: undefined;
  LoanApplicantDetail: { application: any };
  LoanState: undefined;
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
  const route = useRoute<RouteProp<RootStackParamList, 'LoanApplicantDetail'>>();
  const navigation = useNavigation<any>();
  const { application } = route.params;
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (url: string | null | undefined, documentName: string) => {
    if (!url) {
      Alert.alert('Error', 'Document URL is not available');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure the URL is absolute and handle Cloudinary URLs
      let fileUrl = url;
      if (!url.startsWith('http')) {
        // If it's a relative path, prepend the base URL
        fileUrl = `https://pandora-cerebrational-nonoccidentally.ngrok-free.dev${url.startsWith('/') ? '' : '/'}${url}`;
      }

      console.log('📥 Downloading document:', documentName);
      console.log('🔗 URL:', fileUrl);
      
      // Extract filename from URL for better user experience
      const fileName = documentName || fileUrl.split('/').pop()?.split('?')[0] || 'document.pdf';
      
      // Show download options dialog
      Alert.alert(
        'Download Document',
        `Download "${fileName}"?`,
        [
          {
            text: 'Open in Browser',
            onPress: async () => {
              try {
                console.log('🌐 Opening in browser:', fileUrl);
                await Linking.openURL(fileUrl);
              } catch (browserError) {
                console.error('❌ Browser error:', browserError);
                Alert.alert('Error', 'Could not open in browser. Please try again.');
              }
            },
          },
          {
            text: 'Share Link',
            onPress: async () => {
              try {
                console.log('📤 Sharing link:', fileUrl);
                await Share.share({
                  message: `Document: ${fileName}`,
                  url: fileUrl,
                  title: fileName,
                });
              } catch (shareError) {
                console.error('❌ Share error:', shareError);
                Alert.alert('Error', 'Could not share document link.');
              }
            },
          },
          {
            text: 'Copy URL',
            onPress: async () => {
              try {
                console.log('📋 Copying URL:', fileUrl);
                await Share.share({
                  message: fileUrl,
                  title: 'Document URL',
                });
                Alert.alert('Success', 'Document URL copied to clipboard!');
              } catch (copyError) {
                console.error('❌ Copy error:', copyError);
                Alert.alert('Error', 'Could not copy URL.');
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
      Alert.alert(
        'Download Error',
        'Failed to process document. Please try again or contact support if the issue persists.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!application) return;
    
    try {
      // Set the appropriate loading state
      if (newStatus === 'approved') {
        setApproving(true);
      } else {
        setRejecting(true);
      }
      
      // Update the status - backend will handle email notification
      const response = await axios.patch(
        `https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/loanApplys/${application._id}`,
        { status: newStatus },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success', 
          `Application has been ${newStatus}. ${application.fullName} has been notified.`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('AdminLoans', { screen: 'AdminLoans', params: { activeScreen: 'state' } })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update application status');
    } finally {
      // Reset both loading states
      setApproving(false);
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <DetailItem label="Full Name" value={application.fullName} />
          <DetailItem 
            label="Date of Birth" 
            value={application.dob ? new Date(application.dob).toLocaleDateString() : 'N/A'} 
          />
          <DetailItem label="Gender" value={application.gender} />
          <DetailItem label="Email" value={application.email} />
          <DetailItem label="Phone" value={application.phone} />
          <DetailItem label="Student ID" value={application.studentId} />
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <DetailItem label="Program" value={application.program} />
          <DetailItem label="Year of Study" value={application.yearOfStudy} />
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          <DetailItem label="Loan Title" value={application.loanTitle} />
          <DetailItem label="Amount" value={`$${application.amount?.toLocaleString()}`} />
          <DetailItem label="Interest Rate" value={application.interestRate !== undefined && application.interestRate !== null ? `${application.interestRate}% APR` : 'N/A'} />
          <DetailItem label="Repayment Period" value={application.repaymentPeriod} />
          <DetailItem label="Purpose" value={application.purpose} />
          <DetailItem 
            label="Application Date" 
            value={formatDate(application.submissionDate || application.createdAt)} 
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
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <DocumentItem 
            label="ID Document" 
            url={application.idDocumentUrl}
            onPress={() => application.idDocumentUrl && handleDownload(application.idDocumentUrl, 'ID Document')}
          />
          <DocumentItem 
            label="School ID Document" 
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
    paddingBottom: 100, // Extra padding for the action buttons
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
});

export default LoanApplicantDetail;