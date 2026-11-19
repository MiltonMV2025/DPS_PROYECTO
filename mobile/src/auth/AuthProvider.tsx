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
import { getApiErrorCode } from "@/api/errors";
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

export type GoogleAccount = { idToken: string; email: string; name: string };

/** Un solo botón de Google: inicia sesión si la cuenta existe o pide completar el registro si no. */
export type GoogleSignInResult =
  | { status: "signed-in" }
  | { status: "cancelled" }
  | { status: "needs-registration"; account: GoogleAccount };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (correo: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
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
        let account: GoogleAccount | null = null;
        try {
          const firebaseUser = await signInWithGoogleFirebase();
          if (!firebaseUser) return { status: "cancelled" };
          try {
            account = {
              idToken: await firebaseUser.getIdToken(),
              email: firebaseUser.email ?? "",
              name: firebaseUser.displayName ?? "",
            };
            logGoogleAuthStage("firebase_id_token");
          } catch (error) {
            logGoogleAuthFailure("firebase_id_token", error);
            throw error;
          }
          const result = await authApi.loginWithGoogle(account.idToken);
          setUser(result.user);
          setLocalAccessToken(result.accessToken);
          setAccessToken(result.accessToken);
          await sessionStorage.setRefreshToken(result.refreshToken);
          return { status: "signed-in" };
        } catch (error) {
          // La sesión de Google queda abierta para registrar la cuenta con el mismo token.
          if (account && getApiErrorCode(error) === "GOOGLE_ACCOUNT_NOT_LINKED")
            return { status: "needs-registration", account };
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
