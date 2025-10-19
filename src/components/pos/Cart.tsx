import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/components/inventory/columns';
import { CustomerSearch } from './CustomerSearch';
import { Database } from '@/types';
import { Separator } from '../ui/separator';

type Customer = Database['public']['Tables']['customers']['Row'];

export type CartItem = {
  product: Product;
  quantity: number;
};

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onCompleteSale: (paymentMethod: 'cash' | 'loan') => void;
  isProcessing: boolean;
}

export function Cart({ 
  cart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  selectedCustomer, 
  onSelectCustomer, 
  onCompleteSale,
  isProcessing
}: CartProps) {
  const total = cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>سەبەتەی کڕین</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <CustomerSearch selectedCustomer={selectedCustomer} onSelectCustomer={onSelectCustomer} />
        
        <Separator />

        {cart.length === 0 ? (
          <p className="text-center text-muted-foreground pt-8">سەبەتە بەتاڵە.</p>
        ) : (
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-4 p-2 rounded-md bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground" dir="rtl">{formatCurrency(item.product.sale_price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRemoveFromCart(item.product.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-4 border-t">
        <div className="w-full flex justify-between text-lg font-bold">
          <span>کۆی گشتی:</span>
          <span dir="rtl">{formatCurrency(total)}</span>
        </div>
        <div className="w-full grid grid-cols-2 gap-2">
          <Button 
            size="lg" 
            onClick={() => onCompleteSale('cash')} 
            disabled={cart.length === 0 || isProcessing}
          >
            {isProcessing ? '...' : 'پارەدان (Cash)'}
          </Button>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => onCompleteSale('loan')} 
            disabled={!selectedCustomer || cart.length === 0 || isProcessing}
          >
             {isProcessing ? '...' : 'قەرز (Loan)'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
