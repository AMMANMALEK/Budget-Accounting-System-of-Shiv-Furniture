import { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (u) => ({
    ...u,
    role: u.role?.toLowerCase() // Map ADMIN -> admin, PORTAL -> portal
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('erp_token');
      if (token) {
        try {
          const data = await fetchApi('/auth/me');
          setUser(mapUser(data.user));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('erp_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const mappedUser = mapUser(data.user);
    setUser(mappedUser);
    localStorage.setItem('erp_token', data.token);
    return mappedUser;
  };

  const signup = async (name, email, password, role) => {
    const data = await fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    const mappedUser = mapUser(data.user);
    setUser(mappedUser);
    localStorage.setItem('erp_token', data.token);
    return mappedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_token');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin: user?.role === 'admin',
    isPortal: user?.role === 'portal',
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
