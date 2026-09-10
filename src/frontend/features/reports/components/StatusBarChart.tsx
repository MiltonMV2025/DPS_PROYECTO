import type { StatusBreakdownItem } from "@/backend/modules/read-models";

const labels: Record<string, string> = {
  pendiente: "Pendientes",
  confirmada: "Confirmadas",
  completada: "Completadas",
  cancelada: "Canceladas",
};

const barColors: Record<string, string> = {
  pendiente: "bg-blue-400",
  confirmada: "bg-primary",
  completada: "bg-emerald-500",
  cancelada: "bg-red-400",
};

export function StatusBarChart({ items }: { items: StatusBreakdownItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.total));
  return (
    <div className="space-y-3" role="img" aria-label="Distribución de citas por estado">
      {items.map((item) => (
        <div key={item.estado} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-slate-600">{labels[item.estado] ?? item.estado}</span>
          <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
            <div
              className={`h-full rounded ${barColors[item.estado] ?? "bg-slate-400"}`}
              style={{ width: `${Math.round((item.total / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{item.total}</span>
        </div>
      ))}
    </div>
  );
}
