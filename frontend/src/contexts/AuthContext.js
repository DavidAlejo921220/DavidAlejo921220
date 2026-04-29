import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Utilidades para manejo seguro de storage
const secureStorage = {
  setItem: (key, value) => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(value)));
      sessionStorage.setItem(key, encoded);
    } catch {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  },
  getItem: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(decodeURIComponent(atob(item)));
    } catch {
      try {
        return JSON.parse(sessionStorage.getItem(key));
      } catch {
        return null;
      }
    }
  },
  removeItem: (key) => sessionStorage.removeItem(key),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = secureStorage.getItem('user');
    const storedToken = secureStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: newUser } = response.data;
    
    secureStorage.setItem('token', newToken);
    secureStorage.setItem('user', newUser);
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return newUser;
  }, []);

  const register = useCallback(async (data) => {
    const response = await axios.post(`${API}/auth/register`, data);
    const { token: newToken, user: newUser } = response.data;
    
    secureStorage.setItem('token', newToken);
    secureStorage.setItem('user', newUser);
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return response.data;
  }, []);

  const logout = useCallback(() => {
    secureStorage.removeItem('token');
    secureStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}