import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { ReadOnlyDataTable } from "./ReadOnlyDataTable";
import type { DataTableColumn } from "@/frontend/components/ui/data-table";

export function ModuleDataPage({ title, description, data, columns, rowLabel, error, searchKeys = [] }: { title: string; description: string; data: Record<string, unknown>[]; columns: ReadonlyArray<DataTableColumn<Record<string, unknown>>>; rowLabel: string; error?: string; searchKeys?: string[] }) {
  return <section className="space-y-6"><div><h1 className="text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-600">{description}</p></div><Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{error ? <Alert variant="error"><AlertTitle>Error de datos</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : <ReadOnlyDataTable columns={columns} data={data} caption={`Listado de ${rowLabel}`} rowLabel={rowLabel} searchKeys={searchKeys} />}</CardContent></Card></section>;
}
