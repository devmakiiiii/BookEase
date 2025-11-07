"use client"

import { useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutForBooking } from "@/app/actions/stripe"
import { useToast } from "@/hooks/use-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  bookingId: string
  onSuccess: () => void
}

export default function Checkout({ bookingId, onSuccess }: CheckoutProps) {
  const { toast } = useToast()

  const handleCheckoutSession = useCallback(async () => {
    try {
      const clientSecret = await startCheckoutForBooking(bookingId)
      if (!clientSecret) {
        throw new Error("Failed to get client secret")
      }
      return clientSecret
    } catch (error) {
      toast({ title: "Error", description: "Failed to create checkout session", variant: "destructive" })
      throw error
    }
  }, [bookingId, toast])

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: handleCheckoutSession,
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
