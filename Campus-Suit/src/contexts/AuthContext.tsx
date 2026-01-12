import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{ userId: number } | null>(null);
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
  setUser({ userId });
};


  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsStudent, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
