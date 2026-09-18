"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { EmptyState } from "@/frontend/components/common/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/frontend/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import {
  getPageNumbers,
  getTablePage,
  pageSizeOptions,
  sortTableRows,
  type PageSize,
  type SortDirection,
} from "@/frontend/components/ui/data-table-model";

export type { SortDirection } from "@/frontend/components/ui/data-table-model";
export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  cell?: (value: T[keyof T], row: T) => ReactNode;
};
export type DataTableFilter<T> = {
  id: string;
  label: string;
  accessor: keyof T;
  options: ReadonlyArray<{ label: string; value: string }>;
};
type DataTableProps<T extends Record<string, unknown>> = {
  columns: ReadonlyArray<DataTableColumn<T>>;
  data: ReadonlyArray<T>;
  filters?: ReadonlyArray<DataTableFilter<T>>;
  searchKeys?: ReadonlyArray<keyof T>;
  searchPlaceholder?: string;
  rowLabel?: string;
  caption?: string;
  getRowId?: (row: T) => string;
  toolbarContent?: ReactNode;
  additionalFilterActive?: boolean;
  onClearAdditionalFilters?: () => void;
};
// Radix items cannot use an empty value. Keep the sentinel out of row filtering.
const allValues = "__all_values__";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  filters = [],
  searchKeys = [],
  searchPlaceholder = "Buscar...",
  rowLabel = "registros",
  caption = "Listado de registros",
  getRowId,
  toolbarContent,
  additionalFilterActive = false,
  onClearAdditionalFilters,
}: DataTableProps<T>) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );
  const [sort, setSort] = useState<{
    id: string;
    direction: SortDirection;
  } | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [page, setPage] = useState(1);
  const hasFilters = Boolean(
    query || Object.values(activeFilters).some(Boolean) || additionalFilterActive,
  );

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        const matchesQuery =
          !query.trim() ||
          searchKeys.some((key) =>
            String(row[key] ?? "")
              .toLocaleLowerCase("es")
              .includes(query.trim().toLocaleLowerCase("es")),
          );
        const matchesFilters = filters.every(
          (filter) =>
            !activeFilters[filter.id] ||
            String(row[filter.accessor]) === activeFilters[filter.id],
        );
        return matchesQuery && matchesFilters;
      }),
    [activeFilters, data, filters, query, searchKeys],
  );
  const sortedData = useMemo(() => {
    const column = columns.find((column) => column.id === sort?.id);
    return sort && column?.sortable
      ? sortTableRows(filteredData, column.accessor, sort.direction)
      : filteredData;
  }, [columns, filteredData, sort]);
  const { totalPages, currentPage, visibleRows, firstRow, lastRow } =
    getTablePage(sortedData, page, pageSize);

  function clearFilters() {
    setQuery("");
    setActiveFilters({});
    onClearAdditionalFilters?.();
    setPage(1);
  }
  function updateFilter(filterId: string, value: string) {
    setActiveFilters((current) => ({
      ...current,
      [filterId]: value === allValues ? "" : value,
    }));
    setPage(1);
  }
  function updatePageSize(value: string) {
    const size = pageSizeOptions.find((size) => String(size) === value);
    if (size) {
      setPageSize(size);
      setPage(1);
    }
  }
  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortable) return;
    setSort((current) =>
      current?.id === column.id
        ? {
            id: column.id,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { id: column.id, direction: "asc" },
    );
    setPage(1);
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        {searchKeys.length > 0 && (
          <div className="w-full xl:max-w-sm">
            <label
              htmlFor={`${id}-search`}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Buscar
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
              />
              <input
                id={`${id}-search`}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-end justify-end gap-3">
          {toolbarContent}
          {filters.map((filter) => (
            <div key={filter.id} className="w-full sm:w-52">
              <label
                htmlFor={`${id}-${filter.id}`}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {filter.label}
              </label>
              <Select
                value={activeFilters[filter.id] || allValues}
                onValueChange={(value) => updateFilter(filter.id, value)}
              >
                <SelectTrigger id={`${id}-${filter.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allValues}>Todos</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {(searchKeys.length > 0 || filters.length > 0 || toolbarContent) && (
            <Button className="mb-0.5" variant="ghost" disabled={!hasFilters} onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-primary-border md:block">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow className="border-primary bg-primary hover:bg-primary">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  scope="col"
                  aria-sort={
                    column.sortable
                      ? sort?.id === column.id
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  className="whitespace-nowrap text-primary-foreground"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-sm font-semibold"
                    >
                      {column.header}
                      {sort?.id === column.id ? (
                        sort.direction === "asc" ? (
                          <ChevronUp aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <ChevronDown aria-hidden="true" className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      )}
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row, rowIndex) => (
                <TableRow
                  key={getRowId?.(row) ?? rowIndex}
                  className="border-primary-border/60 bg-white hover:bg-primary-light"
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row[column.accessor], row)
                        : String(row[column.accessor] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length}><EmptyState title={`No se encontraron ${rowLabel}`} action={hasFilters && <Button variant="ghost" className="mt-2" onClick={clearFilters}>Restablecer búsqueda</Button>} /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {visibleRows.length ? visibleRows.map((row, rowIndex) => <article key={getRowId?.(row) ?? rowIndex} className="rounded-lg border border-primary-border bg-white p-4 shadow-sm"><dl className="space-y-3">{columns.map((column) => <div key={column.id} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-3 border-b border-primary-border/60 pb-3 last:border-0 last:pb-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{column.header}</dt><dd className="min-w-0 text-right text-sm text-slate-800">{column.cell ? column.cell(row[column.accessor], row) : String(row[column.accessor] ?? "")}</dd></div>)}</dl></article>) : <div className="rounded-lg border border-primary-border bg-white"><EmptyState title={`No se encontraron ${rowLabel}`} action={hasFilters && <Button variant="ghost" className="mt-2" onClick={clearFilters}>Restablecer búsqueda</Button>} /></div>}
      </div>
      <div className="flex flex-col gap-4 border-t border-primary-border pt-4 text-sm text-slate-600 xl:flex-row xl:items-center xl:justify-between">
        <p role="status" aria-live="polite" aria-atomic="true">
          {firstRow}–{lastRow} de {sortedData.length} {rowLabel} · Página{" "}
          {currentPage} de {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={`${id}-page-size`}>Mostrar</label>
          <Select value={String(pageSize)} onValueChange={updatePageSize}>
            <SelectTrigger id={`${id}-page-size`} className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Pagination
            className="mx-0 w-auto"
            aria-label={`Paginación de ${rowLabel}`}
          >
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                />
              </PaginationItem>
              {getPageNumbers(currentPage, totalPages).map((number, index) => (
                <PaginationItem key={`${number}-${index}`}>
                  {number === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      aria-label={`Página ${number}`}
                      isActive={number === currentPage}
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
