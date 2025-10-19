import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Employee } from "./columns"
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, { message: "ناو دەبێت لانیکەم 2 پیت بێت." }),
  role: z.enum(["admin", "cashier"], { required_error: "پلە پێویستە." }),
  email: z.string().email({ message: "ئیمەیڵێکی دروست بنووسە." }),
  password: z.string().min(6, { message: "وشەی نهێنی دەبێت لانیکەم 6 پیت بێت." }),
})

// Create a separate schema for editing that makes email and password optional
const editFormSchema = formSchema.partial({ email: true, password: true });

interface EmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: z.infer<typeof formSchema> | z.infer<typeof editFormSchema>, employeeId?: string) => void
  employee?: Employee | null
  loading: boolean
}

export function EmployeeForm({ isOpen, onClose, onSubmit, employee, loading }: EmployeeFormProps) {
  const isEditing = !!employee;

  const form = useForm({
    resolver: zodResolver(isEditing ? editFormSchema : formSchema),
    defaultValues: {
      name: "",
      role: "cashier" as "cashier" | "admin",
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (employee) {
      form.reset({
          name: employee.name,
          role: employee.role,
          email: '', // We don't fetch email from employee record
          password: '',
      })
    } else {
      form.reset({
        name: "",
        role: "cashier",
        email: "",
        password: "",
      })
    }
  }, [employee, form])

  const handleFormSubmit = (values: z.infer<typeof formSchema> | z.infer<typeof editFormSchema>) => {
    onSubmit(values, employee?.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{employee ? "دەستکاریکردنی کارمەند" : "زیادکردنی کارمەندی نوێ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">ناو</Label>
            <Input id="name" {...form.register("name")} className="col-span-3" />
          </div>
          {form.formState.errors.name && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.name.message}</p>}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">پلە</Label>
            <Select onValueChange={(value) => form.setValue('role', value as "admin" | "cashier")} defaultValue={form.getValues('role')}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="پلەیەک هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cashier">فرۆشیار (Cashier)</SelectItem>
                    <SelectItem value="admin">بەڕێوبەر (Admin)</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {form.formState.errors.role && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.role.message}</p>}
          
          {!isEditing && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">ئیمەیڵ</Label>
                <Input id="email" type="email" {...form.register("email")} className="col-span-3" />
              </div>
              {form.formState.errors.email && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.email.message}</p>}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">وشەی نهێنی</Label>
                <Input id="password" type="password" {...form.register("password")} className="col-span-3" />
              </div>
              {form.formState.errors.password && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.password.message}</p>}
            </>
          )}

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
