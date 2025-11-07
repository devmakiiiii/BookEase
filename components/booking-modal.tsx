"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Checkout from "@/components/checkout"
import { createBooking } from "@/app/actions/stripe"

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface BookingModalProps {
  service: Service
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({ service, onClose, onSuccess }: BookingModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<"datetime" | "checkout">("datetime")
  const [selectedDateTime, setSelectedDateTime] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [checkoutLoaded, setCheckoutLoaded] = useState(false)

  const handleNext = async () => {
    if (!selectedDateTime) {
      toast({ title: "Error", description: "Please select a date and time", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      if (!bookingId) {
        const newBookingId = await createBooking(service.id, selectedDateTime, notes)
        setBookingId(newBookingId)
      }
      setStep("checkout")
      setCheckoutLoaded(true)
    } catch (error) {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep("datetime")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={step === "checkout" ? "max-w-2xl max-h-[80vh] overflow-y-auto" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Book {service.name}</DialogTitle>
          <DialogDescription>
            ${(service.price / 100).toFixed(2)} • {service.duration} min
          </DialogDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === "datetime" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              1
            </div>
            <div className="flex-1 h-px bg-border"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === "checkout" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Select Date & Time</span>
            <span>Payment</span>
          </div>
        </DialogHeader>

        {step === "datetime" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Date & Time</label>
              <div className="flex gap-2 mt-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none h-20"
              />
            </div>

            <Button onClick={handleNext} className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Continue to Payment"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Service</span>
                    <p className="font-medium">{service.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <p className="font-medium">{new Date(selectedDateTime).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Price</span>
                    <p className="font-medium text-lg">${(service.price / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {bookingId && <Checkout bookingId={bookingId} onSuccess={onSuccess} />}
            </div>

            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={handleBack} className="px-8" disabled={checkoutLoaded}>
                ← Back to Details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
