import axios from 'axios';

const API_URL = 'https://pandora-cerebrational-nonoccidentally.ngrok-free.dev/api/loanApplys';

export type LoanApplication = {
  _id: string;
  loanId: string;
  fullName: string;
  loanTitle: string;
  submissionDate: string;
  createdAt?: string;  // Add this line
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  purpose?: string;
  program?: string;
  yearOfStudy?: string;
  phone?: string;
  email?: string;
  applicationDeadline?: string;
  interestRate?: number;
  repaymentPeriod?: string;
};

export const fetchLoanApplications = async (): Promise<LoanApplication[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    throw new Error('Failed to fetch loan applications');
  }
};

export const updateLoanStatus = async (id: string, status: 'approved' | 'rejected'): Promise<LoanApplication> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating loan status:', error);
    throw error;
  }
};

export const fetchLoanDetails = async (loanId: string): Promise<LoanApplication> => {
  try {
    const response = await axios.get(`${API_URL}/${loanId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching loan details:', error);
    throw error;
  }
};

export type LoanCalculation = {
  isApproved: boolean;
  currentAmount: number;
  originalAmount: number;
  timeRemaining: string;
  isCompleted: boolean;
  elapsedPeriods: number;
  interestAccrued: number;
  startTime?: string;
  endTime?: string;
  interestRate?: number;
  repaymentPeriod?: string;
  periodUnit?: string;
};

export const fetchLoanCalculation = async (loanId: string): Promise<{ loan: LoanApplication; calculation: LoanCalculation }> => {
  try {
    console.log('Fetching loan calculation for ID:', loanId);
    const url = `${API_URL}/${loanId}/calculation`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching loan calculation:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
};
