import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner"
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/components/inventory/columns';
import { Database } from '@/types';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart, CartItem } from '@/components/pos/Cart';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function POS() {
  const { session } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle(); // Use maybeSingle() to prevent error if no row is found

          if (error) throw error;
          
          if (data) {
            setEmployeeId(data.id);
          } else {
            console.warn(`No employee record found for user ID: ${session.user.id}`);
            toast.warning("هەژماری کارمەندییەکەت نەدۆزرایەوە. لەوانەیە هەندێک کردار کار نەکەن.");
          }
        } catch (error: any) {
          console.error("Error fetching employee ID:", error);
          toast.error("هەڵەیەک لە ناسینەوەی کارمەند ڕوویدا");
        }
      }
    };
    fetchEmployeeId();
  }, [session]);

  const handleAddToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.warning(`تەنها ${product.stock} دانە لە "${product.name}" لە کۆگا ماوە.`);
          return prevCart;
        }
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.product.id !== productId);
      }
      return prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const handleCompleteSale = async (paymentMethod: 'cash' | 'loan') => {
    if (!employeeId) {
      toast.error("ناسنامەی کارمەند نەدۆزرایەوە. تکایە جارێکی تر بچۆ ژوورەوە.");
      return;
    }
    if (cart.length === 0) {
      toast.warning("سەبەتە بەتاڵە!");
      return;
    }

    setIsProcessing(true);

    const saleItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_sale: item.product.sale_price,
    }));

    const { error } = await supabase.rpc('handle_sale', {
      p_employee_id: employeeId,
      p_customer_id: selectedCustomer?.id || null,
      p_payment_method: paymentMethod,
      p_sale_items: saleItems,
    });

    setIsProcessing(false);

    if (error) {
      console.error("Sale error:", error);
      toast.error(`هەڵەیەک ڕوویدا: ${error.message}`);
    } else {
      toast.success("فرۆشتن بە سەرکەوتوویی ئەنجامدرا!");
      setCart([]);
      setSelectedCustomer(null);
      // Optionally, you might want to trigger a refresh of product data
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div className="lg:col-span-2 bg-card border rounded-lg overflow-hidden">
        <ProductGrid onAddToCart={handleAddToCart} />
      </div>
      <div className="lg:col-span-1">
        <Cart 
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          onCompleteSale={handleCompleteSale}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}
