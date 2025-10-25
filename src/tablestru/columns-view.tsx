import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/user";

export type TableMeta = {
  isRowSelected: (id: number) => boolean;
  toggleRowSelected: (id: number, selected: boolean) => void;
  onRowAction: (user: User) => void;
  onSecondaryAction?: (user: User) => void;
  onViewAction?: (user: User) => void;
};

const baseColumns: ColumnDef<User, any>[] = [
  {
    id: "select",
    header: () => <div className="w-10" />,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const u = row.original;
      const checked = meta.isRowSelected(u.id);
      return (
        <Checkbox
          aria-label={`Select row ${u.id}`}
          checked={checked}
          onCheckedChange={(c) => meta.toggleRowSelected(u.id, !!c)}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 44,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="tabular-nums">{row.original.id}</div>,
    size: 80,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => <div className="tabular-nums">{row.original.age}</div>,
    size: 80,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
    size: 110,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
];

export const columnsWithView: ColumnDef<User, any>[] = [
  ...baseColumns,
  {
    id: "actions",
    header: () => <div className="text-right pr-1">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const u = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => meta.onRowAction(u)}
            aria-label="View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    size: 80,
  },
];

export const columnsWithRemove: ColumnDef<User, any>[] = [
  ...baseColumns,
  {
    id: "actions",
    header: () => <div className="text-right pr-1">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const u = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {meta.onViewAction && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => meta.onViewAction!(u)}
              aria-label="View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Button>
          )}
          {meta.onSecondaryAction && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => meta.onSecondaryAction!(u)}
              aria-label="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => meta.onRowAction(u)}
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    size: 120,
  },
];
