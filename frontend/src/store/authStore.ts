import { create } from 'zustand';
import type { User, AuthState } from '../types';

// Token storage key
const TOKEN_KEY = 'lifevault_token';
const USER_KEY = 'lifevault_user';

// Helper functions for localStorage
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    // console.error('Error reading token from localStorage:', error);
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    // console.error('Error reading user from localStorage:', error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    // console.error('Error saving token to localStorage:', error);
  }
};

const setStoredUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    // console.error('Error saving user to localStorage:', error);
  }
};

const clearStorage = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    // console.error('Error clearing localStorage:', error);
  }
};

// Initialize state from localStorage
const initializeState = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  return {
    user,
    token,
    isAuthenticated: !!(token && user),
    isLoading: false,
  };
};

// Create the auth store
export const useAuthStore = create<AuthState>((set) => ({
  ...initializeState(),
  
  // Login action - stores user and token
  login: (user: User, token: string) => {
    setStoredToken(token);
    setStoredUser(user);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  
  // Logout action - clears state and localStorage
  logout: () => {
    clearStorage();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  // SetUser action - updates user profile
  setUser: (user: User) => {
    setStoredUser(user);
    set({ user });
  },
}));
