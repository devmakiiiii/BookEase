import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { sendBookingConfirmationEmail } from "@/app/actions/notifications"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event

  try {
    // In development, allow webhooks without signature verification for Stripe CLI
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Processing webhook without signature verification')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    }
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("Received webhook event:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const sessionId = session.id

    console.log("Session ID:", sessionId)
    console.log("Payment status:", session.payment_status)

    try {
      const booking = await db.booking.findFirst({
        where: { stripeSessionId: sessionId },
      })

      if (booking) {
        if (session.payment_status === "paid") {
          await db.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
          })
          console.log("Updated booking", booking.id, "to PAID and CONFIRMED")

          // Send confirmation emails
          await sendBookingConfirmationEmail(booking.id)
        } else {
          console.log("Payment not completed for booking", booking.id)
        }
      } else {
        console.error("No booking found for session ID:", sessionId)
      }
    } catch (updateError) {
      console.error("Failed to update booking:", updateError)
    }
  }

  return NextResponse.json({ received: true })
}
