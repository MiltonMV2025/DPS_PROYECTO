"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { useAuth } from "./AuthContext";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await login({
        correo: String(form.get("correo") ?? ""),
        password: String(form.get("password") ?? ""),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-600">Accedé al panel de Sonrisa Digital.</p>
      </div>
      {error && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="correo">Correo</Label>
        <Input id="correo" name="correo" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
