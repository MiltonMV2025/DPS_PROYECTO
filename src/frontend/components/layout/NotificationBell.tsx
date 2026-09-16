"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/notifications", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: { items?: Notification[] } };
    setItems(payload.data?.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = items.filter((item) => !item.readAt).length;

  const markRead = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
      setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/notifications/read-all", { method: "PATCH" });
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}>
          <Bell aria-hidden="true" className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notificaciones</DialogTitle>
          <DialogDescription>Actualizaciones sobre tus citas y atención.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" disabled={!unread || loading} onClick={() => void markAllRead()}>
            <CheckCheck aria-hidden="true" className="h-4 w-4" /> Marcar todo como leído
          </Button>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto" aria-live="polite">
          {!items.length && <p className="py-8 text-center text-sm text-slate-600">No tenés notificaciones.</p>}
          {items.map((item) => (
            <button key={item.id} type="button" disabled={loading || Boolean(item.readAt)} onClick={() => void markRead(item.id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${item.readAt ? "bg-white" : "bg-primary-light"}`}>
              <div className="flex items-start justify-between gap-3"><span className="font-medium text-slate-800">{item.title}</span>{!item.readAt && <Badge variant="info">Nueva</Badge>}</div>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <time className="mt-2 block text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("es-SV")}</time>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
