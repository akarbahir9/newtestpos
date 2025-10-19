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
import { Product } from "./columns"
import { useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, { message: "ناو دەبێت لانیکەم 2 پیت بێت." }),
  category: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.coerce.number().min(0, { message: "دانە نابێت لە 0 کەمتر بێت." }),
  purchase_price: z.coerce.number().min(0, { message: "نرخی کڕین نابێت لە 0 کەمتر بێت." }),
  sale_price: z.coerce.number().min(0, { message: "نرخی فرۆشتن نابێت لە 0 کەمتر بێت." }),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ProductFormValues, productId?: string) => void
  product?: Product | null
  loading: boolean
}

export function ProductForm({ isOpen, onClose, onSubmit, product, loading }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      barcode: "",
      stock: 0,
      purchase_price: 0,
      sale_price: 0,
    },
  })

  useEffect(() => {
    if (product) {
      form.reset(product)
    } else {
      form.reset({
        name: "",
        category: "",
        barcode: "",
        stock: 0,
        purchase_price: 0,
        sale_price: 0,
      })
    }
  }, [product, form])

  const handleFormSubmit = (values: ProductFormValues) => {
    onSubmit(values, product?.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{product ? "دەستکاریکردنی کاڵا" : "زیادکردنی کاڵای نوێ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">ناو</Label>
            <Input id="name" {...form.register("name")} className="col-span-3" />
          </div>
          {form.formState.errors.name && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.name.message}</p>}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">جۆر</Label>
            <Input id="category" {...form.register("category")} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="barcode" className="text-right">بارکۆد</Label>
            <Input id="barcode" {...form.register("barcode")} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">دانە</Label>
            <Input id="stock" type="number" {...form.register("stock")} className="col-span-3" />
          </div>
          {form.formState.errors.stock && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.stock.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchase_price" className="text-right">نرخی کڕین</Label>
            <Input id="purchase_price" type="number" {...form.register("purchase_price")} className="col-span-3" />
          </div>
          {form.formState.errors.purchase_price && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.purchase_price.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale_price" className="text-right">نرخی فرۆشتن</Label>
            <Input id="sale_price" type="number" {...form.register("sale_price")} className="col-span-3" />
          </div>
          {form.formState.errors.sale_price && <p className="text-red-500 text-xs col-span-4">{form.formState.errors.sale_price.message}</p>}

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
