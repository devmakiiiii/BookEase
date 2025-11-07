import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Revenue by month
    const bookings = await db.booking.findMany({
      where: { paymentStatus: "PAID" },
      include: { service: true },
    })

    const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(new Date().getFullYear(), i, 1)
      const monthName = month.toLocaleDateString("en-US", { month: "short" })
      const revenue = bookings
        .filter(
          (b) =>
            new Date(b.startTime).getMonth() === i && new Date(b.startTime).getFullYear() === new Date().getFullYear(),
        )
        .reduce((sum, b) => sum + b.service.price, 0)
      return { month: monthName, revenue: revenue / 100 }
    })

    // Bookings by status
    const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
    const bookingsByStatus = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await db.booking.count({ where: { status: status as any } }),
      })),
    )

    // Top services
    const allBookings = await db.booking.findMany({
      include: { service: true },
    })

    const serviceBookings: Record<string, number> = {}
    allBookings.forEach((b) => {
      serviceBookings[b.service.name] = (serviceBookings[b.service.name] || 0) + 1
    })

    const topServices = Object.entries(serviceBookings)
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)

    return NextResponse.json({
      revenueByMonth,
      bookingsByStatus,
      topServices,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
