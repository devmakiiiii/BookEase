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
    const cancelledBookings = await db.booking.count({ where: { status: "CANCELLED" } })

    const paidBookings = await db.booking.findMany({
      where: { paymentStatus: "PAID" },
      include: { service: true },
    })
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.service.price, 0)

    const refundedBookings = await db.booking.findMany({
      where: { paymentStatus: ("REFUNDED" as any) },
      include: { service: true },
    })
    const totalRefunds = refundedBookings.reduce((sum, b) => sum + ((b as any).refundAmount || 0), 0)

    const totalClients = await db.user.count({ where: { role: "CUSTOMER" } })

    // Cancellation analytics
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0

    // Recent cancellations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCancellations = await db.booking.count({
      where: {
        status: "CANCELLED",
        cancelledAt: { gte: thirtyDaysAgo } as any
      }
    })

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      totalRefunds,
      totalClients,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      recentCancellations,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
