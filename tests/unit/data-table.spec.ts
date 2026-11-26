import { expect, test } from "@playwright/test";
import {
  getPageNumbers,
  getTablePage,
  matchesFilterValue,
  pageSizeOptions,
  sortTableRows,
} from "../../src/frontend/components/ui/data-table-model";

const rows = Array.from({ length: 125 }, (_, index) => ({ id: index + 1 }));
test("page sizes and page boundaries preserve all records", () => {
  for (const size of pageSizeOptions) {
    const first = getTablePage(rows, 1, size);
    expect(first.visibleRows).toHaveLength(size);
    const last = getTablePage(rows, 999, size);
    expect(last.currentPage).toBe(Math.ceil(125 / size));
    expect(last.lastRow).toBe(125);
    expect(last.visibleRows.at(-1)?.id).toBe(125);
  }
  expect(getTablePage(rows, 2, 25).visibleRows[0].id).toBe(26);
});
test("empty and reduced results clamp page and range", () => {
  expect(getTablePage([], 3, 25)).toEqual({
    currentPage: 1,
    totalPages: 1,
    firstRow: 0,
    lastRow: 0,
    visibleRows: [],
  });
  expect(getTablePage(rows.slice(0, 2), 5, 25).currentPage).toBe(1);
});
test("sorting is numeric, reversible and immutable", () => {
  const input = [{ value: "10" }, { value: "2" }, { value: "1" }];
  expect(sortTableRows(input, "value", "asc").map((row) => row.value)).toEqual([
    "1",
    "2",
    "10",
  ]);
  expect(sortTableRows(input, "value", "desc").map((row) => row.value)).toEqual(
    ["10", "2", "1"],
  );
  expect(input[0].value).toBe("10");
});
test("pagination window includes endpoints without unbounded buttons", () => {
  expect(getPageNumbers(1, 1)).toEqual([1]);
  expect(getPageNumbers(5, 10)).toEqual([
    1,
    "ellipsis",
    4,
    5,
    6,
    "ellipsis",
    10,
  ]);
  expect(getPageNumbers(1, 100)).toEqual([1, 2, "ellipsis", 100]);
});
test("exact filters compare the whole cell value", () => {
  expect(matchesFilterValue("Karla Beltrán", "Karla Beltrán")).toBe(true);
  expect(matchesFilterValue("Karla Beltrán", "Karla")).toBe(false);
  expect(matchesFilterValue(null, "null")).toBe(true);
});
test("recent filters keep rows inside the day window", () => {
  const now = Date.parse("2026-09-19T12:00:00.000Z");
  const daysAgo = (days: number) =>
    new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  expect(matchesFilterValue(daysAgo(0), "7", "recent", now)).toBe(true);
  expect(matchesFilterValue(daysAgo(7), "7", "recent", now)).toBe(true);
  expect(matchesFilterValue(daysAgo(8), "7", "recent", now)).toBe(false);
  expect(matchesFilterValue(daysAgo(89), "90", "recent", now)).toBe(true);
  expect(matchesFilterValue(daysAgo(91), "90", "recent", now)).toBe(false);
});
test("recent filters reject invalid dates and invalid day counts", () => {
  const now = Date.parse("2026-09-19T12:00:00.000Z");
  expect(matchesFilterValue("no es fecha", "30", "recent", now)).toBe(false);
  expect(matchesFilterValue(null, "30", "recent", now)).toBe(false);
  expect(matchesFilterValue("2026-09-18T12:00:00.000Z", "abc", "recent", now)).toBe(
    false,
  );
});
