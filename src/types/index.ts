export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          address: string | null
          loan_balance: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          address?: string | null
          loan_balance?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          address?: string | null
          loan_balance?: number
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          created_at: string
          name: string
          role: "admin" | "cashier"
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: "admin" | "cashier"
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: "admin" | "cashier"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          barcode: string | null
          purchase_price: number
          sale_price: number
          stock: number
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          barcode?: string | null
          purchase_price: number
          sale_price: number
          stock?: number
          category?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          barcode?: string | null
          purchase_price?: number
          sale_price?: number
          stock?: number
          category?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price_at_sale?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            referencedRelation: "sales"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          created_at: string
          employee_id: string
          customer_id: string | null
          total_amount: number
          payment_method: "cash" | "loan"
        }
        Insert: {
          id?: string
          created_at?: string
          employee_id: string
          customer_id?: string | null
          total_amount: number
          payment_method?: "cash" | "loan"
        }
        Update: {
          id?: string
          created_at?: string
          employee_id?: string
          customer_id?: string | null
          total_amount?: number
          payment_method?: "cash" | "loan"
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_sale: {
        Args: {
          p_employee_id: string
          p_customer_id: string | null
          p_payment_method: "cash" | "loan"
          p_sale_items: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
