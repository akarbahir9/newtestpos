/*
# [Create Full Market Management Schema]
This script will create all the necessary tables for the market management system, including customers, products, employees, sales, and sale_items. It also establishes the relationships between them and sets up Row Level Security (RLS) for data protection.

## Query Description: This operation is structural and designed to be safe. It uses `IF NOT EXISTS` to avoid errors if tables already exist, preventing data loss. It will create new tables and enable RLS to ensure that users can only access data they are permitted to see. This is a foundational step to make the application functional.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Creates tables: `customers`, `products`, `employees`, `sales`, `sale_items`.
- Adds columns and primary/foreign keys to establish relationships.
- Creates a helper function `get_employee_role`.

## Security Implications:
- RLS Status: Enabled for all new tables.
- Policy Changes: Yes. New policies are created to control access based on user roles ('admin', 'cashier'). Authenticated users have read access to most data, while write/delete operations are restricted to authorized roles.
- Auth Requirements: Policies are tied to `auth.uid()`, linking database records to authenticated Supabase users.

## Performance Impact:
- Indexes: Primary keys will be indexed automatically.
- Triggers: None.
- Estimated Impact: Low. This is a one-time setup and will improve query performance by defining proper relationships.
*/

-- Create Customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  loan_balance NUMERIC NOT NULL DEFAULT 0
);

-- Create Products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  purchase_price NUMERIC NOT NULL,
  sale_price NUMERIC NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category TEXT
);

-- Create Employees table if it doesn't exist
-- Note: This assumes a user record exists in auth.users first.
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create Sales table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  employee_id UUID NOT NULL,
  customer_id UUID,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'loan')),
  CONSTRAINT fk_employee
    FOREIGN KEY(employee_id) 
    REFERENCES public.employees(id),
  CONSTRAINT fk_customer
    FOREIGN KEY(customer_id) 
    REFERENCES public.customers(id)
);

-- Create Sale Items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INT NOT NULL,
  price_at_sale NUMERIC NOT NULL,
  CONSTRAINT fk_sale
    FOREIGN KEY(sale_id) 
    REFERENCES public.sales(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_product
    FOREIGN KEY(product_id) 
    REFERENCES public.products(id)
);

/******************/
/* RLS POLICIES   */
/******************/

-- Enable RLS for all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  employee_role TEXT;
BEGIN
  SELECT role INTO employee_role
  FROM public.employees
  WHERE user_id = auth.uid();
  RETURN employee_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Policies for 'customers'
DROP POLICY IF EXISTS "Allow authenticated users to view customers" ON public.customers;
CREATE POLICY "Allow authenticated users to view customers" ON public.customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admins to manage customers" ON public.customers;
CREATE POLICY "Allow admins to manage customers" ON public.customers FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');


-- Policies for 'products'
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON public.products;
CREATE POLICY "Allow authenticated users to view products" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admins to manage products" ON public.products;
CREATE POLICY "Allow admins to manage products" ON public.products FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');


-- Policies for 'employees'
DROP POLICY IF EXISTS "Allow users to view their own employee data" ON public.employees;
CREATE POLICY "Allow users to view their own employee data" ON public.employees FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins to view all employees" ON public.employees;
CREATE POLICY "Allow admins to view all employees" ON public.employees FOR SELECT TO authenticated USING (get_my_role() = 'admin');

DROP POLICY IF EXISTS "Allow admins to manage employees" ON public.employees;
CREATE POLICY "Allow admins to manage employees" ON public.employees FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');


-- Policies for 'sales' and 'sale_items'
DROP POLICY IF EXISTS "Allow authenticated users to view sales" ON public.sales;
CREATE POLICY "Allow authenticated users to view sales" ON public.sales FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to view sale items" ON public.sale_items;
CREATE POLICY "Allow authenticated users to view sale items" ON public.sale_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow employees to create sales and items" ON public.sales;
CREATE POLICY "Allow employees to create sales and items" ON public.sales FOR INSERT TO authenticated WITH CHECK (
  (get_my_role() IN ('admin', 'cashier')) AND
  (employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Allow employees to create sale items" ON public.sale_items;
CREATE POLICY "Allow employees to create sale items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (
  get_my_role() IN ('admin', 'cashier')
);

DROP POLICY IF EXISTS "Allow admins to manage sales" ON public.sales;
CREATE POLICY "Allow admins to manage sales" ON public.sales FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "Allow admins to manage sale items" ON public.sale_items;
CREATE POLICY "Allow admins to manage sale items" ON public.sale_items FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
