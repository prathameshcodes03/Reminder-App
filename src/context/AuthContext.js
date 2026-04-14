import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerUser, loginUser, getProfile,
  updateProfile as apiUpdateProfile,
  getReminders as apiGetReminders,
  createReminder as apiCreateReminder,
  completeReminder as apiCompleteReminder,
  deleteReminder as apiDeleteReminder,
  setAuthToken,
} from '../api/api';

const AuthContext = createContext();
const TOKEN_KEY = '@remindme_token';
const SESSION_RESTORE_TIMEOUT_MS = 4000;

const normalizeReminder = (reminder) => ({
  ...reminder,
  isoDate: reminder.isoDate ?? reminder.iso_date,
  displayDate: reminder.displayDate ?? reminder.display_date,
  displayTime: reminder.displayTime ?? reminder.display_time,
  done: Boolean(reminder.done ?? reminder.is_done),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from saved JWT on app open
  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        return;
      }

      setAuthToken(token);

      const res = await Promise.race([
        getProfile(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session restore timeout')), SESSION_RESTORE_TIMEOUT_MS);
        }),
      ]);

      setUser(res.data.user);
    } catch (e) {
      console.log('Session restore failed:', e.message);
      await AsyncStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    const res = await registerUser({ name, email, password });
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });
    const { token, user: loggedUser } = res.data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await apiUpdateProfile(updates);
    setUser(res.data.user);
    return res.data.user;
  };

  const getReminders = async () => {
    const res = await apiGetReminders();
    return res.data.reminders.map(normalizeReminder);
  };

  const saveReminder = async (reminderData) => {
    const res = await apiCreateReminder(reminderData);
    return normalizeReminder(res.data.reminder);
  };

  const markComplete = async (id) => {
    await apiCompleteReminder(id);
  };

  const removeReminder = async (id) => {
    await apiDeleteReminder(id);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      updateProfile,
      getReminders, saveReminder, markComplete, removeReminder,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
