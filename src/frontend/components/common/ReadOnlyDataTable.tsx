import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/frontend/components/ui/data-table";


type Props = {
  columns: ReadonlyArray<DataTableColumn<Record<string, unknown>>>;
  data: ReadonlyArray<Record<string, unknown>>;
  caption: string;
  rowLabel: string;
  searchKeys?: ReadonlyArray<string>;

  // NUEVO
  filters?: ReadonlyArray<DataTableFilter<Record<string, unknown>>>;
};

export function ReadOnlyDataTable({
  columns,
  data,
  caption,
  rowLabel,
  searchKeys = [],
  filters = [],
}: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      caption={caption}
      rowLabel={rowLabel}
      searchKeys={searchKeys}
      filters={filters}
    />
  );
}