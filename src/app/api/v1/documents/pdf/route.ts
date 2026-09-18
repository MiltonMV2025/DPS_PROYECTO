import PDFDocument from "pdfkit";
import { z } from "zod";
import { requireApiUser } from "@/frontend/lib/session";
import { readJson } from "../../_http";
import { toHttpError } from "@/backend/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const documentSchema = z.object({
  title: z.string().trim().min(1).max(150),
  subtitle: z.string().trim().max(150).optional(),
  description: z.string().trim().max(500).optional(),
  sectionTitle: z.string().trim().max(100).optional(),
  sections: z.array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().max(1000) })).max(30),
  table: z.object({ headers: z.array(z.string().max(80)).min(1).max(15), rows: z.array(z.array(z.string().max(2000))).max(500) }).optional(),
});

function createPdf(input: z.infer<typeof documentSchema>): Promise<Buffer> {
  return new Promise((resolve) => {
    const document = new PDFDocument({ size: "A4", margin: 44, info: { Title: input.title, Author: "Sonrisa Digital" } });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    const marginX = 44;
    const width = document.page.width - marginX * 2;
    const appointmentNumberField = input.sections[0]?.label.match(/no\.?\s*de\s*cita/i) ? input.sections[0] : undefined;
    const isAppointmentPdf = /informaci[oó]n de la cita/i.test(input.sectionTitle ?? "");
    const appointmentSections = input.sections.filter((field) => !/paciente|no\.?\s*de\s*cita/i.test(field.label));
    const clinicalFields = ["Observaciones", "Recomendaciones", "Receta"];
    const sections = isAppointmentPdf
      ? [
          ...appointmentSections,
          ...clinicalFields
            .filter((label) => !appointmentSections.some((field) => field.label.toLowerCase() === label.toLowerCase()))
            .map((label) => ({ label, value: `Sin ${label.toLowerCase()}` })),
        ]
      : appointmentNumberField
        ? input.sections.slice(1)
        : input.sections;
    const drawBrand = () => {
      document.fillColor("#33A7DC").font("Helvetica-Bold").fontSize(19).text("Sonrisa Digital", marginX, 40, { width });
      document.fillColor("#60758F").font("Helvetica").fontSize(8.5).text("CLINICA DENTAL", marginX, 63, { width });
      if (appointmentNumberField) {
        document.fillColor("#17324D").font("Helvetica-Bold").fontSize(14).text(appointmentNumberField.value, marginX, 48, { width, align: "right" });
      }
    };
    const drawFooter = () => {
      const cursorY = document.y;
      const y = document.page.height - 82;
      document.strokeColor("#D7E5EE").lineWidth(0.8).moveTo(marginX, y).lineTo(marginX + width, y).stroke();
      document.fillColor("#60758F").font("Helvetica").fontSize(7.5).text("Sonrisa Digital | Clinica Dental | Atencion odontologica integral", marginX, y + 8, { width, align: "center", lineBreak: false });
      document.y = cursorY;
    };
    drawBrand();
    drawFooter();
    const headerY = 95;
    document.y = headerY;
    document.fillColor("#17324D").font("Helvetica-Bold").fontSize(15).text(input.title, marginX, headerY, { width: input.subtitle ? width * 0.58 : width });
    if (input.subtitle) document.fillColor("#334155").font("Helvetica-Bold").fontSize(10).text(input.subtitle, marginX + width * 0.58, headerY + 4, { width: width * 0.42, align: "right" });
    document.y = headerY + 26;
    if (input.description) document.fillColor("#64748B").font("Helvetica").fontSize(8.5).text(input.description, marginX, document.y, { width, lineGap: 2, align: "justify" });
    document.moveDown(0.7).strokeColor("#33A7DC").lineWidth(1.5).moveTo(marginX, document.y).lineTo(marginX + width, document.y).stroke();
    document.moveDown(1).fillColor("#17324D").fontSize(12).font("Helvetica-Bold").text(input.sectionTitle ?? "Informacion general", marginX, document.y, { width, align: "center" });
    document.moveDown(0.65).font("Helvetica").fontSize(9);
    const drawField = (field: { label: string; value: string }, x: number, fieldWidth: number) => {
      const valueHeight = document.heightOfString(field.value || "-", { width: fieldWidth - 20, lineGap: 1 });
      const rowHeight = Math.max(42, valueHeight + 25);
      const y = document.y;
      document.roundedRect(x, y, fieldWidth, rowHeight, 6).fillAndStroke("#F6FAFC", "#D7E5EE");
      document.fillColor("#60758F").font("Helvetica").fontSize(8).text(field.label.toUpperCase(), x + 10, y + 8, { width: fieldWidth - 20 });
      document.fillColor("#172033").font("Helvetica-Bold").fontSize(10.5).text(field.value || "-", x + 10, y + 22, { width: fieldWidth - 20, lineGap: 1 });
      document.y = y + rowHeight + 9;
    };
    for (let index = 0; index < sections.length; index += 2) {
      const left = sections[index];
      const right = sections[index + 1];
      if (!right) {
        if (document.y + 50 > document.page.height - 48) { document.addPage(); drawBrand(); drawFooter(); document.y = 95; }
        drawField(left, marginX, width);
      } else {
        const columnWidth = (width - 18) / 2;
        if (document.y + 50 > document.page.height - 48) { document.addPage(); drawBrand(); drawFooter(); document.y = 95; }
        const startY = document.y;
        drawField(left, marginX, columnWidth);
        const leftEndY = document.y;
        document.y = startY;
        drawField(right, marginX + columnWidth + 18, columnWidth);
        document.y = Math.max(leftEndY, document.y) + 4;
      }
    }
    if (input.table) {
      document.moveDown(0.5).fillColor("#12304D").font("Helvetica-Bold").fontSize(12).text("Detalle");
      document.moveDown(0.5);
      const columnWidth = width / input.table.headers.length;
      const drawRow = (cells: string[], header = false) => {
        const y = document.y;
        const rowHeight = Math.max(24, ...cells.map((cell) => document.heightOfString(cell || "-", { width: columnWidth - 10 }) + 10));
        if (y + rowHeight > document.page.height - 48) { document.addPage(); drawBrand(); drawFooter(); document.y = 95; }
        const rowY = document.y;
        cells.forEach((cell, index) => { const x = marginX + index * columnWidth; document.rect(x, rowY, columnWidth, rowHeight).fillAndStroke(header ? "#33A7DC" : index % 2 ? "#FFFFFF" : "#F8FBFD", "#DBE7EF"); document.fillColor(header ? "#FFFFFF" : "#172033").font(header ? "Helvetica-Bold" : "Helvetica").fontSize(header ? 7 : 8).text(cell || "-", x + 5, rowY + 5, { width: columnWidth - 10, height: rowHeight - 8 }); });
        document.y = rowY + rowHeight;
      };
      drawRow(input.table.headers, true);
      input.table.rows.forEach((row) => drawRow(input.table!.headers.map((_, index) => row[index] ?? "-")));
    }

    document.end();
  });
}

export function POST(request: Request) {
  return (async () => {
    try {
      await requireApiUser();
      const input = documentSchema.parse(await readJson(request));
      const pdf = await createPdf(input);
      return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=sonrisa-digital.pdf" } });
    } catch (error) {
      const mapped = toHttpError(error);
      return Response.json({ error: { code: mapped.code, message: mapped.message } }, { status: mapped.status });
    }
  })();
}
