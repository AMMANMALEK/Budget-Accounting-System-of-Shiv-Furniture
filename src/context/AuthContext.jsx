import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (name, email, password, role) => {
    // Mock authentication - accept any credentials
    const userData = {
      id: role === 'admin' ? 'admin-1' : 'portal-1',
      email,
      role, // 'admin' or 'portal'
      name: name || (role === 'admin' ? 'Admin User' : 'Portal User'),
    };

    setUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    return userData;
  };

  const signup = (name, email, password, role) => {
    // Mock signup
    const userData = {
      id: `${role}-${Date.now()}`,
      email,
      role,
      name,
    };

    setUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
