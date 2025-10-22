import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from 'lucide-react';
import type { User } from '@/types/user';
import { getUsers } from '@/apis/user'; // change to "@/apis/users" if needed

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const UserTable: React.FC = () => {
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // selection across pages (store ids)
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // dialog state
  const [open, setOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // fetch page
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getUsers(page, pageSize)
      .then(({ data, total }) => {
        if (ignore) return;
        setRows(data);
        setTotal(total);
      })
      .catch(() => {
        if (ignore) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [page, pageSize]);

  // selection helpers
  const pageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const pageSelectedCount = useMemo(
    () => pageIds.filter((id) => selected.has(id)).length,
    [pageIds, selected]
  );
  const allOnPageSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const someOnPageSelected = pageSelectedCount > 0 && pageSelectedCount < pageIds.length;

  const toggleRow = (id: number, checked: boolean | string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllOnPage = (checked: boolean | string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) pageIds.forEach((id) => next.add(id));
      else pageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // open dialog with user
  const openDetails = (user: User) => {
    setActiveUser(user);
    setOpen(true);
  };

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
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected ? true : (someOnPageSelected ? 'indeterminate' : false)}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="w-[70px]">ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={`s-${i}-${j}`}>
                      <Skeleton className="h-4 w-[60%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={(c) => toggleRow(u.id, c)}
                      aria-label={`Select row ${u.id}`}
                    />
                  </TableCell>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.firstName}</TableCell>
                  <TableCell>{u.lastName}</TableCell>
                  <TableCell className="tabular-nums">{u.age}</TableCell>
                  <TableCell className="capitalize">{u.gender}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white text-gray-800 hover:bg-gray-100"
                          aria-label="Row actions"
                        >
                          …
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-white text-gray-800 border border-gray-200 shadow-md"
                        align="end"
                      >
                        <DropdownMenuLabel className="text-gray-600">
                          User Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-gray-100"
                          onSelect={() => openDetails(u)}
                        >
                          More Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer (pagination) */}
      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          {selected.size} of {total} row(s) selected.
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                const next = parseInt(v, 10);
                setPageSize(next);
                setPage(1);
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
              onClick={() => setPage(1)}
              disabled={page <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 rounded-md"
              onClick={() => setPage(pageCount)}
              disabled={page >= pageCount}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription className="text-gray-500">
              Full information about the selected user.
            </DialogDescription>
          </DialogHeader>

          {activeUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="font-medium">{activeUser.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">First Name</p>
                <p className="font-medium">{activeUser.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Name</p>
                <p className="font-medium">{activeUser.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-medium">{activeUser.age}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium capitalize">{activeUser.gender}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{activeUser.email}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{activeUser.phone}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No user selected.</div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;
