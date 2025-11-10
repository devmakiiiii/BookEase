import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { sendBookingCancelledEmail, sendAdminCancellationNotificationEmail } from "@/app/actions/notifications"
import { processRefund, calculateRefundAmount } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
        throw new Error("BOOKING_NOT_FOUND")
      }

      console.log("Booking found:", { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus })

      // Check ownership for non-admin users
      if (!user.admin && booking.customerId !== user.id) {
        console.log("Unauthorized: User does not own this booking")
        throw new Error("UNAUTHORIZED")
      }

      // Check if already cancelled
      if (booking.status === "CANCELLED") {
        throw new Error("ALREADY_CANCELLED")
      }

      // Check cancellation policy - allow both customers and admins to cancel anytime
      const now = new Date()
      const hoursBefore = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      console.log("Hours before appointment:", hoursBefore)

      // Note: Time restrictions are not enforced - both customers and admins can cancel anytime

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
  } catch (error) {
    console.error("Error in cancel booking transaction:", error)

    // Handle different types of errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_FOUND") {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      if (error.message === "ALREADY_CANCELLED") {
        return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
      }
      if (error.message.startsWith("CANCELLATION_TOO_LATE:")) {
        const hoursRequired = error.message.split(":")[1]
        return NextResponse.json({
          error: `Cancellations must be made at least ${hoursRequired} hours in advance`
        }, { status: 400 })
      }
    }

    // For unexpected errors, return 500
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
