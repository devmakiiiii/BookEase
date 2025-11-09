import type React from "react"
import { getCurrentUser, logout } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const navItems = [
  { href: "/book", label: "Book Appointment" },
  { href: "/book/appointments", label: "My Appointments" },
]

export default async function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/book" className="text-xl font-bold text-primary">
              BookEase
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</span>
              {user.admin && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <form action={logout}>
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="whitespace-nowrap">
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
