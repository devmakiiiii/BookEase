import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const totalBookings = await db.booking.count()
    const confirmedBookings = await db.booking.count({ where: { status: "CONFIRMED" } })

    const paidBookings = await db.booking.findMany({
      where: { paymentStatus: "PAID" },
      include: { service: true },
    })
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.service.price, 0)

    const totalClients = await db.user.count({ where: { role: "CUSTOMER" } })

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      totalRevenue,
      totalClients,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
