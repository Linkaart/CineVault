"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchMe, login as apiLogin } from "@/lib/api/auth";
import { clearTokens, setTokens } from "@/lib/api/client";
import { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("cinevault_access") : null;
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username: string, password: string) {
    const tokens = await apiLogin(username, password);
    setTokens(tokens.access, tokens.refresh);
    await refreshUser();
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
