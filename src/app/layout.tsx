import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/frontend/providers/AppProviders";
import { getCurrentUser } from "@/frontend/lib/session";
import "./globals.css";

export const metadata: Metadata = { title: "Sonrisa Digital", description: "Sistema de gestión para clínica dental" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="es">
      <body>
        <AppProviders user={user}>{children}</AppProviders>
      </body>
    </html>
  );
}
