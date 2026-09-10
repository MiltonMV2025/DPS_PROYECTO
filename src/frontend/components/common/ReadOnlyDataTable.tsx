"use client";

import { DataTable, type DataTableColumn } from "@/frontend/components/ui/data-table";

type Props = { columns: ReadonlyArray<DataTableColumn<Record<string, unknown>>>; data: ReadonlyArray<Record<string, unknown>>; caption: string; rowLabel: string; searchKeys?: ReadonlyArray<string> };
export function ReadOnlyDataTable({ columns, data, caption, rowLabel, searchKeys = [] }: Props) {
  return <DataTable columns={columns} data={data} caption={caption} rowLabel={rowLabel} searchKeys={searchKeys} />;
}
