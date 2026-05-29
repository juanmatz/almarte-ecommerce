"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  documentId?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const savedToken = localStorage.getItem("almarte_token");
    const savedUser = localStorage.getItem("almarte_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem("almarte_token");
        localStorage.removeItem("almarte_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("almarte_token", newToken);
    localStorage.setItem("almarte_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("almarte_token");
    localStorage.removeItem("almarte_user");
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Error al iniciar sesión" };
      }

      login(data.token, data.user);
      return { success: true };
    } catch (err) {
      console.error("Login request error:", err);
      return { success: false, error: "Error de red. Intenta de nuevo más tarde." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Error al registrarse" };
      }

      login(data.token, data.user);
      return { success: true };
    } catch (err) {
      console.error("Registration request error:", err);
      return { success: false, error: "Error de red. Intenta de nuevo más tarde." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        loginWithCredentials,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
