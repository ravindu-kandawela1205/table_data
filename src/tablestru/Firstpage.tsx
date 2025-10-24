"use client";

import * as React from "react";
import type { User } from "@/types/user";
import { getUsers } from "@/apis/user"; // or "@/apis/users"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columnsWithView } from "./columns-view";

/**
 * Expect your getUsers(page, pageSize) to return:
 * { data: User[]; total: number }
 * where `page` is 1-based.
 */

export default function UsersPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [rows, setRows] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // selection across pages
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  // details dialog
  const [open, setOpen] = React.useState(false);
  const [activeUser, setActiveUser] = React.useState<User | null>(null);

  React.useEffect(() => {
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
    return () => {
      ignore = true;
    };
  }, [page, pageSize]);

  const openDetails = (user: User) => {
    setActiveUser(user);
    setOpen(true);
  };

  return (
    <>
      <DataTable
        columns={columnsWithView}
        data={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onRowAction={openDetails}
      />

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
    </>
  );
}
