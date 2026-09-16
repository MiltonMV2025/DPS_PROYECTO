"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

type PdfSection = { label: string; value: string };
type PdfTable = { headers: string[]; rows: string[][] };
type Props = { filename: string; title: string; subtitle?: string; description?: string; sectionTitle?: string; sections: PdfSection[]; table?: PdfTable; label?: string };

export function ExportPdfButton({ filename, title, subtitle, description, sectionTitle, sections, table, label = "Exportar PDF" }: Props) {
  const [pending, setPending] = useState(false);
  async function exportPdf() {
    setPending(true);
    try {
      const response = await fetch("/api/v1/documents/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, subtitle, description, sectionTitle, sections, table }) });
      if (!response.ok) throw new Error("No se pudo generar el PDF.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setPending(false);
    }
  }
  return <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void exportPdf()}><FileDown aria-hidden="true" className="h-4 w-4" />{pending ? "Generando..." : label}</Button>;
}
