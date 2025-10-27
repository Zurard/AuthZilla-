// Hook for user authentication
'use client';

import { useState } from 'react';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {}

interface User {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: RegisterData): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: LoginData): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    login,
    loading,
    error,
    clearError: () => setError(null),
  };
}
