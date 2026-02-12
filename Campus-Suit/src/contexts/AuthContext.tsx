import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
   _id?: string; 
  userId?: number;
  email?: string;
  role?: 'student' | 'admin';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  userId: number | null;               // ⭐ direct access
  userToken: string | null;            // ⭐ user authentication token
  isLoggedIn: boolean;                 // ⭐ helper
  loginAsStudent: (mongoId: string, userId: number, email: string, token: string) => Promise<void>;
  loginAsAdmin: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===================== RESTORE SESSION ===================== */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedMongoUserId, storedUserId, storedUserEmail, adminEmail, token] = await Promise.all([
          AsyncStorage.getItem('mongoUserId'),
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('userEmail'),
          AsyncStorage.getItem('adminEmail'),
          AsyncStorage.getItem('userToken')
        ]);

if (storedMongoUserId && storedUserId && storedUserEmail) {
  const id = Number(storedUserId);
  setUser({
    _id: storedMongoUserId,
    userId: id,
    email: storedUserEmail,
    role: 'student',
    isAdmin: false,
  });
  setUserId(id);
  setUserToken(token);
} else if (adminEmail) {
  setUserToken(token);
  setUser({ email: adminEmail, role: 'admin', isAdmin: true });
}
      } catch (err) {
        console.error('Auth restore error:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ===================== USER LOGIN ===================== */
  const loginAsStudent = async (mongoId: string, userId: number, email: string, token: string) => {
    const userData = {
      _id: mongoId,
      userId,
      email,
      role: 'student' as const,
      isAdmin: false,
    };
    await AsyncStorage.setItem('mongoUserId', mongoId);
    await AsyncStorage.setItem('userId', userId.toString());
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userToken', token);
    setUser(userData);
    setUserId(userId);
    setUserToken(token);
  };

  /* ===================== ADMIN LOGIN ===================== */
  const loginAsAdmin = async (email: string, token: string) => {
    const userData = {
      email,
      role: 'admin' as const,
      isAdmin: true,
    };
    await AsyncStorage.setItem('adminEmail', email);
    await AsyncStorage.setItem('userToken', token);
    setUser(userData);
    setUserToken(token);
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('adminEmail');
    await AsyncStorage.removeItem('userToken');
    setUser(null);
    setUserId(null);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        userToken,
        isLoggedIn: !!user,
        loginAsStudent,
        loginAsAdmin,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ===================== HOOK ===================== */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
