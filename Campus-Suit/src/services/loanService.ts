import axios from 'axios';

const API_URL = 'http://192.168.31.130:5000/api/loanApplys';

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
