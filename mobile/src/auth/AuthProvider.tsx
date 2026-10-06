import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import * as authApi from "@/api/auth";
import { configureAuth, setAccessToken } from "@/api/client";
import { sessionStorage } from "@/storage/secure-storage";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (correo: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  sessionMessage: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setLocalAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const clearSession = useCallback(async () => {
    setUser(null);
    setLocalAccessToken(null);
    setAccessToken(null);
    await sessionStorage.clear();
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = await sessionStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const result = await authApi.refresh(refreshToken);
      setUser(result.user);
      setLocalAccessToken(result.accessToken);
      setAccessToken(result.accessToken);
      await sessionStorage.setRefreshToken(result.refreshToken);
      return result.accessToken;
    } catch {
      setSessionMessage("Tu sesión expiró. Iniciá sesión nuevamente.");
      await clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    configureAuth({ getAccessToken: () => accessToken, refresh: refreshSession, clear: clearSession });
  }, [accessToken, clearSession, refreshSession]);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refreshSession,
    async signIn(correo, password) {
      setSessionMessage(null);
      const result = await authApi.login(correo, password);
      setUser(result.user);
      setLocalAccessToken(result.accessToken);
      setAccessToken(result.accessToken);
      await sessionStorage.setRefreshToken(result.refreshToken);
    },
    async signOut() {
      try { if (accessToken) await authApi.logout(); } finally { await clearSession(); }
    },
    sessionMessage,
  }), [accessToken, clearSession, loading, refreshSession, sessionMessage, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
