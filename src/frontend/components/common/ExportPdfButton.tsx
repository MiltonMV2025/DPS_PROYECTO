"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ToastAlert } from "@/frontend/components/common/ToastAlert";

type PdfSection = { label: string; value: string };
type PdfTable = { headers: string[]; rows: string[][] };
type Props = { filename: string; title: string; subtitle?: string; description?: string; sectionTitle?: string; sections: PdfSection[]; table?: PdfTable; label?: string };

export function ExportPdfButton({ filename, title, subtitle, description, sectionTitle, sections, table, label = "Exportar PDF" }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function exportPdf() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/documents/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, subtitle, description, sectionTitle, sections, table }) });
      if (!response.ok) throw new Error("No se pudo generar el PDF.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Verificá tu conexión e intentá nuevamente.");
    } finally {
      setPending(false);
    }
  }
  return <><Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void exportPdf()}><FileDown aria-hidden="true" className="h-4 w-4" />{pending ? "Generando..." : label}</Button>{error && <ToastAlert variant="error" title="No se pudo exportar el PDF" message={error} onClose={() => setError(null)} />}</>;
}
