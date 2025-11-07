import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, duration, price } = await request.json()
    const service = await db.service.create({
      data: { name, description, duration, price },
    })
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
