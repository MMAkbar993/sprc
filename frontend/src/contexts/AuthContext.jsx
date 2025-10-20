import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token } = response.data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      return await authAPI.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateProfile,
      changePassword,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
