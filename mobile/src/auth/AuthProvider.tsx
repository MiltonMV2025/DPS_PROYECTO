import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { unregisterCurrentDeviceToken } from "@/api/notifications";
import { configureAuth, setAccessToken } from "@/api/client";
import { sessionStorage } from "@/storage/secure-storage";
import {
  signInWithGoogleFirebase,
  signOutGoogleFirebase,
} from "@/auth/google-auth";
import {
  logGoogleAuthFailure,
  logGoogleAuthStage,
} from "@/auth/google-auth-diagnostics";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (correo: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  registerWithGoogle: (input: {
    idToken: string;
    nombre: string;
    telefono: string;
    fechaNacimiento: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  sessionMessage: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setLocalAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const clearSession = useCallback(async () => {
    setUser(null);
    setLocalAccessToken(null);
    setAccessToken(null);
    queryClient.clear();
    try {
      await sessionStorage.clear();
    } finally {
      await signOutGoogleFirebase();
    }
  }, [queryClient]);

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
    configureAuth({
      getAccessToken: () => accessToken,
      refresh: refreshSession,
      clear: clearSession,
    });
  }, [accessToken, clearSession, refreshSession]);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshSession,
      async signIn(correo, password) {
        setSessionMessage(null);
        queryClient.clear();
        const result = await authApi.login(correo, password);
        setUser(result.user);
        setLocalAccessToken(result.accessToken);
        setAccessToken(result.accessToken);
        await sessionStorage.setRefreshToken(result.refreshToken);
      },
      async signInWithGoogle() {
        setSessionMessage(null);
        queryClient.clear();
        try {
          const firebaseUser = await signInWithGoogleFirebase();
          if (!firebaseUser) return false;
          let idToken: string;
          try {
            idToken = await firebaseUser.getIdToken();
            logGoogleAuthStage("firebase_id_token");
          } catch (error) {
            logGoogleAuthFailure("firebase_id_token", error);
            throw error;
          }
          const result = await authApi.loginWithGoogle(idToken);
          setUser(result.user);
          setLocalAccessToken(result.accessToken);
          setAccessToken(result.accessToken);
          await sessionStorage.setRefreshToken(result.refreshToken);
          return true;
        } catch (error) {
          await clearSession();
          throw error;
        }
      },
      async registerWithGoogle(input) {
        setSessionMessage(null);
        queryClient.clear();
        try {
          const result = await authApi.registerWithGoogle(input);
          await sessionStorage.setRefreshToken(result.refreshToken);
          setUser(result.user);
          setLocalAccessToken(result.accessToken);
          setAccessToken(result.accessToken);
        } catch (error) {
          await clearSession();
          throw error;
        }
      },
      async signOut() {
        try {
          if (accessToken) {
            await unregisterCurrentDeviceToken();
            await authApi.logout();
          }
        } finally {
          await clearSession();
        }
      },
      sessionMessage,
    }),
    [
      accessToken,
      clearSession,
      loading,
      queryClient,
      refreshSession,
      sessionMessage,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
