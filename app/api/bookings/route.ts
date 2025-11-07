import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const bookings = await db.booking.findMany({
      include: { customer: { select: { firstName: true, lastName: true, email: true } }, service: true },
      orderBy: { startTime: "desc" },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
