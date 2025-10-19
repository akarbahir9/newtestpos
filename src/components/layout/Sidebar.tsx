import {
  Home,
  ShoppingCart,
  Package,
  Users,
  UserPlus,
  LayoutDashboard
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export const NAV_LINKS = [
  { href: "/", label: "داشبۆرد", icon: LayoutDashboard },
  { href: "/pos", label: "فرۆشتن (POS)", icon: ShoppingCart },
  { href: "/inventory", label: "کۆگا", icon: Package },
  { href: "/customers", label: "کڕیارەکان", icon: Users },
  { href: "/employees", label: "کارمەندەکان", icon: UserPlus },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>سیستەمی مارکێت</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  { "bg-muted text-primary": location.pathname === link.href }
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
