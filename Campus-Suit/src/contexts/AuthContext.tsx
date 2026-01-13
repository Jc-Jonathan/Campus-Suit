import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId?: number;
  email?: string;
  isAdmin?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loginAsStudent: (userId: number) => Promise<void>;
  loginAsAdmin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      if (id) setUser({ userId: Number(id) });
      setLoading(false);
    });
  }, []);

  const loginAsStudent = async (userId: number) => {
    if (!userId) {
      throw new Error('Invalid userId');
    }
    await AsyncStorage.setItem('userId', userId.toString());
    setUser({ userId, isAdmin: false, role: 'student' });
  };

  const loginAsAdmin = async (email: string) => {
    if (!email) {
      throw new Error('Email is required');
    }
    // Store admin email and set admin flag
    await AsyncStorage.setItem('adminEmail', email);
    setUser({ email, isAdmin: true, role: 'admin' });
  };


  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsStudent, loginAsAdmin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
