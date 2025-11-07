"use server"

import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { getCurrentUser } from "./auth"

export async function createBooking(serviceId: string, startTime: string, notes: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const service = await db.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new Error("Service not found")
  }

  // Check for existing pending booking to prevent duplicates
  const existingBooking = await db.booking.findFirst({
    where: {
      customerId: user.id,
      serviceId: serviceId,
      startTime: new Date(startTime),
      status: "PENDING",
    },
  })

  if (existingBooking) {
    return existingBooking.id
  }

  // Create booking
  const booking = await db.booking.create({
    data: {
      customerId: user.id,
      serviceId: serviceId,
      startTime: new Date(startTime),
      endTime: new Date(new Date(startTime).getTime() + service.duration * 60000),
      status: "PENDING",
      notes,
    },
  })

  return booking.id
}

export async function startCheckoutForBooking(bookingId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  })

  if (!booking || booking.customerId !== user.id) {
    throw new Error("Booking not found or unauthorized")
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.service.name,
            description: `Appointment on ${booking.startTime.toLocaleString()}`,
          },
          unit_amount: booking.service.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      bookingId: booking.id,
    },
  })

  // Store the session ID with the booking
  await db.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.client_secret },
  })

  return session.client_secret
}
