"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

export type ActionMenuItem = { label: string; onSelect: () => void; destructive?: boolean };

export function ActionMenu({ label, items, disabled = false }: { label: string; items: ActionMenuItem[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 176;
      setPosition({ top: rect.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width)) });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => { window.removeEventListener("resize", updatePosition); window.removeEventListener("scroll", updatePosition, true); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  return <>
    <Button ref={triggerRef} type="button" variant="ghost" size="icon" className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" aria-label={label} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)}>
      <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
    </Button>
    {open && typeof document !== "undefined" && createPortal(<div ref={menuRef} role="menu" className="fixed z-[80] min-w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg" style={{ top: position.top, left: position.left }}>
      {items.map((item) => <button key={item.label} type="button" role="menuitem" className={`block w-full px-3 py-2 text-left hover:bg-slate-100 ${item.destructive ? "text-red-700 hover:bg-red-50" : ""}`} onClick={() => { setOpen(false); item.onSelect(); }}>{item.label}</button>)}
    </div>, document.body)}
  </>;
}
