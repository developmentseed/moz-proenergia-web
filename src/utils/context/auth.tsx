'use client';

import { createContext, PropsWithChildren, useContext, useState } from "react";
import { api } from '@/utils/api';
import axios from 'axios';
const TOKEN_KEY = "token";

export interface LoginResponse {
  token: string;
}

export interface IAuthContext {
  token?: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  });
  const isAuthenticated = !!token;

  const login = (username: string, password: string): Promise<LoginResponse> => {

    return api.post<LoginResponse>('token-auth/', { username, password })
      .then((response) => {
        setToken(response.data.token);
        localStorage.setItem(TOKEN_KEY, response.data.token);
        return response.data;
      });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("cache_date");
    setToken(null);
  };

  const contextValue = {
    token,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Auth Provider');
  }
  return context;
};
