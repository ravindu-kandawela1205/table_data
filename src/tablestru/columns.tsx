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

/**
 * We use TanStack Table's `table.options.meta` to pass helpers from DataTable.
 * Types here reflect what DataTable will provide.
 */
export type TableMeta = {
  isRowSelected: (id: number) => boolean;
  toggleRowSelected: (id: number, selected: boolean) => void;
  openRemove: (user: User) => void;
};

export const columns: ColumnDef<User, any>[] = [
  {
    id: "select",
    header: ({ table }) => {
      // We’ll manage "select all on page" in the DataTable header instead;
      // keep a disabled header here to align with shadcn example.
      return (
        <div className="w-10" />
      );
    },
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
  {
    id: "actions",
    header: () => <div className="text-right pr-1">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const u = row.original;
      return (
        <div className="text-right">
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
              align="end"
              className="bg-white text-gray-800 border border-gray-200 shadow-md"
            >
              <DropdownMenuLabel className="text-gray-600">
                User Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100"
                onSelect={() => meta.openRemove(u)}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    size: 100,
  },
];
