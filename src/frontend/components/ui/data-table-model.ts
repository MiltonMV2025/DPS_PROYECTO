export const pageSizeOptions = [25, 50, 100] as const;
export type PageSize = (typeof pageSizeOptions)[number];
export type SortDirection = "asc" | "desc";

export function getTablePage<T>(
  rows: readonly T[],
  page: number,
  pageSize: PageSize,
) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * pageSize;
  return {
    currentPage,
    totalPages,
    visibleRows: rows.slice(start, start + pageSize),
    firstRow: rows.length ? start + 1 : 0,
    lastRow: Math.min(start + pageSize, rows.length),
  };
}

export function sortTableRows<T>(
  rows: readonly T[],
  accessor: keyof T,
  direction: SortDirection,
) {
  return [...rows].sort(
    (first, second) =>
      String(first[accessor] ?? "").localeCompare(
        String(second[accessor] ?? ""),
        "es",
        { numeric: true },
      ) * (direction === "asc" ? 1 : -1),
  );
}

export function getPageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  const pages = Array.from(
    new Set([1, current - 1, current, current + 1, total]),
  )
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}
