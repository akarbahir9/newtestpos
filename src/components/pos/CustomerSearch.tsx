import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from '@/lib/supabase';
import { Database } from '@/types';

type Customer = Database['public']['Tables']['customers']['Row'];

interface CustomerSearchProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export function CustomerSearch({ selectedCustomer, onSelectCustomer }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (data) setCustomers(data);
    };
    fetchCustomers();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer
            ? selectedCustomer.name
            : "کڕیارێک هەڵبژێرە..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" dir="rtl">
        <Command>
          <CommandInput placeholder="گەڕان بەدوای کڕیار..." />
          <CommandList>
            <CommandEmpty>هیچ کڕیارێک نەدۆزرایەوە.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelectCustomer(null);
                  setOpen(false);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>کڕیاری نەناسراو (Cash)</span>
              </CommandItem>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.name}
                  onSelect={(currentValue) => {
                    const selected = customers.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                    onSelectCustomer(selected || null);
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {customer.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
