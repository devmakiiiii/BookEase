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
    console.log("Approving booking with ID:", id)
    await db.booking.update({
      where: { id },
      data: { status: "CONFIRMED" },
    })
    console.log("Booking status updated successfully")

    // Send confirmation email to customer
    await sendBookingConfirmationEmail(id)
    console.log("Confirmation email sent")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving booking:", error)
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 })
  }
}