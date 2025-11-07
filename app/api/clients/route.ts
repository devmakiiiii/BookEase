import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const clients = await db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bookings: {
          where: { paymentStatus: "PAID" },
          include: { service: true },
        },
      },
    })

    const clientsWithStats = clients.map((client) => ({
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      phone: client.phone,
      bookingCount: client.bookings.length,
      totalSpent: client.bookings.reduce((sum, b) => sum + b.service.price, 0),
    }))

    return NextResponse.json(clientsWithStats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
