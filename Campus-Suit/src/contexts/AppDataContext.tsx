import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import scholarshipsData from '../mock/scholarships.json';
import scholarshipApplicationsData from '../mock/scholarshipApplications.json';
import loanProductsData from '../mock/loanProducts.json';
import loanApplicationsData from '../mock/loanApplications.json';
import productsData from '../mock/products.json';
import ordersData from '../mock/orders.json';
import usersData from '../mock/users.json';

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

export interface LoanProduct {
  id: string;
  name: string;
  rate: number;
  maxAmount: number;
  description: string;
}

export interface LoanApplication {
  id: string;
  loanProductId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  tags?: string[];
}

export interface Order {
  id: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
}

export interface UserRow {
  id: string;
  name: string;
  role: 'student' | 'admin';
}

interface AppDataContextValue {
  isLoading: boolean;
  scholarships: Scholarship[];
  scholarshipApplications: ScholarshipApplication[];
  loanProducts: LoanProduct[];
  loanApplications: LoanApplication[];
  products: Product[];
  orders: Order[];
  users: UserRow[];
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<Omit<AppDataContextValue, 'isLoading'>>({
    scholarships: [],
    scholarshipApplications: [],
    loanProducts: [],
    loanApplications: [],
    products: [],
    orders: [],
    users: [],
  });

  useEffect(() => {
    // simulate loading from API
    const timeout = setTimeout(() => {
      setState({
        scholarships: scholarshipsData as unknown as Scholarship[],
        scholarshipApplications: scholarshipApplicationsData as unknown as ScholarshipApplication[],
        loanProducts: loanProductsData as unknown as LoanProduct[],
        loanApplications: loanApplicationsData as unknown as LoanApplication[],
        products: productsData as unknown as Product[],
        orders: ordersData as unknown as Order[],
        users: usersData as unknown as UserRow[],
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
