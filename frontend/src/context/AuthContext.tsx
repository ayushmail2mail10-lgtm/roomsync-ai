import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { User, Profile, Verification, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  verification: Verification | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, phone?: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshVerification: () => Promise<void>;
  loginDemoUser: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserData = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      const p = await api.getMyProfile();
      setProfile(p);
      const v = await api.getVerificationStatus();
      setVerification(v);
    } catch (err) {
      console.warn("User session expired or not authenticated:", err);
      clearAuthToken();
      setUser(null);
      setProfile(null);
      setVerification(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadUserData();
    } else {
      // By default for demo ease, automatically initialize demo user token
      loginDemoUser();
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setAuthToken(res.access_token);
      await loadUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, phone?: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password: pass, full_name: name, phone, role });
      setAuthToken(res.access_token);
      await loadUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoUser = async () => {
    try {
      const res = await api.login({ email: "arjun@roomsync.ai", password: "password123" });
      setAuthToken(res.access_token);
      await loadUserData();
    } catch (e) {
      console.error("Demo login error:", e);
      setIsLoading(false);
    }
  };

  const switchRoleDemo = async (targetRole: UserRole) => {
    // Strictly restrict demo role switching to development mode only
    if (!import.meta.env.DEV) {
      console.warn("Demo persona switching is restricted to local development mode.");
      return;
    }

    setIsLoading(true);
    try {
      let credentials = { email: "arjun@roomsync.ai", password: "password123" };
      if (targetRole === 'tenant') {
        credentials = { email: "rohan.verma@roomsync.ai", password: "password123" };
      } else if (targetRole === 'property_owner') {
        credentials = { email: "sneha.kulkarni@roomsync.ai", password: "password123" };
      } else if (targetRole === 'flat_owner') {
        credentials = { email: "arjun@roomsync.ai", password: "password123" };
      } else if (targetRole === 'admin') {
        credentials = { email: "admin@roomsync.ai", password: "adminpassword123" };
      }
      const res = await api.login(credentials);
      setAuthToken(res.access_token);
      await loadUserData();
    } catch (e) {
      console.error("Error switching demo role:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setProfile(null);
    setVerification(null);
  };

  const refreshProfile = async () => {
    if (getAuthToken()) {
      const p = await api.getMyProfile();
      setProfile(p);
    }
  };

  const refreshVerification = async () => {
    if (getAuthToken()) {
      const v = await api.getVerificationStatus();
      setVerification(v);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        verification,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        refreshVerification,
        loginDemoUser,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
