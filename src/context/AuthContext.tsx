import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const register = (email: string, password: string, name: string): boolean => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: User) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name
    };

    // Save user credentials
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    credentials.push({ email, password });
    localStorage.setItem('credentials', JSON.stringify(credentials));

    // Save user data
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));

    return true;
  };

  const login = (email: string, password: string): boolean => {
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    const isValid = credentials.some(
      (cred: { email: string; password: string }) =>
        cred.email === email && cred.password === password
    );

    if (isValid) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email);
      if (user) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}