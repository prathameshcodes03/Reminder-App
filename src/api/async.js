/**
 * async.js — Auth helper (legacy / reference)
 *
 * NOTE: The actual auth logic lives in src/context/AuthContext.js
 * which handles register, login, session persistence, profile updates,
 * and reminder storage — all via AsyncStorage.
 *
 * Use the useAuth() hook in your screens instead of importing this directly:
 *   import { useAuth } from '../context/AuthContext';
 *   const { login, register, user, logout } = useAuth();
 *
 * This file is kept for reference only.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  register: async (userData) => {
    try {
      const existingUsers = await AsyncStorage.getItem('@remindme_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      if (users.find(u => u.email === userData.email)) return false;
      users.push({ ...userData, id: Date.now().toString(), reminders: [] });
      await AsyncStorage.setItem('@remindme_users', JSON.stringify(users));
      return true;
    } catch (e) { console.error(e); return false; }
  },

  login: async (email, password) => {
    try {
      const data = await AsyncStorage.getItem('@remindme_users');
      const users = data ? JSON.parse(data) : [];
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const session = { ...user };
        delete session.password;
        await AsyncStorage.setItem('@remindme_session', JSON.stringify(session));
        return session;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  },
};
