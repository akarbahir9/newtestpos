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
import { formatCurrency } from "@/lib/utils"

export type Customer = Database['public']['Tables']['customers']['Row'];

interface ColumnsProps {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Customer>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ناوی کڕیار
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "ژمارەی تەلەفۆن",
    cell: ({ row }) => <div>{row.getValue("phone") || 'N/A'}</div>,
  },
  {
    accessorKey: "address",
    header: "ناونیشان",
    cell: ({ row }) => <div>{row.getValue("address") || 'N/A'}</div>,
  },
  {
    accessorKey: "loan_balance",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            بڕی قەرز
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("loan_balance"))
        const isNegative = amount < 0;
        return (
            <div className={`text-right font-medium ${isNegative ? 'text-red-500' : ''}`} dir="rtl">
                {formatCurrency(amount)}
            </div>
        )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original

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
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              دەستکاری
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(customer)}
            >
              سڕینەوە
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
