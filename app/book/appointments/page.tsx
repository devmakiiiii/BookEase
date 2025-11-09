"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  paymentStatus: string
  service: {
    name: string
    description: string
    duration: number
    price: number
  }
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings/user")
        if (!response.ok) throw new Error("Failed to fetch bookings")
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load appointments", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "UNPAID":
        return "bg-red-100 text-red-800"
      case "FAILED":
        return "bg-orange-100 text-orange-800"
      case "REFUNDED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel booking")
      }

      const data = await response.json()

      // Update the booking status in the local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: "CANCELLED", paymentStatus: data.refundProcessed ? "REFUNDED" : booking.paymentStatus }
          : booking
      ))

      toast({
        title: "Success",
        description: `Appointment cancelled successfully${data.refundProcessed ? ` and $${data.refundAmount} refunded` : ""}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel appointment",
        variant: "destructive"
      })
    } finally {
      setCancellingId(null)
    }
  }

  const canCancelBooking = (booking: Booking) => {
    const now = new Date()
    const startTime = new Date(booking.startTime)
    const hoursBefore = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return booking.status === "PENDING" &&
           hoursBefore >= 0 // Allow cancelling current/future appointments that are still pending
  }

  if (loading) return <div className="text-center py-12">Loading appointments...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your booked appointments</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No appointments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.service.name}</CardTitle>
                    <CardDescription>{booking.service.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(booking.startTime), "PPP 'at' p")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{booking.service.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">${(booking.service.price / 100).toFixed(2)}</p>
                  </div>
                </div>
                {canCancelBooking(booking) && (
                  <div className="mt-4 pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel Appointment"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                            {booking.paymentStatus === "PAID" && (
                              <span className="block mt-2 text-amber-600">
                                Note: Cancellation fees may apply and refunds will be processed according to our policy.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Cancel Appointment
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}