"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columnsWithRemove } from "./columns-view";
import { useLocalUsers, type LocalUser } from "@/store/useLocalUsers";

/**
 * IMPORTANT: We coerce `age` to a number.
 * Zod's INPUT type becomes `unknown`, and OUTPUT becomes `number`.
 * We tell RHF about both by using useForm<Input, Context, Output>.
 */
const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.coerce.number().int().min(18, "Age must be at least 18").max(150, "Age must be less than 150"),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type Schema = typeof schema;
type FormOutput = z.output<Schema>; // after coercion -> age: number
type FormInput  = z.input<Schema>;  // before coercion  -> age: unknown

export default function LocalUsersPage() {
  const { users, addUser, updateUser, removeUser } = useLocalUsers();

  // table state
  const [page, setPage] = React.useState(1); // 1-based
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  // add/edit dialog
  const [open, setOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<LocalUser | null>(null);

  // view dialog
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewingUser, setViewingUser] = React.useState<LocalUser | null>(null);

  // page data
  const total = users.length;
  const pageRows = React.useMemo<LocalUser[]>(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, page, pageSize]);

  /**
   * KEY FIX:
   * useForm<FormInput, any, FormOutput>
   * so handleSubmit receives FormOutput (typed, coerced numbers),
   * while the fields bind to FormInput safely.
   */
  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "" as unknown as number,
      gender: "male",
      email: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (editingUser) {
      form.reset({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        age: editingUser.age as any,
        gender: editingUser.gender as any,
        email: editingUser.email,
        phone: editingUser.phone || "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        age: "" as unknown as number,
        gender: "male",
        email: "",
        phone: "",
      });
    }
  }, [editingUser, form]);

  const handleSubmit = (data: FormOutput) => {
    if (editingUser) {
      updateUser(editingUser.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        email: data.email,
        phone: data.phone || undefined,
      });
    } else {
      addUser({
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        email: data.email,
        phone: data.phone || undefined,
      });
      const newTotal = total + 1;
      const newPageCount = Math.max(1, Math.ceil(newTotal / pageSize));
      setPage(newPageCount);
    }
    setOpen(false);
    setEditingUser(null);
  };

  const openEdit = (user: LocalUser) => {
    setEditingUser(user);
    setOpen(true);
  };

  const openView = (user: LocalUser) => {
    setViewingUser(user);
    setViewOpen(true);
  };

  const openRemove = (user: LocalUser) => {
    removeUser(user.id);

    // keep page valid if last row on last page was removed
    const newTotal = total - 1;
    const newPageCount = Math.max(1, Math.ceil(Math.max(0, newTotal) / pageSize));
    if (page > newPageCount) setPage(newPageCount);

    // unselect if selected
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(user.id);
      return next;
    });
  };

  return (
    <>
      {/* Add button */}
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingUser(null);
        }}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[520px] bg-white text-gray-800">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          // keep string-friendly value in the input
                          value={(field.value as any) ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            // let resolver coerce; keep '' as '' so RHF holds it
                            field.onChange(v === "" ? "" : Number(v));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange as any} value={(field.value as any) ?? "male"}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="sm:col-span-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <DataTable
        columns={columnsWithRemove}
        data={pageRows}
        page={page}
        pageSize={pageSize}
        total={total}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onPageChange={setPage}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        onRowAction={openRemove}
        onSecondaryAction={openEdit}
        onViewAction={openView}
      />

      {/* View User Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {viewingUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="font-medium">{viewingUser.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">First Name</p>
                <p className="font-medium">{viewingUser.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Name</p>
                <p className="font-medium">{viewingUser.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-medium">{viewingUser.age}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium capitalize">{viewingUser.gender}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{viewingUser.email}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{viewingUser.phone || "N/A"}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No user selected.</div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
