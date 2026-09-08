import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/frontend/providers/AppProviders";
import "./globals.css";
export const metadata: Metadata = { title: "Sonrisa Digital", description: "Sistema de gestión para clínica dental" };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) { return <html lang="es"><body><AppProviders>{children}</AppProviders></body></html>; }
