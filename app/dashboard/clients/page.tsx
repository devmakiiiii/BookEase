"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Calendar } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  bookingCount: number
  totalSpent: number
}

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) throw new Error("Failed to fetch clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load clients", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [toast])

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Clients</h1>
        <p className="text-muted-foreground">View and manage your client base</p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{client.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{client.bookingCount} bookings</span>
                    </div>
                    <div className="text-lg font-semibold">${(client.totalSpent / 100).toFixed(2)} total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
