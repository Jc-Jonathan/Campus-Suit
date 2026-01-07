import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../theme/theme';

type LoansSection =
  | 'loanProducts'
  | 'loanApplications'
  | 'loanState'
  | 'pendingApplications'
  | 'approvedApplications'
  | 'rejectedApplications'
  | 'applicationDetails'
  | 'notifications';

type NotificationType = {
  id: string;
  type: 'banner' | 'message';
  content: string;
  createdAt: Date;
};

type LoanType = {
  loanName: string;
  description: string;
  interestRate: string;
  maxAmount: string;
  minAmount: string;
  loanTerms: string;
  eligibility: string;
  repaymentMethod: string;
  documentsRequired: string;
  termsAndConditions: string;
  isActive: boolean;
  id: string;
};

export const AdminLoans: React.FC = () => {
  const [activeSection, setActiveSection] = useState<LoansSection>('loanProducts');

  // Notification handlers
  const handleAddBanner = async () => {
    if (!bannerImage) return;
    
    try {
      const newNotification: NotificationType = {
        id: editingNotificationId || Date.now().toString(),
        type: 'banner',
        content: bannerImage,
        createdAt: new Date(),
      };

      if (editingNotificationId) {
        setNotifications(notifications.map(n => 
          n.id === editingNotificationId ? newNotification : n
        ));
      } else {
        setNotifications([...notifications, newNotification]);
      }
      
      setBannerImage(null);
      setEditingNotificationId(null);
    } catch (error) {
      console.error('Error handling banner:', error);
      // Consider showing an error message to the user
    }
  };

  const handleAddMessage = () => {
    if (!notificationMessage.trim()) return;
    
    try {
      const newNotification: NotificationType = {
        id: editingNotificationId || Date.now().toString(),
        type: 'message',
        content: notificationMessage.trim(),
        createdAt: new Date(),
      };

      if (editingNotificationId) {
        setNotifications(notifications.map(n => 
          n.id === editingNotificationId ? newNotification : n
        ));
      } else {
        setNotifications([...notifications, newNotification]);
      }
      
      setNotificationMessage('');
      setEditingNotificationId(null);
    } catch (error) {
      console.error('Error adding message:', error);
      // Consider showing an error message to the user
    }
  };

  const handleEditNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    if (notification.type === 'banner') {
      setBannerImage(notification.content);
      setNotificationMessage('');
    } else {
      setNotificationMessage(notification.content);
      setBannerImage(null);
    }
    
    setEditingNotificationId(id);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const renderSectionTitle = () => {
    switch (activeSection) {
      case 'loanProducts':
        return 'Loan Products';
      case 'loanApplications':
        return 'Loan Applications';
      case 'loanState':
        return 'Loan Applications';
      case 'pendingApplications':
      case 'approvedApplications':
      case 'rejectedApplications':
        return 'Loan Applications';
      case 'applicationDetails':
        return 'Application Details';
      case 'notifications':
        return 'Notifications';
      default:
        return '';
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Notification states
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const [formData, setFormData] = useState({
    loanName: '',
    description: '',
    interestRate: '',
    maxAmount: '',
    minAmount: '',
    loanTerms: '',
    eligibility: '',
    repaymentMethod: '',
    documentsRequired: '',
    termsAndConditions: '',
    isActive: true,
    id: Date.now().toString()
  });

  const handleInputChange = <K extends keyof LoanType>(
    field: K,
    value: LoanType[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      loanName: '',
      description: '',
      interestRate: '',
      maxAmount: '',
      minAmount: '',
      loanTerms: '',
      eligibility: '',
      repaymentMethod: '',
      documentsRequired: '',
      termsAndConditions: '',
      isActive: true,
      id: Date.now().toString()
    });
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    try {
      if (editingIndex !== null) {
        // Update existing loan
        const updatedLoans = [...loans];
        updatedLoans[editingIndex] = formData;
        setLoans(updatedLoans);
      } else {
        // Add new loan
        setLoans([...loans, { ...formData, id: Date.now().toString() }]);
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving loan:', error);
      // Consider showing an error message to the user
    }
  };

  const handleEdit = (index: number) => {
    try {
      setFormData(loans[index]);
      setEditingIndex(index);
      setShowForm(true);
    } catch (error) {
      console.error('Error editing loan:', error);
      // Consider showing an error message to the user
    }
  };

  const handleDelete = (index: number) => {
    try {
      const updatedLoans = loans.filter((_, i) => i !== index);
      setLoans(updatedLoans);
    } catch (error) {
      console.error('Error deleting loan:', error);
      // Consider showing an error message to the user
    }
  };

  const handleAddNew = () => {
    try {
      resetForm();
      setShowForm(true);
    } catch (error) {
      console.error('Error initializing new loan form:', error);
      // Consider showing an error message to the user
    }
  };

  const renderLoanProducts = () => (
    <ScrollView 
      contentContainerStyle={[styles.detailScrollContent, { width: '100%' }]}
      showsVerticalScrollIndicator={false}
    >
      {!showForm ? (
        <View style={styles.initialView}>
          <Text style={styles.sectionHeader}>Loan Products</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton, styles.addButton]}
            onPress={handleAddNew}
          >
            <Text style={styles.buttonText}>
              <Text style={styles.buttonIcon}>+ </Text>
              Add New Loan
            </Text>
          </TouchableOpacity>
          
          {/* List of Loans */}
          {loans.length > 0 && (
            <View style={styles.loansList}>
              <Text style={styles.sectionHeader}>Available Loans</Text>
              {loans.map((loan, index) => (
                <View key={loan.id} style={[styles.card, styles.loanItem]}>
                  <View style={styles.loanHeader}>
                    <Text style={styles.loanName}>{loan.loanName}</Text>
                    <View style={styles.loanActions}>
                      <TouchableOpacity 
                        style={{
                          backgroundColor: '#22C55E',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          justifyContent: 'center',
                          alignItems: 'center',
                          minWidth: 60,
                          height: 32,
                          elevation: 2,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.2,
                          shadowRadius: 1.5,
                        }}
                        onPress={() => handleEdit(index)}
                      >
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{
                          backgroundColor: '#EF4444',
                          paddingVertical: 2,
                          paddingHorizontal: 9,
                          borderRadius: 6,
                          justifyContent: 'center',
                          alignItems: 'center',
                          minWidth: 60,
                          height: 32,
                          elevation: 2,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.2,
                          shadowRadius: 1.5,
                          marginLeft: 8,
                        }}
                        onPress={() => handleDelete(index)}
                      >
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.loanDescription} numberOfLines={2}>
                    {loan.description}
                  </Text>
                  <View style={styles.loanDetails}>
                    <Text style={styles.loanDetail}>Rate: {loan.interestRate}%</Text>
                    <Text style={styles.loanDetail}>Max: ${loan.maxAmount}</Text>
                    <Text style={styles.loanDetail}>Term: {loan.loanTerms}</Text>
                  </View>
                  <View style={[styles.statusBadge, loan.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={styles.statusText}>
                      {loan.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.inputCard}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionHeader}>
              {editingIndex !== null ? 'Edit Loan Product' : 'Add New Loan Product'}
            </Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.formLabel}>Loan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Student Support Loan"
              value={formData.loanName}
              onChangeText={(text) => handleInputChange('loanName', text)}
            />

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter loan description"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.formLabel}>Interest Rate (%)</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="e.g., 5.5"
                  keyboardType="numeric"
                  value={formData.interestRate}
                  onChangeText={(text) => handleInputChange('interestRate', text)}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.formLabel}>Max Amount</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="e.g., 10000"
                  keyboardType="numeric"
                  value={formData.maxAmount}
                  onChangeText={(text) => handleInputChange('maxAmount', text)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.formLabel}>Min Amount</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="e.g., 1000"
                  keyboardType="numeric"
                  value={formData.minAmount}
                  onChangeText={(text) => handleInputChange('minAmount', text)}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.formLabel}>Repayment Method</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="e.g., Monthly"
                  value={formData.repaymentMethod}
                  onChangeText={(text) => handleInputChange('repaymentMethod', text)}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Loan Terms (months)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6, 12, 24, 36"
              value={formData.loanTerms}
              onChangeText={(text) => handleInputChange('loanTerms', text)}
            />

            <Text style={styles.formLabel}>Eligibility Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List eligibility criteria (one per line)"
              multiline
              numberOfLines={3}
              value={formData.eligibility}
              onChangeText={(text) => handleInputChange('eligibility', text)}
            />

            <Text style={styles.formLabel}>Documents Required</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List required documents (one per line)"
              multiline
              numberOfLines={3}
              value={formData.documentsRequired}
              onChangeText={(text) => handleInputChange('documentsRequired', text)}
            />

            <Text style={styles.formLabel}>Terms & Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter terms and conditions"
              multiline
              numberOfLines={4}
              value={formData.termsAndConditions}
              onChangeText={(text) => handleInputChange('termsAndConditions', text)}
            />

            <View style={styles.switchContainer}>
              <Text>Active</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>
                  {editingIndex !== null ? 'Update Loan' : 'Save Loan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderLoanApplicationsList = () => {
    return (
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        <Text style={styles.sectionHeader}>Loan Applications</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>List of Loan Applications</Text>
          <Text style={styles.fieldHint}>For each application, display:</Text>
          <Text style={styles.listItem}>• Applicant Name</Text>
          <Text style={styles.listItem}>• Loan Product Name</Text>
          <Text style={styles.listItem}>• Requested Amount</Text>
          <Text style={styles.listItem}>• Term (months)</Text>
          <Text style={styles.listItem}>• Submission Date</Text>
          <Text style={styles.listItem}>• Current Status (pending, under review, approved, rejected)</Text>
        </View>
      </ScrollView>
    );
  };

  const renderApplicationDetails = () => {
    return (
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        <Text style={styles.sectionHeader}>Application Details</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Applicant Information</Text>
          <Text style={styles.listItem}>• Full Name</Text>
          <Text style={styles.listItem}>• Email</Text>
          <Text style={styles.listItem}>• Phone</Text>
          <Text style={styles.listItem}>• Student ID (if stored)</Text>
          <Text style={styles.listItem}>• KYC Status (if used)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Request Details</Text>
          <Text style={styles.listItem}>• Loan Product</Text>
          <Text style={styles.listItem}>• Requested Amount</Text>
          <Text style={styles.listItem}>• Duration (term months)</Text>
          <Text style={styles.listItem}>• Reason for loan (if included)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submitted Documents</Text>
          <Text style={styles.listItem}>• ID document</Text>
          <Text style={styles.listItem}>• Proof of residence</Text>
          <Text style={styles.listItem}>• Proof of school enrollment</Text>
          <Text style={styles.listItem}>• Any extra files</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Review Actions</Text>
          <Text style={styles.listItem}>• Approve Loan</Text>
          <Text style={styles.listItem}>• Reject Loan</Text>
          <Text style={styles.listItem}>• Request More Documents</Text>
          <Text style={styles.listItem}>• Add Notes for internal record</Text>
          <Text style={styles.listItem}>• Set disbursement date (optional)</Text>
        </View>
      </ScrollView>
    );
  };

  const renderStatusList = (statusLabel: string) => {
    return (
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        <Text style={styles.sectionHeader}>{statusLabel} Applications</Text>
        <View style={styles.card}>
          <Text style={styles.fieldHint}>
            Filter the list of applications by status: {statusLabel.toLowerCase()}.
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderNotificationsSection = () => (
    <ScrollView 
      contentContainerStyle={[styles.detailScrollContent, { width: '100%' }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banner Management</Text>
        
        {/* Banner Upload */}
        <View style={styles.inputCard}>
          <Text >Upload Banner Image</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => {
              // TODO: Implement image picker
              // For now, we'll just use a placeholder
              setBannerImage('banner-placeholder-uri');
            }}
          >
            <Text style={styles.uploadButtonText}>
              {bannerImage ? 'Change Banner' : 'Select Banner Image'}
            </Text>
          </TouchableOpacity>
          
          {bannerImage && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.submitButton, { marginTop: 10 }]}
              onPress={handleAddBanner}
            >
              <Text style={styles.buttonText}>
                {editingNotificationId ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Message */}
        <View style={[styles.inputCard, { marginTop: 20 }]} >
          <Text >Notification Message</Text>
          <TextInput
            style={[styles.input, styles.textArea, { height: 100 }]}
            placeholder="Enter notification message"
            multiline
            value={notificationMessage}
            onChangeText={setNotificationMessage}
          />
          <TouchableOpacity 
            style={[styles.actionButton, styles.submitButton, { 
              marginTop: 10,
              height: 40,
              paddingVertical: 6,
              paddingHorizontal: 16,
              minWidth: 110,
              alignSelf: 'flex-start',
            }]}
            onPress={handleAddMessage}
            disabled={!notificationMessage.trim()}
          >
            <Text style={[styles.buttonText, { fontSize: 14 }]}>
              {editingNotificationId ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Existing Notifications */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Existing Notifications</Text>
          
          {notifications.length === 0 ? (
            <Text style={styles.noItemsText}>No notifications added yet</Text>
          ) : (
            notifications.map((notification) => (
              <View key={notification.id} style={[styles.card, { marginBottom: 15 }]} >
                {notification.type === 'banner' ? (
                  <View>
                    <Text style={styles.notificationLabel}>Banner Image</Text>
                    <View style={styles.bannerPreview}>
                      <Text>Banner Preview</Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.notificationLabel}>Message</Text>
                    <Text style={styles.notificationText}>{notification.content}</Text>
                  </View>
                )}
                <Text style={styles.notificationDate}>
                  Added: {notification.createdAt.toLocaleDateString()}
                </Text>
                <View style={styles.notificationActions}>
                  <TouchableOpacity 
                    style={{
                      backgroundColor: '#10B981',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      minWidth: 55,
                      height: 36,
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 2,
                    }}
                    onPress={() => handleEditNotification(notification.id)}
                  >
                    <Text style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 13,
                    }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{
                      backgroundColor: '#EF4444',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      minWidth: 50,
                      height: 36,
                      alignItems: 'center',
                      elevation: 2,
                    }}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Text style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 13,
                    }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'loanProducts':
        return renderLoanProducts();
      case 'loanApplications':
        return renderLoanApplicationsList();
      case 'loanState':
      case 'pendingApplications':
      case 'approvedApplications':
      case 'rejectedApplications':
        return renderStatusList(activeSection === 'loanState' ? 'All' : activeSection.replace('Applications', ''));
      case 'applicationDetails':
        return renderApplicationDetails();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <Text style={styles.leftTitle}>Loans</Text>
        <View style={styles.buttonColumn}>
          <AppButton
            label="Add Loan"
            onPress={() => setActiveSection('loanProducts')}
            style={styles.verticalButton}
            variant="primary"
          />
          <AppButton
            label="Applications"
            onPress={() => setActiveSection('loanApplications')}
            style={styles.verticalButton}
            variant="primary"
          />
          <AppButton
            label="Loan State"
            onPress={() => setActiveSection('loanState')}
            style={styles.verticalButton}
            variant="primary"
          />
          <AppButton
            label="Notifications"
            onPress={() => setActiveSection('notifications')}
            style={styles.verticalButton}
            variant="primary"
          />
        </View>
      </View>

      <View style={styles.rightPane}>
        <Text style={styles.rightTitle}>{renderSectionTitle()}</Text>
        {renderActiveSection()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  
  // Notification styles
  section: {
    padding: 16,
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: theme.colors.text,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  notificationLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text,
  },
  notificationText: {
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons
    marginTop: 16,
    width: '100%',
    gap: 12,
    paddingHorizontal: 0,
  },
  bannerPreview: {
    height: 100,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noItemsText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: 20,
  },
  // ... existing styles ...
  initialView: {
    width: '100%',
    alignItems: 'center',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingRight: 4,
  },
  closeButton: {
    fontSize: 20,
    color: theme.colors.textMuted,
    padding: 8,
    marginLeft: -8,
    marginRight: 10,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    width: '100%',
   
  },
  addButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  loansList: {
    width: '100%',
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  loanItem: {
    marginBottom: theme.spacing.md,
    width: '100%',
    padding: theme.spacing.md,
  },
  loanHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  loanName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 10,
    width: '100%',
  },
  loanActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    height: 36,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButton: {
    backgroundColor: '#10B981', // Slightly darker green for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#DC2626', // Slightly darker red for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  loanDescription: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    fontSize: 14,
    lineHeight: 20,
  },
  loanDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  loanDetail: {
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: theme.spacing.xs,
  },
  activeBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(149, 165, 166, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    alignItems: 'flex-start',
  },
  leftPane: {
    width: '38%',
    padding: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  rightPane: {
    flex: 1,
    padding: theme.spacing.md,
  },
  leftTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  rightTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonColumn: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    width: '100%',
  },
  verticalButton: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 100,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '250%',
    maxWidth: 200, // Width for notification cards
    alignSelf: 'center',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
    maxWidth: 1000, // Increased max width for input form
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.h5,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#1F2937',
    width: '100%',
    height: 40,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    width: '100%',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
    width: '100%',
   
  },
  column: {
    flex: 1,
    minWidth: 120,
   
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    width: '100%',
  },
  columnButtonContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  actionButton: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
 
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    minHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  listItem: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginVertical: 2,
    lineHeight: 20,
  },
});
