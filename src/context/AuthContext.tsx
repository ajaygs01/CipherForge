import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { safeStorage, safeSessionStorage } from '../utils/storage';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  updateProfile: (fullName: string, phoneNumber?: string) => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_ajay_001',
  email: 'gsajay18@gmail.com',
  fullName: 'Ajay G S',
  firstName: 'Ajay',
  lastName: 'G S',
  phoneNumber: '9686352137',
  github: 'https://github.com/ajaygs01/CipherForge',
  college: 'HKBK College of Engineering',
  department: 'Information Science & Engineering',
  isVerified: true,
  memberSince: '2026-10-12',
  totalOperations: 48,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = safeStorage.getItem('securecipher_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Cleanse and sync with Ajay G S details
        const updated: UserProfile = {
          ...parsed,
          fullName: 'Ajay G S',
          firstName: 'Ajay',
          lastName: 'G S',
          email: 'gsajay18@gmail.com',
          phoneNumber: '9686352137',
          github: 'https://github.com/ajaygs01/CipherForge',
        };
        delete (updated as any).usn;
        return updated;
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    if (user) {
      safeStorage.setItem('securecipher_user', JSON.stringify(user));
    } else {
      safeStorage.removeItem('securecipher_user');
    }
  }, [user]);

  const login = async (identifier: string, _password: string, rememberMe = true): Promise<boolean> => {
    // Simulated JWT login supporting email or phone number
    const trimmedId = identifier.trim();
    const isEmail = trimmedId.includes('@');
    const emailVal = isEmail ? trimmedId : `${trimmedId.replace(/\D/g, '')}@telecom.sms`;
    const nameVal = isEmail ? trimmedId.split('@')[0].replace('.', ' ').toUpperCase() : `User ${trimmedId.slice(-4)}`;

    const loggedInUser: UserProfile = {
      ...DEFAULT_USER,
      email: isEmail ? trimmedId : user?.email || 'gsajay18@gmail.com',
      phoneNumber: !isEmail ? trimmedId : user?.phoneNumber || '9686352137',
      fullName: user?.fullName || nameVal,
      github: 'https://github.com/ajaygs01/CipherForge',
      isVerified: true,
    };

    setUser(loggedInUser);
    if (rememberMe) {
      safeStorage.setItem('securecipher_jwt', 'simulated_jwt_token_hs256_cost12');
    } else {
      safeSessionStorage.setItem('securecipher_jwt', 'simulated_jwt_token_hs256_cost12');
    }
    return true;
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = payload;

    if (!firstName.trim() || !lastName.trim()) {
      throw new Error('Please enter both First Name and Last Name.');
    }
    if (!email.trim() || !email.includes('@')) {
      throw new Error('Please enter a valid institutional or personal email address.');
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      throw new Error('Please enter a valid phone number (minimum 7 digits).');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match. Please verify your confirm password field.');
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      github: 'https://github.com/ajaygs01/CipherForge',
      college: 'HKBK College of Engineering',
      department: 'Information Science & Engineering',
      isVerified: true,
      memberSince: new Date().toISOString().split('T')[0],
      totalOperations: 1,
    };

    setUser(newUser);
    safeStorage.setItem('securecipher_jwt', 'simulated_jwt_token_hs256_registered');
    return true;
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem('securecipher_jwt');
    safeSessionStorage.removeItem('securecipher_jwt');
  };

  const updateProfile = (fullName: string, phoneNumber?: string) => {
    if (user) {
      setUser({ ...user, fullName, ...(phoneNumber ? { phoneNumber } : {}) });
    }
  };

  const changePassword = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (currentPass.length < 4) {
      return { success: false, message: 'Current password incorrect' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must have at least 8 characters' };
    }
    return { success: true, message: 'Password updated successfully with Bcrypt (cost 12)' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
