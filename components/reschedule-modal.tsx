"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RescheduleModalProps {
  bookingId: string
  currentStartTime: string
  serviceName: string
  onClose: () => void
  onSuccess: (newStartTime: string) => void
}

export default function RescheduleModal({ bookingId, currentStartTime, serviceName, onClose, onSuccess }: RescheduleModalProps) {
  const { toast } = useToast()
  const [selectedDateTime, setSelectedDateTime] = useState(currentStartTime)
  const [isLoading, setIsLoading] = useState(false)

  const handleReschedule = async () => {
    if (!selectedDateTime) {
      toast({ title: "Error", description: "Please select a date and time", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: selectedDateTime })
      })

      if (!response.ok) throw new Error("Failed to reschedule booking")

      toast({ title: "Success", description: "Booking rescheduled successfully" })
      onSuccess(selectedDateTime)
      onClose()
    } catch (error) {
      toast({ title: "Error", description: "Failed to reschedule booking", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            {serviceName} - Current: {new Date(currentStartTime).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">New Date & Time</label>
            <div className="flex gap-2 mt-2">
              <Calendar className="w-5 h-5 text-muted-foreground mt-2" />
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleReschedule} disabled={isLoading} className="flex-1">
              {isLoading ? "Rescheduling..." : "Reschedule"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}