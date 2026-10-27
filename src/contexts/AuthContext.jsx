/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../lib/authApi';
import {
  clearAuthSession,
  getAccessToken,
  loadAuthSession,
  saveAuthSession,
} from '../lib/authSession';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const stored = loadAuthSession();
      if (!stored?.user || !stored?.session?.access_token) {
        setUser(null);
        return;
      }

      // Prefer the locally persisted session from sign-in. The Fly /auth/user
      // route currently does not read bearer tokens, so local storage is the
      // reliable source of truth until the backend is updated.
      setUser(stored.user);

      try {
        const data = await authApi.getCurrentUser(stored.session.access_token);
        if (data?.user) {
          saveAuthSession({ user: data.user, session: stored.session });
          setUser(data.user);
        }
      } catch (error) {
        if (error.code !== 'BACKEND_SESSION_MISSING') {
          console.warn('Could not refresh user from backend:', error.message);
        }
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await authApi.signIn(email, password);
    if (!data?.session?.access_token) {
      throw new Error('Sign in succeeded but no session was returned. Please try again.');
    }
    saveAuthSession({ user: data.user, session: data.session });
    setUser(data.user);
    return data;
  };

  const signUp = async (email, password, username) => {
    const data = await authApi.signUp(email, password, username);
    // Email confirmation may mean no session yet.
    if (data?.session?.access_token && data?.user) {
      saveAuthSession({ user: data.user, session: data.session });
      setUser(data.user);
    }
    return data;
  };

  const signOut = async () => {
    const token = getAccessToken();
    try {
      await authApi.signOut(token);
    } finally {
      clearAuthSession();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
