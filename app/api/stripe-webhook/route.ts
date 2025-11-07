import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { sendBookingConfirmationEmail } from "@/app/actions/notifications"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("Received webhook event:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const bookingId = session.metadata?.bookingId

    console.log("Session metadata:", session.metadata)
    console.log("Booking ID from metadata:", bookingId)

    if (bookingId) {
      try {
        await db.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        })
        console.log("Updated booking", bookingId, "to PAID and CONFIRMED")

        // Send confirmation emails
        await sendBookingConfirmationEmail(bookingId)
      } catch (updateError) {
        console.error("Failed to update booking:", updateError)
      }
    } else {
      console.error("No bookingId in session metadata")
    }
  }

  return NextResponse.json({ received: true })
}
