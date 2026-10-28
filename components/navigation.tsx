import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useTheme } from "next-themes"
import { Leaf, LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Identify" },
  { to: "/blog", label: "Blog" },
  { to: "/software", label: "Software" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("text-sm font-medium transition-colors hover:text-emerald-600", isActive ? "text-emerald-600" : "text-muted-foreground")

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          PlantID
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:block" />
          </Button>

          {user ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user.name.split(" ")[0]}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => logout()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Link to="/profile">Sign in</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4" aria-label="Mobile">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                ))}
                {user && (
                  <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
                    My profile
                  </NavLink>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
