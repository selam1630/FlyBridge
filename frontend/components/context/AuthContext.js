import { API_BASE_URL } from '../../config/api.js';
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedData = await AsyncStorage.getItem('authData');
        if (storedData) {
          const { token, user } = JSON.parse(storedData);
          const isPostgresUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user?.id || '');
          if (isPostgresUuid) {
            setUser(user);
            setToken(token);
          } else {
            await AsyncStorage.removeItem('authData');
          }
        }
      } catch (err) {
        console.error('Error loading stored auth data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: data.message || `Sign in failed (${res.status}).` };
      }

      const token = data.token;
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json().catch(() => ({}));
      if (!userRes.ok) {
        return { error: userData.message || `Could not load your account (${userRes.status}).` };
      }

      setUser(userData);
      setToken(token);
      await AsyncStorage.setItem('authData', JSON.stringify({ token, user: userData }));
      return { token, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      return { error: `Could not connect to the server at ${API_BASE_URL}. Make sure the backend is running and the address is reachable from this device.` };
    }
  };
const logout = async () => {
  try {
    setUser(null); 
    setToken(null);
    await AsyncStorage.removeItem('authData');
  } catch (err) {
    console.error('Logout error:', err);
  }
};
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
