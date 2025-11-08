import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { sendBookingConfirmationEmail } from "@/app/actions/notifications"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    console.log("Manually marking booking as paid:", id)

    // Update booking to paid and confirmed
    await db.booking.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    })

    console.log("Booking payment status updated successfully")

    // Send confirmation email
    await sendBookingConfirmationEmail(id)
    console.log("Confirmation email sent")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
  }
}