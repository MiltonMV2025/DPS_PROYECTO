"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";
import { Button } from "@/frontend/components/ui/button";

type ToastAlertProps = { variant: "success" | "info" | "error"; title: string; message?: string; onClose: () => void; duration?: number };

export function ToastAlert({ variant, title, message, onClose, duration = 5000 }: ToastAlertProps) {
  useEffect(() => { const timer = window.setTimeout(onClose, duration); return () => window.clearTimeout(timer); }, [duration, onClose]);
  return <Alert variant={variant} className="fixed bottom-4 right-4 z-[70] w-[min(24rem,calc(100vw-2rem))] pr-12 shadow-lg" role={variant === "error" ? "alert" : "status"}><AlertTitle>{title}</AlertTitle>{message && <AlertDescription>{message}</AlertDescription>}<Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Cerrar mensaje" onClick={onClose}><X aria-hidden="true" className="h-4 w-4" /></Button></Alert>;
}
