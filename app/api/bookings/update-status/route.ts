import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()

    // Update confirmed bookings that have ended to completed
    const result = await db.booking.updateMany({
      where: {
        status: "CONFIRMED",
        endTime: {
          lt: now,
        },
      },
      data: {
        status: "COMPLETED",
        completedAt: now,
      },
    })

    return NextResponse.json({
      message: `Updated ${result.count} bookings to completed`,
      updatedCount: result.count,
    })
  } catch (error) {
    console.error("Error updating booking statuses:", error)
    return NextResponse.json({ error: "Failed to update booking statuses" }, { status: 500 })
  }
}