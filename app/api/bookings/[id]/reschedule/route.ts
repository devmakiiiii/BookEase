import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { sendBookingRescheduledEmail } from "@/app/actions/notifications"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const { startTime } = await request.json()

    if (!startTime) {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { service: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const newStartTime = new Date(startTime)
    const endTime = new Date(newStartTime.getTime() + booking.service.duration * 60000)

    await db.booking.update({
      where: { id },
      data: { startTime: newStartTime, endTime },
    })

    // Send rescheduled email
    await sendBookingRescheduledEmail(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to reschedule booking" }, { status: 500 })
  }
}