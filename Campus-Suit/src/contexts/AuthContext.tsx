import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginAsStudent: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // simulate restoring auth state
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  const loginAsStudent = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({ id: '1', name: 'Student User', role: 'student' });
      setIsLoading(false);
    }, 600);
  };

  const loginAsAdmin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({ id: '2', name: 'Admin User', role: 'admin' });
      setIsLoading(false);
    }, 600);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsStudent, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
