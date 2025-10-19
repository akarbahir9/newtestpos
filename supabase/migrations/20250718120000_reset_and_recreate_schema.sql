/*
# [Schema Reset and Recreation]
This script will completely reset and rebuild the application's database schema. It starts by dropping all existing tables to ensure a clean state, then recreates them with the correct structure, relationships, and security policies.

## Query Description: This is a DESTRUCTIVE operation. It will permanently delete the 'sale_items', 'sales', 'products', 'customers', and 'employees' tables and all their data. This is necessary to fix the current inconsistent database state and ensure the application can function correctly. It is recommended to only run this in a development environment or after backing up any critical data.

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Tables to be DROPPED: sale_items, sales, products, customers, employees
- Tables to be CREATED: customers, employees, products, sales, sale_items
- RLS will be enabled on all tables.
- Policies will be created to allow access for authenticated users.

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Yes, new policies are created.
- Auth Requirements: Users must be authenticated to interact with the data.

## Performance Impact:
- Indexes: Primary keys and foreign keys will be indexed automatically.
- Triggers: None.
- Estimated Impact: Minimal, as this sets up the initial schema.
*/

-- Step 1: Drop existing tables in reverse order of dependency
-- This is to clean up any partially created or inconsistent tables from previous attempts.
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;


-- Step 2: Create `customers` table
-- Stores information about customers, including their loan balance.
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    loan_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);
-- Add comments for clarity
COMMENT ON TABLE public.customers IS 'Stores customer information and their outstanding loan balance.';
COMMENT ON COLUMN public.customers.loan_balance IS 'Current loan balance in Iraqi Dinar (IQD).';

-- Enable RLS and define policies for `customers`
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.customers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- Step 3: Create `employees` table
-- Stores employee information and links to the auth.users table.
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier'))
);
-- Add comments for clarity
COMMENT ON TABLE public.employees IS 'Stores employee profiles and links them to their authentication user.';
COMMENT ON COLUMN public.employees.role IS 'Defines user permissions: admin or cashier.';

-- Enable RLS and define policies for `employees`
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.employees
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- Step 4: Create `products` table
-- Stores inventory information.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    purchase_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category TEXT
);
-- Add comments for clarity
COMMENT ON TABLE public.products IS 'Manages all product and inventory information.';
COMMENT ON COLUMN public.products.stock IS 'Current quantity of the product in stock.';

-- Enable RLS and define policies for `products`
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- Step 5: Create `sales` table
-- Records each sales transaction.
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    customer_id UUID REFERENCES public.customers(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'loan')) DEFAULT 'cash'
);
-- Add comments for clarity
COMMENT ON TABLE public.sales IS 'Header record for each sales transaction.';
COMMENT ON COLUMN public.sales.payment_method IS 'Payment method used for the sale (cash or loan).';

-- Enable RLS and define policies for `sales`
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.sales
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- Step 6: Create `sale_items` table
-- Records the individual products within each sale.
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL,
    price_at_sale NUMERIC(10, 2) NOT NULL
);
-- Add comments for clarity
COMMENT ON TABLE public.sale_items IS 'Line items for each sale, linking sales to products.';
COMMENT ON COLUMN public.sale_items.price_at_sale IS 'The sale price of the product at the time of the transaction.';

-- Enable RLS and define policies for `sale_items`
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.sale_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
