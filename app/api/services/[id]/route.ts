import { getCurrentUser } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const { name, description, duration, price } = await request.json()
    console.log("Updating service:", { id, name, description, duration, price })

    // Check if service exists first
    const existingService = await db.service.findUnique({
      where: { id },
    })
    if (!existingService) {
      console.log("Service not found:", id)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const service = await db.service.update({
      where: { id },
      data: { name, description, duration, price },
    })
    console.log("Updated service:", service)
    return NextResponse.json(service)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await db.service.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
