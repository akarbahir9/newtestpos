import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Customer } from "./columns"
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, { message: "ناو دەبێت لانیکەم 2 پیت بێت." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  loan_balance: z.coerce.number().default(0),
})

type CustomerFormValues = z.infer<typeof formSchema>

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CustomerFormValues, customerId?: string) => void
  customer?: Customer | null
  loading: boolean
}

export function CustomerForm({ isOpen, onClose, onSubmit, customer, loading }: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      loan_balance: 0,
    },
  })

  useEffect(() => {
    if (customer) {
      form.reset(customer)
    } else {
      form.reset({
        name: "",
        phone: "",
        address: "",
        loan_balance: 0,
      })
    }
  }, [customer, form])

  const handleFormSubmit = (values: CustomerFormValues) => {
    onSubmit(values, customer?.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{customer ? "دەستکاریکردنی کڕیار" : "زیادکردنی کڕیاری نوێ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">ناو</Label>
            <Input id="name" {...form.register("name")} className="col-span-3" />
          </div>
          {form.formState.errors.name && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.name.message}</p>}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">تەلەفۆن</Label>
            <Input id="phone" {...form.register("phone")} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">ناونیشان</Label>
            <Input id="address" {...form.register("address")} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan_balance" className="text-right">بڕی قەرز</Label>
            <Input id="loan_balance" type="number" {...form.register("loan_balance")} className="col-span-3" />
          </div>
          {form.formState.errors.loan_balance && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.loan_balance.message}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">پاشگەزبوونەوە</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'چاوەڕێبە...' : 'پاشەکەوتکردن'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
