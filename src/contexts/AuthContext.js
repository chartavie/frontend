import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/authService';
import { getProfile } from '../services/userService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Load user profile on mount if token exists
  useEffect(() => {
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, [token]);

  const login = async (email, password) => {
    const { token: newToken } = await apiLogin(email, password);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const profile = await getProfile();
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}