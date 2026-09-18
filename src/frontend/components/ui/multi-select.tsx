"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

export function MultiSelect({ label, options, value, onChange }: { label: string; options: ReadonlyArray<{ value: string; label: string }>; value: string[]; onChange: (value: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const summary = value.length === 0 ? "Todas" : value.length === 1 ? value[0] : `${value.length} seleccionadas`;
  return <div ref={ref} className="relative w-full sm:w-64">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <Button type="button" variant="outline" className="w-full justify-between font-normal" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{summary}<ChevronDown aria-hidden="true" className="h-4 w-4" /></Button>
    {open && <div role="listbox" aria-label={label} aria-multiselectable="true" className="absolute left-0 top-[4.75rem] z-50 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
      {options.length === 0 ? <p className="px-3 py-2 text-sm text-slate-500">Sin categorías</p> : options.map((option) => { const selected = value.includes(option.value); return <button key={option.value} type="button" role="option" aria-selected={selected} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-slate-100" onClick={() => onChange(selected ? value.filter((item) => item !== option.value) : [...value, option.value])}><span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-slate-300"}`}>{selected && <Check aria-hidden="true" className="h-3 w-3" />}</span>{option.label}</button>; })}
    </div>}
  </div>;
}
