import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/inventory/data-table";
import { getColumns, Product } from "@/components/inventory/columns";
import { ProductForm } from '@/components/inventory/product-form';
import { supabase } from '@/lib/supabase';
import { Activity, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      setError("هەڵەیەک ڕوویدا لە کاتی هێنانی کاڵاکان.");
      console.error(error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setFormLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id);
    if (error) {
      alert("هەڵەیەک ڕوویدا: " + error.message);
    } else {
      await fetchProducts();
      setIsConfirmOpen(false);
      setSelectedProduct(null);
    }
    setFormLoading(false);
  };

  const handleFormSubmit = async (values: Omit<Product, 'id' | 'created_at'>, productId?: string) => {
    setFormLoading(true);
    if (productId) {
      // Update
      const { error } = await supabase.from('products').update(values).eq('id', productId);
      if (error) {
        alert("هەڵەیەک ڕوویدا لە کاتی نوێکردنەوە: " + error.message);
      }
    } else {
      // Create
      const { error } = await supabase.from('products').insert([values]);
      if (error) {
        alert("هەڵەیەک ڕوویدا لە کاتی زیادکردن: " + error.message);
      }
    }
    setFormLoading(false);
    setIsFormOpen(false);
    await fetchProducts();
  };

  const columns = getColumns({ onEdit: handleEditProduct, onDelete: handleDeleteProduct });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="h-8 w-8 animate-spin" />
        <p className="mr-2">...کاڵاکان دادەبەزێنرێن</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">کۆگا</h1>
        <Button onClick={handleAddProduct}>
          <PlusCircle className="ml-2 h-4 w-4" />
          زیادکردنی کاڵا
        </Button>
      </div>
      <DataTable columns={columns} data={products} />
      <ProductForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        loading={formLoading}
      />
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>دڵنیای لە سڕینەوە؟</DialogTitle>
            <DialogDescription>
              ئەم کارە ناتوانرێت بگەڕێنرێتەوە. ئەمە بۆ هەمیشە کاڵای
              <span className="font-bold mx-1">{selectedProduct?.name}</span>
              دەسڕێتەوە.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">پاشگەزبوونەوە</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={formLoading}>
              {formLoading ? 'چاوەڕێبە...' : 'سڕینەوە'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
