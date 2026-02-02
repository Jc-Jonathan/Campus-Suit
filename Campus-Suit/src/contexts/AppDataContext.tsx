import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Scholarship {
  _id?: string;
  scholarshipId?: number;
  id?: string | number;
  title: string;
  description: string;
  deadline: string;
  amount: number;
  percentage?: number;
  courseFileUrl?: string;
  provider?: string;
  tags: string[];
}


export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface LoanApplication {
  id: string;
  loanProductId: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  submittedAt: string;
  // Add other loan application properties as needed
}

export interface LoanProduct {
  id: string;
  name: string;
  rate: number;
  maxAmount: number;
  description: string;
}



interface AppDataContextValue {
  isLoading: boolean;
  loanApplications: LoanApplication[];
  loanProducts: LoanProduct[];
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<Omit<AppDataContextValue, 'isLoading'>>({
    loanApplications: [],
    loanProducts: [],
  });

  useEffect(() => {
    // simulate loading from API
    const timeout = setTimeout(() => {
      // Initialize with mock data or fetch from your API
      setState({
        loanApplications: [], // Initialize with empty array or fetch from API
        loanProducts: [
          {
            id: '1',
            name: 'Student Loan',
            rate: 5.5,
            maxAmount: 50000,
            description: 'Loan for educational expenses'
          },
          // Add more loan products as needed
        ],
      });
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AppDataContext.Provider value={{ isLoading, ...state }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextValue => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return ctx;
};
