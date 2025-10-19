import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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
          setUser(user);
          setToken(token);
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
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      Alert.alert('Login Failed', data.message || 'Invalid credentials');
      return null; 
    }

    const token = data.token;
    const userRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();

    setUser(userData);
    setToken(token);
    await AsyncStorage.setItem('authData', JSON.stringify({ token, user: userData }));
    return { token, user: userData }; 
  } catch (err) {
    console.error('Login error:', err);
    Alert.alert('Error', 'Something went wrong. Try again.');
    return null;
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
