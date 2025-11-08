"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Calendar, User, Clock, MapPin, CheckCircle, Edit } from "lucide-react"
import RescheduleModal from "@/components/reschedule-modal"

interface Booking {
  id: string
  customer: { firstName: string; lastName: string; email: string }
  service: { name: string; duration: number; price: number }
  startTime: string
  status: string
  paymentStatus: string
}

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleModal, setRescheduleModal] = useState<{ bookingId: string; startTime: string; serviceName: string } | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings")
        if (!response.ok) throw new Error("Failed to fetch bookings")
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to cancel booking")
      setBookings(bookings.filter((b) => b.id !== bookingId))
      toast({ title: "Success", description: "Booking cancelled" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel booking", variant: "destructive" })
    }
  }

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to approve booking")
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
      toast({ title: "Success", description: "Booking approved" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve booking", variant: "destructive" })
    }
  }

  const handleRescheduleBooking = (bookingId: string, startTime: string, serviceName: string) => {
    setRescheduleModal({ bookingId, startTime, serviceName })
  }

  const handleRescheduleSuccess = (newStartTime: string) => {
    if (rescheduleModal) {
      setBookings(bookings.map((b) =>
        b.id === rescheduleModal.bookingId ? { ...b, startTime: newStartTime } : b
      ))
      setRescheduleModal(null)
    }
  }

  const handleMarkAsPaid = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to mark as paid")
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, paymentStatus: "PAID", status: "CONFIRMED" } : b))
      toast({ title: "Success", description: "Booking marked as paid" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark as paid", variant: "destructive" })
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">Manage and track all bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{booking.customer.firstName} {booking.customer.lastName}</span>
                      <span className="text-muted-foreground">{booking.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{booking.service.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(booking.startTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {booking.service.duration} min • ${(booking.service.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {booking.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === "PAID" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  {booking.status === "PENDING" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveBooking(booking.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                  )}
                  {booking.paymentStatus === "UNPAID" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkAsPaid(booking.id)}
                      className="flex items-center gap-1"
                    >
                      💳 Mark as Paid
                    </Button>
                  )}
                  {booking.status !== "CANCELLED" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRescheduleBooking(booking.id, booking.startTime, booking.service.name)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rescheduleModal && (
        <RescheduleModal
          bookingId={rescheduleModal.bookingId}
          currentStartTime={rescheduleModal.startTime}
          serviceName={rescheduleModal.serviceName}
          onClose={() => setRescheduleModal(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  )
}
