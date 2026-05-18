'use client';

import { createContext, PropsWithChildren, useContext, useState } from "react";
import { api } from '@/utils/api';
const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

export interface LoginResponse {
  token: string;
}

export interface IAuthContext {
  token?: string | null;
  username?: string | null;
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
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USERNAME_KEY);
  });
  const isAuthenticated = !!token;

  const login = (username: string, password: string): Promise<LoginResponse> => {

    return api.post<LoginResponse>('token-auth/', { username, password })
      .then((response) => {
        setToken(response.data.token);
        setUsername(username);
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USERNAME_KEY, username);
        return response.data;
      });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  };

  const contextValue = {
    token,
    username,
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
