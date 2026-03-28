import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const USERS_KEY = '@remindme_users';
const SESSION_KEY = '@remindme_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const json = await AsyncStorage.getItem(SESSION_KEY);
      if (json) setUser(JSON.parse(json));
    } catch (e) {
      console.log('Session restore error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const json = await AsyncStorage.getItem(USERS_KEY);
      return json ? JSON.parse(json) : [];
    } catch { return []; }
  };

  const saveUsers = async (users) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = async ({ name, email, password }) => {
    const users = await getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error('Email already registered');
    const newUser = {
      id: Date.now().toString(),
      name, email, password,
      phone: '', role: 'Student',
      joined: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      reminders: [],
    };
    await saveUsers([...users, newUser]);
    return true;
  };

  const login = async ({ email, password }) => {
    const users = await getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error('Invalid email or password');
    const session = { ...found };
    delete session.password;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const users = await getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) throw new Error('User not found');
    const updated = { ...users[idx], ...updates };
    users[idx] = updated;
    await saveUsers(users);
    const newSession = { ...updated };
    delete newSession.password;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setUser(newSession);
  };

  const getReminders = async () => {
    const users = await getUsers();
    const found = users.find(u => u.id === user.id);
    return found ? found.reminders || [] : [];
  };

  const saveReminders = async (reminders) => {
    const users = await getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx].reminders = reminders;
    await saveUsers(users);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, getReminders, saveReminders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
