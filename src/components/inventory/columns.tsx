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

export type Product = Database['public']['Tables']['products']['Row'];

interface ColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ناوی کاڵا
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "جۆر",
    cell: ({ row }) => <div>{row.getValue("category") || 'N/A'}</div>,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            دانە
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="text-center">{row.getValue("stock")}</div>,
  },
  {
    accessorKey: "purchase_price",
    header: () => <div className="text-right">نرخی کڕین</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchase_price"))
      return <div className="text-right font-medium" dir="rtl">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "sale_price",
    header: () => <div className="text-right">نرخی فرۆشتن</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sale_price"))
      return <div className="text-right font-medium" dir="rtl">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

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
            <DropdownMenuItem onClick={() => onEdit(product)}>
              دەستکاری
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(product)}
            >
              سڕینەوە
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
