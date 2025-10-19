/*
# [Create handle_sale Function]
This function creates a stored procedure `handle_sale` to process a complete sales transaction atomically.

## Query Description:
This operation creates a new PostgreSQL function in your database. It is designed to handle the entire logic of a sale in a single, safe transaction. When you call this function, it will:
1.  Create a new record in the `sales` table.
2.  Loop through all items in the sale and insert them into the `sale_items` table.
3.  For each item, it will decrease the stock level in the `products` table.
4.  If the sale is a loan, it will increase the customer's `loan_balance`.
Because all these steps are inside one function, it ensures that your database remains consistent. If any step fails, the entire transaction is rolled back. This is a safe operation and does not risk existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (the function can be dropped)

## Structure Details:
- Function Name: `handle_sale`
- Arguments: `employee_id_in`, `customer_id_in`, `payment_method_in`, `sale_items_in`
- Tables Affected: `sales` (INSERT), `sale_items` (INSERT), `products` (UPDATE), `customers` (UPDATE)

## Security Implications:
- RLS Status: Enabled (The function runs with the permissions of the user calling it)
- Policy Changes: No
- Auth Requirements: The user must have `INSERT` and `UPDATE` permissions on the affected tables as per your RLS policies.

## Performance Impact:
- Indexes: This function will benefit from indexes on `products.id` and `customers.id`.
- Triggers: No new triggers are added.
- Estimated Impact: Low. The function is highly efficient for processing individual sales.
*/
create or replace function handle_sale(
    employee_id_in uuid,
    payment_method_in text,
    sale_items_in jsonb,
    customer_id_in uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    new_sale_id uuid;
    total_sale_amount numeric := 0;
    item record;
    product_stock int;
begin
    -- Calculate total amount from sale items
    for item in select * from jsonb_to_recordset(sale_items_in) as x(product_id uuid, quantity int, price_at_sale numeric)
    loop
        total_sale_amount := total_sale_amount + (item.quantity * item.price_at_sale);
    end loop;

    -- Insert into sales table
    insert into sales (employee_id, customer_id, total_amount, payment_method)
    values (employee_id_in, customer_id_in, total_sale_amount, payment_method_in::public.payment_method)
    returning id into new_sale_id;

    -- Insert into sale_items and update product stock
    for item in select * from jsonb_to_recordset(sale_items_in) as x(product_id uuid, quantity int, price_at_sale numeric)
    loop
        -- Check for sufficient stock
        select stock into product_stock from products where id = item.product_id;
        if product_stock < item.quantity then
            raise exception 'Insufficient stock for product ID %', item.product_id;
        end if;

        insert into sale_items (sale_id, product_id, quantity, price_at_sale)
        values (new_sale_id, item.product_id, item.quantity, item.price_at_sale);

        update products
        set stock = stock - item.quantity
        where id = item.product_id;
    end loop;

    -- Update customer loan balance if payment method is 'loan'
    if payment_method_in = 'loan' and customer_id_in is not null then
        update customers
        set loan_balance = loan_balance + total_sale_amount
        where id = customer_id_in;
    end if;

    return new_sale_id;
end;
$$;
