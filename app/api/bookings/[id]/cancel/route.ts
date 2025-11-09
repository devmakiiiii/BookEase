import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { sendBookingCancelledEmail, sendAdminCancellationNotificationEmail } from "@/app/actions/notifications"
import { processRefund, calculateRefundAmount } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("Cancel booking request for ID:", id)

  const user = await getCurrentUser()
  console.log("Current user:", user ? { id: user.id, admin: !!user.admin } : null)

  if (!user) {
    console.log("Unauthorized: No user found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use database transaction for atomicity
  const transaction = await db.$transaction(async (tx) => {
    console.log("Starting transaction for booking cancellation")

    // Fetch booking with service details for policy checks
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { customer: true, service: true },
    })

    if (!booking) {
      console.log("Booking not found")
      throw new Error("Booking not found")
    }

    console.log("Booking found:", { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus })

    // Check ownership for non-admin users
    if (!user.admin && booking.customerId !== user.id) {
      console.log("Unauthorized: User does not own this booking")
      throw new Error("Unauthorized")
    }

    // Check if already cancelled
    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled")
    }

    // Check cancellation policy - allow customers to cancel anytime
    const now = new Date()
    const hoursBefore = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    console.log("Hours before appointment:", hoursBefore)

    // Only enforce time restriction for admins, customers can cancel anytime
    if (user.admin && hoursBefore < (booking.service as any).cancellationHoursBefore) {
      console.log("Cancellation not allowed: Too close to appointment time")
      throw new Error(`Cancellations must be made at least ${(booking.service as any).cancellationHoursBefore} hours in advance`)
    }

    // Calculate refund amount if payment was made
    let refundAmount = 0
    let stripeRefundId: string | undefined

    if (booking.paymentStatus === "PAID" && booking.stripeSessionId) {
      console.log("Processing refund for paid booking")
      try {
        refundAmount = await calculateRefundAmount(
          booking.service.price,
          hoursBefore,
          (booking.service as any).cancellationFeePercentage
        )
        console.log("Calculated refund amount:", refundAmount)

        if (refundAmount > 0) {
          const refund = await processRefund(booking.stripeSessionId, refundAmount)
          stripeRefundId = refund.id
          console.log("Refund processed successfully:", refund.id)
        }
      } catch (refundError) {
        console.error("Failed to process refund:", refundError)
        // Log refund failure but continue with cancellation
        console.log("Continuing with cancellation despite refund failure")
      }
    }

    // Update booking status and audit fields
    console.log("Updating booking status to CANCELLED")
    const updatedBooking = await tx.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledBy: user.id,
        cancelledAt: now,
        cancellationReason: user.admin ? ("ADMIN_CANCELLED" as any) : ("CUSTOMER_REQUEST" as any),
        paymentStatus: refundAmount > 0 ? ("REFUNDED" as any) : booking.paymentStatus,
        stripeRefundId,
        refundAmount,
      } as any,
    })
    console.log("Booking status updated successfully")

    return {
      booking: updatedBooking,
      refundAmount,
      stripeRefundId
    }
  })

  try {
    // Send notifications outside transaction for better performance
    console.log("Sending cancellation email to customer")
    await sendBookingCancelledEmail(id).catch(emailError => {
      console.error("Failed to send customer email:", emailError)
      // Don't fail the whole operation for email issues
    })

    console.log("Sending admin notification")
    await sendAdminCancellationNotificationEmail(id).catch(emailError => {
      console.error("Failed to send admin email:", emailError)
      // Don't fail the whole operation for email issues
    })

    console.log("Cancellation process completed successfully")

    return NextResponse.json({
      success: true,
      refundProcessed: transaction.refundAmount > 0,
      refundAmount: transaction.refundAmount / 100, // Convert cents to dollars for response
    })

  } catch (error) {
    console.error("Error sending notifications:", error)
    // Return success since the booking was cancelled successfully
    return NextResponse.json({
      success: true,
      refundProcessed: transaction.refundAmount > 0,
      refundAmount: transaction.refundAmount / 100,
      warning: "Booking cancelled but notification delivery failed"
    })
  }
}
