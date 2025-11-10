import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { CalendarCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-muted bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <CalendarCheck className="w-6 h-6" />
          BookEase
        </div>
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

        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">Create your account in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Add Services</h3>
                <p className="text-muted-foreground">Set up your services and availability</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Manage Bookings</h3>
                <p className="text-muted-foreground">Handle appointments and payments effortlessly</p>
              </div>
            </div>
          </div>
        </section>

        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </div>

      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">"BookEase has transformed how we manage appointments. So easy!"</p>
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src="/placeholder-user.jpg" />
                  </Avatar>
                  <div>
                    <p className="font-semibold">Jane Doe</p>
                    <p className="text-sm text-muted-foreground">Salon Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">"Our clients love the seamless booking experience. Highly recommend!"</p>
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src="/placeholder-user.jpg" />
                  </Avatar>
                  <div>
                    <p className="font-semibold">John Smith</p>
                    <p className="text-sm text-muted-foreground">Barber Shop Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <p className="text-muted-foreground">&copy; 2023 BookEase. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
