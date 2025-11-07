import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { sendBookingCancelledEmail } from "@/app/actions/notifications"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("Cancel booking request for ID:", id)

  const user = await getCurrentUser()
  console.log("Current user:", user ? { id: user.id, admin: !!user.admin } : null)

  if (!user?.admin) {
    console.log("Unauthorized: User is not admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("Attempting to update booking status to CANCELLED")
    await db.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    })
    console.log("Booking status updated successfully")

    // Send cancellation email
    console.log("Sending cancellation email")
    await sendBookingCancelledEmail(id)
    console.log("Cancellation email sent successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in cancel booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
