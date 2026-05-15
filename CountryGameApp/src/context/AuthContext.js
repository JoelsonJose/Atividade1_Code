import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      const storedToken = await AsyncStorage.getItem('token');
      const storedChar = await AsyncStorage.getItem('activeCharacter');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      if (storedChar) {
        setActiveCharacter(JSON.parse(storedChar));
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
    await AsyncStorage.setItem('token', userToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setActiveCharacter(null);
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('activeCharacter');
  };

  const selectCharacter = async (char) => {
    setActiveCharacter(char);
    if (char) {
      await AsyncStorage.setItem('activeCharacter', JSON.stringify(char));
    } else {
      await AsyncStorage.removeItem('activeCharacter');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, activeCharacter, loading, login, logout, selectCharacter, setActiveCharacter }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
