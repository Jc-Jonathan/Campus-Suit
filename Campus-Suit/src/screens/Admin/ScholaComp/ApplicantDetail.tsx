import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.31.130:5000/api/scholarshipApplications';
const BASE_URL = 'http://192.168.31.130:5000';

export interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
}

const DetailItem = ({ label, value }: DetailItemProps) => (
  <View style={{ marginBottom: 8 }}>
    <Text style={{ fontWeight: 'bold', color: '#555' }}>{label}:</Text>
    <Text style={{ marginLeft: 10, color: '#333' }}>{value || 'N/A'}</Text>
  </View>
);

const ApplicantDetail = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      console.log('Fetching application with ID:', id);
      const res = await axios.get(`${API_URL}/${id}`);
      console.log('API Response:', res.data);
      setApp(res.data);
    } catch (err: any) {
      console.error('Error fetching application details:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
        Alert.alert('Error', `Failed to load application details: ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', err.message);
        Alert.alert('Error', `Failed to load application details: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      
      // Update the application status
      await axios.patch(`${API_URL}/${id}/status`, { status });
      
      // Prepare email content
      const emailSubject = status === 'approved' 
        ? `Congratulations on Your Scholarship Approval - ${app.scholarshipTitle}`
        : `Scholarship Application Status Update - ${app.scholarshipTitle}`;
      
      const emailMessage = status === 'approved'
        ? `Hello ${app.fullName},\n\nCongratulations! Your application for the ${app.scholarshipTitle} scholarship has been approved.\n\nYou applied for studying ${app.program} and we are pleased to inform you of your success.\n\nBest regards,\nCampus Support Team`
        : `Hello ${app.fullName},\n\nYour application for the ${app.scholarshipTitle} scholarship has been denied.\n\nWe encourage you to try applying again next time.\n\nGood day,\nCampus Support Team`;
      
      // Try to send email notification (don't fail if this doesn't work)
      try {
        await axios.post('http://192.168.31.130:5000/api/send-email', {
          to: app.email,
          subject: emailSubject,
          message: emailMessage,
          type: 'scholarship-status'
        });
        console.log('Email sent successfully to:', app.email);
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        // Continue with notification storage even if email fails
      }
      
      // Store notification in backend (try with simpler structure first)
      const notificationMessage = status === 'approved'
        ? `Congratulations! Your scholarship application for ${app.scholarshipTitle} has been approved.`
        : `Your scholarship application for ${app.scholarshipTitle} has been denied.`;
      
      try {
        // Try the standard notification endpoint first
        await axios.post('http://192.168.31.130:5000/api/notifications', {
          message: notificationMessage,
          category: 'SCHOLARSHIP',
          type: status === 'approved' ? 'SCHOLARSHIP_APPROVED' : 'SCHOLARSHIP_REJECTED',
          recipients: [app._id], // Send to the applicant
          createdBy: 'admin',
          applicantInfo: {
            fullName: app.fullName,
            email: app.email,
            scholarshipTitle: app.scholarshipTitle,
            program: app.program,
            status: status
          }
        });
        console.log('Notification stored successfully');
      } catch (notificationError) {
        console.warn('Notification storage failed:', notificationError);
        // Try with minimal structure
        try {
          await axios.post('http://192.168.31.130:5000/api/notifications', {
            message: notificationMessage,
            category: 'SCHOLARSHIP',
            recipients: [app._id],
            createdBy: 'admin'
          });
          console.log('Minimal notification stored successfully');
        } catch (minimalError) {
          console.warn('Minimal notification storage also failed:', minimalError);
          // Continue anyway - the status update was successful
        }
      }
      
      // Update the local state to reflect the change immediately
      setApp((prev: any | null) => prev ? { ...prev, status } : null);
      
      Alert.alert(
        'Success',
        `Application ${status.toUpperCase()} successfully!`
      );
      
      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating status:', err);
      let errorMessage = 'Failed to update application status';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = `Failed to update status: ${err.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDoc = async (path: string, docName: string) => {
    if (isDownloading) {
      Alert.alert('Please wait', 'A document is already being downloaded');
      return;
    }

    if (!path) {
      Alert.alert('Error', 'Document not found');
      return;
    }

    setIsDownloading(true);
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const url = `${BASE_URL}/${cleanPath}`;

    try {
      Alert.alert(
        'Download Document',
        `Do you want to download ${docName}?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setIsDownloading(false)
          },
          {
            text: 'Download',
            onPress: async () => {
              try {
                await Linking.openURL(url);
              } catch (err) {
                console.error('Error opening URL:', err);
                Alert.alert('Error', 'Could not open the document. Please try again.');
              } finally {
                setIsDownloading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error showing download dialog:', error);
      setIsDownloading(false);
    }
  };
  
  // Define the document item type
  interface DocumentItem {
    key: string;
    label: string;
    url: string;
  }

  // Document items to render
  const documentItems: DocumentItem[] = [];
  
  // Add all document URLs from the application
  if (app) {
    // Standard document fields
    const documentFields = [
      { key: 'nationalIdUrl', label: 'National ID' },
      { key: 'transcriptUrl', label: 'Academic Transcript' },
      { key: 'recommendationUrl', label: 'Recommendation Letter' },
      { key: 'enrollmentProofUrl', label: 'Enrollment Proof' },
      { key: 'otherDocumentUrl', label: 'Additional Document' },
    ];

    // Check each document field and add to the list if it exists
    documentFields.forEach(({ key, label }) => {
      if (app[key] && typeof app[key] === 'string' && app[key].trim() !== '') {
        documentItems.push({
          key,
          label,
          url: app[key]
        });
      }
    });

    // Also check for documents in a nested documents object (if present)
    if (app.documents && typeof app.documents === 'object') {
      Object.entries(app.documents).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
          const formattedKey = key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace('Url', '');
          
          documentItems.push({
            key: `doc_${key}`,
            label: formattedKey,
            url: value
          });
        }
      });
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!app) {
    return (
      <View style={styles.center}>
        <Text>No application found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>{app.scholarshipTitle}</Text>

      {/* APPLICANT INFO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Details</Text>
        <DetailItem label="Status" value={app.status} />
        <DetailItem label="Applied On" value={new Date(app.createdAt).toLocaleDateString()} />
      </View>

      {/* APPLICANT INFO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applicant Information</Text>
        <Text style={styles.item}>Full Name: {app.fullName}</Text>
        <Text style={styles.item}>Gender: {app.gender}</Text>
        <Text style={styles.item}>Date of Birth: {app.dob}</Text>
        <Text style={styles.item}>Country: {app.country}</Text>
        <Text style={styles.item}>Email: {app.email}</Text>
        <Text style={styles.item}>
          Phone: {app.countryCode}{app.phoneLocal}
        </Text>
        <Text style={styles.item}>Address:{app.address}</Text>
      </View>

      {/* ACADEMIC INFO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <Text style={styles.item}>Student ID: {app.studentId}</Text>
        <Text style={styles.item}>Institution: {app.institution}</Text>
        <Text style={styles.item}>Program: {app.program}</Text>
        <Text style={styles.item}>Year of Study: {app.yearOfStudy}</Text>
        <Text style={styles.item}>Expected Graduation: {app.expectedGraduation}</Text>
        <Text style={styles.item}>GPA: {app.gpa}</Text>
      </View>

      {/* DOCUMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded Documents</Text>
        {documentItems.length > 0 ? (
          documentItems.map((doc) => {
            // Extract filename from URL for display
            const fileName = doc.url.split('/').pop() || 'document';
            const fileType = fileName.split('.').pop()?.toUpperCase() || 'FILE';
            
            return (
              <TouchableOpacity
                key={doc.key}
                style={styles.documentItem}
                onPress={() => downloadDoc(doc.url, doc.label)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.documentTitle}>{doc.label}</Text>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {fileName}
                  </Text>
                </View>
                <View style={styles.documentRight}>
                  <Text style={styles.fileType}>{fileType}</Text>
                  <Text style={styles.downloadText}>Download</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noDocuments}>No documents available for this application</Text>
        )}
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.reject}
          onPress={() => updateStatus('rejected')}
        >
          <Text style={styles.btnText}>REJECT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.approve}
          onPress={() => updateStatus('approved')}
        >
          <Text style={styles.btnText}>APPROVE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ApplicantDetail;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  documentText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  downloadText: {
    color: '#0d6efd',
    fontWeight: '600',
    marginLeft: 10,
  },
  noDocuments: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    marginVertical: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  item: {
    fontSize: 14,
    marginBottom: 6,
  },

  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  documentRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  fileType: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 40,
  },

  approve: {
    flex: 1,
    backgroundColor: 'green',
    padding: 15,
    marginLeft: 10,
    borderRadius: 6,
  },

  reject: {
    flex: 1,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 6,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

