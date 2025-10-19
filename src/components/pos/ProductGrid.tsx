import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/components/inventory/columns';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Activity, PackageSearch } from 'lucide-react';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*').order('name');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    const debounceFetch = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search input

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          placeholder="گەڕان بەدوای کاڵا..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
        />
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
          <PackageSearch className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold">هیچ کاڵایەک نەدۆزرایەوە</h3>
          <p className="text-sm">هەوڵبدە بە ناوێکی تر بگەڕێیت یان کاڵای نوێ زیاد بکە.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    نرخ: {formatCurrency(product.sale_price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    دانە: {product.stock}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? 'زیادکردن' : 'نەماوە'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
