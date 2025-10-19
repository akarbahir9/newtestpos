import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/employees/data-table";
import { getColumns, Employee } from "@/components/employees/columns";
import { EmployeeForm } from '@/components/employees/employee-form';
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
import { Badge } from '@/components/ui/badge';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (error) {
      setError("هەڵەیەک ڕوویدا لە کاتی هێنانی کارمەندەکان.");
      console.error(error);
    } else {
      setEmployees(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    setFormLoading(true);
    // For now, we only delete the employee profile, not the auth user.
    // This revokes their access to app features but doesn't delete their login.
    const { error } = await supabase.from('employees').delete().eq('id', selectedEmployee.id);
    if (error) {
      toast.error("هەڵەیەک ڕوویدا: " + error.message);
    } else {
      toast.success("کارمەند بە سەرکەوتوویی سڕایەوە.");
      await fetchEmployees();
      setIsConfirmOpen(false);
      setSelectedEmployee(null);
    }
    setFormLoading(false);
  };

  const handleFormSubmit = async (values: any, employeeId?: string) => {
    setFormLoading(true);
    if (employeeId) {
      // Update employee
      const { error } = await supabase.from('employees').update({ name: values.name, role: values.role }).eq('id', employeeId);
      if (error) {
        toast.error("هەڵەیەک ڕوویدا لە کاتی نوێکردنەوە: " + error.message);
      } else {
        toast.success("زانیاری کارمەند نوێکرایەوە.");
      }
    } else {
      // Create new employee and auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        toast.error(`هەڵە لە دروستکردنی هەژمار: ${authError.message}`);
        setFormLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('employees').insert({
          user_id: authData.user.id,
          name: values.name,
          role: values.role,
        });

        if (profileError) {
          toast.error(`هەژمار دروستکرا، بەڵام پرۆفایلی کارمەند دروست نەکرا: ${profileError.message}`);
        } else {
          toast.success("کارمەند و هەژماری بەکارهێنەر بە سەرکەوتوویی دروستکران.");
        }
      }
    }
    setFormLoading(false);
    setIsFormOpen(false);
    await fetchEmployees();
  };

  const columns = getColumns({ onEdit: handleEditEmployee, onDelete: handleDeleteEmployee });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="h-8 w-8 animate-spin" />
        <p className="mr-2">...کارمەندەکان دادەبەزێنرێن</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">بەڕێوەبردنی کارمەندەکان</h1>
        <Button onClick={handleAddEmployee}>
          <PlusCircle className="ml-2 h-4 w-4" />
          زیادکردنی کارمەند
        </Button>
      </div>
      <DataTable columns={columns} data={employees} />
      <EmployeeForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        employee={selectedEmployee}
        loading={formLoading}
      />
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>دڵنیای لە سڕینەوە؟</DialogTitle>
            <DialogDescription>
              ئەم کارە ناتوانرێت بگەڕێنرێتەوە. ئەمە بۆ هەمیشە کارمەندی
              <span className="font-bold mx-1">{selectedEmployee?.name}</span>
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
