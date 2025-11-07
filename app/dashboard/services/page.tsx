"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  isActive: boolean
}

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", duration: 30, price: 0 })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (!response.ok) throw new Error("Failed to fetch services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load services", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: formData.price * 100 }),
      })
      if (!response.ok) throw new Error("Failed to add service")
      await fetchServices()
      setFormData({ name: "", description: "", duration: 30, price: 0 })
      setShowDialog(false)
      setEditingService(null)
      toast({ title: "Success", description: "Service added" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add service", variant: "destructive" })
    }
  }

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return
    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: formData.price * 100 }),
      })
      if (!response.ok) throw new Error("Failed to update service")
      await fetchServices()
      setFormData({ name: "", description: "", duration: 30, price: 0 })
      setShowDialog(false)
      setEditingService(null)
      toast({ title: "Success", description: "Service updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" })
    }
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price / 100,
    })
    setShowDialog(true)
  }

  const handleDeleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete service")
      setServices(services.filter((s) => s.id !== id))
      toast({ title: "Success", description: "Service deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" })
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Services</h1>
          <p className="text-muted-foreground">Manage your business services</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>Add Service</Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No services yet</p>
            <Button onClick={() => setShowDialog(true)}>Create First Service</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{service.duration} min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price</span>
                      <p className="font-medium">${(service.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (!open) {
          setEditingService(null)
          setFormData({ name: "", description: "", duration: 30, price: 0 })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Update the service details" : "Create a new service for your business"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingService ? handleEditService : handleAddService} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input
                placeholder="e.g., Haircut"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="e.g., Professional haircut service"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingService ? "Update Service" : "Add Service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
