import axios from 'axios';

const API_URL = 'https://campus-suit-szub.onrender.com';

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
    const response = await axios.get(`${API_URL}/api/loanApplys`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Validate response is JSON
    if (typeof response.data === 'string' && response.data.startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Server may be down or overloaded.');
    }
    
    // Handle different response formats
    let applications: LoanApplication[] = [];
    if (Array.isArray(response.data)) {
      applications = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      applications = response.data.data;
    } else if (typeof response.data === 'string') {
      // If it's a string message, return empty array
      console.warn('API returned string message instead of data:', response.data);
      applications = [];
    } else {
      console.warn('Unexpected response format:', response.data);
      applications = [];
    }
    
    return applications;
  } catch (error: any) {
    console.error('Error fetching loan applications:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check if response is HTML (error page)
      if (typeof error.response.data === 'string' && error.response.data.startsWith('<')) {
        throw new Error('Server returned error page. Please try again later.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('Request setup error:', error.message);
      throw error;
    }
    
    // Return empty array on error to prevent crashes
    return [];
  }
};

export const updateLoanStatus = async (id: string, status: 'approved' | 'rejected'): Promise<LoanApplication> => {
  try {
    const response = await axios.put(`${API_URL}/api/loanApplys/${id}`, { status }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    // Validate response is JSON
    if (typeof response.data === 'string' && response.data.startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Server may be down or overloaded.');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating loan status:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check if response is HTML (error page)
      if (typeof error.response.data === 'string' && error.response.data.startsWith('<')) {
        throw new Error('Server returned error page. Please try again later.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('Request setup error:', error.message);
      throw error;
    }
    
    throw error;
  }
};

export const fetchLoanDetails = async (loanId: string): Promise<LoanApplication> => {
  try {
    const response = await axios.get(`${API_URL}/api/loanApplys/${loanId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    // Validate response is JSON
    if (typeof response.data === 'string' && response.data.startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Server may be down or overloaded.');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching loan details:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check if response is HTML (error page)
      if (typeof error.response.data === 'string' && error.response.data.startsWith('<')) {
        throw new Error('Server returned error page. Please try again later.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('Request setup error:', error.message);
      throw error;
    }
    
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
    const url = `${API_URL}/api/loanApplys/${loanId}/calculation`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Validate response is JSON
    if (typeof response.data === 'string' && response.data.startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Server may be down or overloaded.');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching loan calculation:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check if response is HTML (error page)
      if (typeof error.response.data === 'string' && error.response.data.startsWith('<')) {
        throw new Error('Server returned error page. Please try again later.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      console.error('Request setup error:', error.message);
      throw error;
    }
    
    throw error;
  }
};
