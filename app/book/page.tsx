"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import BookingModal from "@/components/booking-modal"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

export default function BookPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services")
        if (!response.ok) throw new Error("Failed to fetch services")
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
        toast({ title: "Error", description: "Failed to load services", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [toast])

  if (loading) {
    return <div className="text-center py-12">Loading services...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground">Select a service and choose your preferred time</p>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No services available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">${(service.price / 100).toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={() => setSelectedService(service)}>
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            setSelectedService(null)
            toast({ title: "Success", description: "Booking confirmed!" })
          }}
        />
      )}
    </div>
  )
}
