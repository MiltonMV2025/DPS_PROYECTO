"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/backend/database/entities";

export type AuthUser = {
  id: number;
  nombre: string;
  correo: string;
  rol: UserRole;
};

type Credentials = { correo: string; password: string };
type RegisterData = {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  fechaNacimiento: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function postJson(url: string, body?: unknown): Promise<AuthUser | null> {
  const response = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "No se pudo completar la solicitud.");
  }
  return payload?.data ?? null;
}

export function AuthProvider({ initialUser, children }: { initialUser: AuthUser | null; children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const router = useRouter();

  const login = useCallback(
    async (credentials: Credentials) => {
      const next = await postJson("/api/v1/auth/login", credentials);
      setUser(next);
      router.replace("/");
      router.refresh();
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const next = await postJson("/api/v1/auth/register", data);
      setUser(next);
      router.replace("/");
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(async () => {
    await postJson("/api/v1/auth/logout");
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
