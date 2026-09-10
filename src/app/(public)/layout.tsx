import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { getCurrentUser } from "@/frontend/lib/session";

export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <Link href="/login" className="flex items-center gap-3 text-primary" aria-label="Sonrisa Digital">
        <Stethoscope aria-hidden="true" className="h-8 w-8" />
        <span className="text-xl font-bold">Sonrisa Digital</span>
      </Link>
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </div>
  );
}
