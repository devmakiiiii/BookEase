import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalBookings = await db.booking.count({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow
        },
        status: "CONFIRMED"
      }
    })
    const confirmedBookings = await db.booking.count({ where: { status: "CONFIRMED" } })
    const pendingBookings = await db.booking.count({ where: { status: "PENDING" } })
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

    const activeClients = await db.booking.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: { customerId: true },
      distinct: ['customerId']
    })
    const totalClients = activeClients.length

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
      pendingBookings,
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
