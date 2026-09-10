import type { ReactNode } from "react";
import { AuthProvider, type AuthUser } from "@/frontend/features/auth/AuthContext";

export function AppProviders({ user, children }: Readonly<{ user: AuthUser | null; children: ReactNode }>) {
  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
