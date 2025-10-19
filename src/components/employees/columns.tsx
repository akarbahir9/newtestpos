"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Database } from "@/types"
import { formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type Employee = Database['public']['Tables']['employees']['Row'];

interface ColumnsProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Employee>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ناوی کارمەند
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "role",
    header: "پلە",
    cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>
    },
  },
  {
    accessorKey: "created_at",
    header: "کاتی دروستبوون",
    cell: ({ row }) => <div>{formatDateTime(row.getValue("created_at"))}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">کردنەوەی مێنو</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" dir="rtl">
            <DropdownMenuLabel>کارەکان</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              دەستکاری
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(employee)}
            >
              سڕینەوە
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
