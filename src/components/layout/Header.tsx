import { Menu, Package2, UserCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ThemeToggle"
import { supabase } from "@/lib/supabase"
import { NAV_LINKS } from "./Sidebar"

export function Header() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">سیستەمی مارکێت</span>
        </Link>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="sr-only">لیستی ناوبەر</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium mt-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">سیستەمی مارکێت</span>
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Search can be added here later */}
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>هەژماری من</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>ڕێکخستنەکان</DropdownMenuItem>
            <DropdownMenuItem>پشتگیری</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>چوونەدەرەوە</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
