import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId?: number;
  email?: string;
  role?: 'student' | 'admin';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  userId: number | null;               // ⭐ direct access
  isLoggedIn: boolean;                  // ⭐ helper
  loginAsStudent: (userId: number, email: string) => Promise<void>;
  loginAsAdmin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===================== RESTORE SESSION ===================== */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
const storedUserEmail = await AsyncStorage.getItem('userEmail');
const adminEmail = await AsyncStorage.getItem('adminEmail');

if (storedUserId && storedUserEmail) {
  const id = Number(storedUserId);
  setUser({
    userId: id,
    email: storedUserEmail,
    role: 'student',
    isAdmin: false,
  });
  setUserId(id);
} else if (adminEmail) {
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
  const loginAsStudent = async (id: number, email: string) => {
  if (!id || !email) throw new Error('Invalid login data');

  await AsyncStorage.multiSet([
    ['userId', id.toString()],
    ['userEmail', email],
  ]);

  await AsyncStorage.removeItem('adminEmail');

  setUser({
    userId: id,
    email,
    role: 'student',
    isAdmin: false,
  });

  setUserId(id);
};


  /* ===================== ADMIN LOGIN ===================== */
  const loginAsAdmin = async (email: string) => {
    if (!email) throw new Error('Email is required');

    await AsyncStorage.setItem('adminEmail', email);
    await AsyncStorage.removeItem('userId');

    setUser({ email, role: 'admin', isAdmin: true });
    setUserId(null);
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    await AsyncStorage.multiRemove(['userId', 'userEmail', 'adminEmail']);
    setUser(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoggedIn: !!userId,   // ⭐ IMPORTANT FOR CHECKOUT
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
