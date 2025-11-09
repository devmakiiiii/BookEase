import "server-only"
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function processRefund(stripeSessionId: string, amount: number, reason: string = "requested_by_customer") {
  try {
    // First, retrieve the payment intent from the session
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
    if (!session.payment_intent) {
      throw new Error("No payment intent found for session")
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent.id,
      amount: amount, // amount in cents
      reason: reason as Stripe.RefundCreateParams.Reason,
      metadata: {
        booking_cancellation: "true"
      }
    })

    return refund
  } catch (error) {
    console.error("Failed to process refund:", error)
    throw error
  }
}

export async function calculateRefundAmount(servicePrice: number, hoursBefore: number, cancellationFeePercentage: number): Promise<number> {
  // If cancelled within the allowed hours, apply cancellation fee
  if (hoursBefore < 24) { // Assuming 24 hours is the threshold
    const feeAmount = Math.round(servicePrice * (cancellationFeePercentage / 100))
    return Math.max(0, servicePrice - feeAmount)
  }

  // Full refund if cancelled early enough
  return servicePrice
}
