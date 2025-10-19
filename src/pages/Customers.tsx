import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/customers/data-table";
import { getColumns, Customer } from "@/components/customers/columns";
import { CustomerForm } from '@/components/customers/customer-form';
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

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) {
      setError("هەڵەیەک ڕوویدا لە کاتی هێنانی کڕیارەکان.");
      console.error(error);
    } else {
      setCustomers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    setFormLoading(true);
    const { error } = await supabase.from('customers').delete().eq('id', selectedCustomer.id);
    if (error) {
      toast.error("هەڵەیەک ڕوویدا: " + error.message);
    } else {
      toast.success("کڕیار بە سەرکەوتوویی سڕایەوە.");
      await fetchCustomers();
      setIsConfirmOpen(false);
      setSelectedCustomer(null);
    }
    setFormLoading(false);
  };

  const handleFormSubmit = async (values: Omit<Customer, 'id' | 'created_at'>, customerId?: string) => {
    setFormLoading(true);
    if (customerId) {
      // Update
      const { error } = await supabase.from('customers').update(values).eq('id', customerId);
      if (error) {
        toast.error("هەڵەیەک ڕوویدا لە کاتی نوێکردنەوە: " + error.message);
      } else {
        toast.success("زانیاری کڕیار نوێکرایەوە.");
      }
    } else {
      // Create
      const { error } = await supabase.from('customers').insert([values]);
      if (error) {
        toast.error("هەڵەیەک ڕوویدا لە کاتی زیادکردن: " + error.message);
      } else {
        toast.success("کڕیاری نوێ زیادکرا.");
      }
    }
    setFormLoading(false);
    setIsFormOpen(false);
    await fetchCustomers();
  };

  const columns = getColumns({ onEdit: handleEditCustomer, onDelete: handleDeleteCustomer });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="h-8 w-8 animate-spin" />
        <p className="mr-2">...کڕیارەکان دادەبەزێنرێن</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">بەڕێوەبردنی کڕیارەکان</h1>
        <Button onClick={handleAddCustomer}>
          <PlusCircle className="ml-2 h-4 w-4" />
          زیادکردنی کڕیار
        </Button>
      </div>
      <DataTable columns={columns} data={customers} />
      <CustomerForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        loading={formLoading}
      />
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>دڵنیای لە سڕینەوە؟</DialogTitle>
            <DialogDescription>
              ئەم کارە ناتوانرێت بگەڕێنرێتەوە. ئەمە بۆ هەمیشە کڕیاری
              <span className="font-bold mx-1">{selectedCustomer?.name}</span>
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
