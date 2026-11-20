import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}><AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider></QueryClientProvider>;
}
