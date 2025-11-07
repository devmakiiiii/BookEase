import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="text-2xl font-bold text-primary">BookEase</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center px-6 py-20">
        <h1 className="text-5xl font-bold text-center mb-6 text-balance">Simple Booking for Small Businesses</h1>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl text-pretty">
          BookEase makes it easy for customers to book appointments and for you to manage your business. Take payments,
          manage schedules, and grow your business.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Easy Bookings</h3>
              <p className="text-muted-foreground">Customers can book appointments online 24/7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">Accept payments via Stripe with confidence</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Smart Management</h3>
              <p className="text-muted-foreground">Full control over bookings and schedule</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </div>
    </main>
  )
}
