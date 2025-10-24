import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import type { User } from "@/types/user";
import type { TableMeta } from "./columns-view";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

type DataTableProps = {
  columns: ColumnDef<User, any>[];
  data: User[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  loading?: boolean;

  // selection across pages: managed via Set of ids outside
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowAction: (user: User) => void;
  onSecondaryAction?: (user: User) => void;
  onViewAction?: (user: User) => void;
};

export function DataTable({
  columns,
  data,
  total,
  page,
  pageSize,
  loading = false,
  selectedIds,
  setSelectedIds,
  onPageChange,
  onPageSizeChange,
  onRowAction,
  onSecondaryAction,
  onViewAction,
}: DataTableProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Helpers for “select all on page”
  const pageIds = React.useMemo(() => data.map((d) => d.id), [data]);
  const pageSelectedCount = React.useMemo(
    () => pageIds.filter((id) => selectedIds.has(id)).length,
    [pageIds, selectedIds]
  );
  const allOnPageSelected =
    pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const someOnPageSelected =
    pageSelectedCount > 0 && pageSelectedCount < pageIds.length;

  const toggleAllOnPage = (checked: boolean | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) pageIds.forEach((id) => next.add(id));
      else pageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // meta provides hooks to columns/actions
    meta: {
      isRowSelected: (id: number) => selectedIds.has(id),
      toggleRowSelected: (id: number, selected: boolean) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (selected) next.add(id);
          else next.delete(id);
          return next;
        });
      },
      onRowAction,
      onSecondaryAction,
      onViewAction,
    } as TableMeta,
    // We keep sorting/filtering out for simplicity; add if you need later.
  });

  return (
    <div className="w-full space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Table</h2>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Our custom header checkbox for 'select all on page' */}
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all on page"
                />
              </TableHead>

              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  // We render headers except the first "select" one—already above.
                  if (header.id === "select") return null;
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  {/* 9 visible skeleton cells to match your previous layout */}
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={`s-${i}-${j}`}>
                      <Skeleton className="h-4 w-[60%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {/* Row checkbox (first column) */}
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedIds.has(row.original.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (c) next.add(row.original.id);
                          else next.delete(row.original.id);
                          return next;
                        })
                      }
                      aria-label={`Select row ${row.original.id}`}
                    />
                  </TableCell>

                  {/* Render the rest of cells, skipping the virtual "select" header */}
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === "select") return null;
                    return (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer (pagination) */}
      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          {selectedIds.size} of {total} row(s) selected.
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                const next = parseInt(v, 10);
                onPageSizeChange(next);
              }}
            >
              <SelectTrigger className="h-8 w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-muted-foreground tabular-nums">
            Page {page} of {pageCount}
          </span>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => onPageChange(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => onPageChange(pageCount)}
              disabled={page >= pageCount}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
