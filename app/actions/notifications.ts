"use server"

import {
  sendEmail,
  sendSMS,
  getBookingConfirmationEmail,
  getBookingCancelledEmail,
  getAdminBookingNotificationEmail,
  getBookingApprovedEmail,
  getBookingRescheduledEmail,
  getAdminCancellationNotificationEmail,
} from "@/lib/email"
import { db } from "@/lib/db"

export async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    })

    if (!booking) return

    const confirmationEmail = getBookingConfirmationEmail(
      `${booking.customer.firstName} ${booking.customer.lastName}`,
      booking.service.name,
      booking.startTime,
      booking.service.price,
    )

    await sendEmail({
      to: booking.customer.email,
      subject: `Booking Confirmed - ${booking.service.name}`,
      html: confirmationEmail,
    })

    // Send admin notification
    const admin = await db.admin.findFirst()
    if (admin?.userId) {
      const adminUser = await db.user.findUnique({ where: { id: admin.userId } })
      if (adminUser) {
        const adminEmail = getAdminBookingNotificationEmail(
          `${booking.customer.firstName} ${booking.customer.lastName}`,
          booking.customer.email,
          booking.service.name,
          booking.startTime,
          booking.service.price,
        )

        await sendEmail({
          to: adminUser.email,
          subject: `New Booking - ${booking.service.name}`,
          html: adminEmail,
        })
      }
    }
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error)
  }
}

export async function sendBookingCancelledEmail(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    })

    if (!booking) return

    const cancelledEmail = getBookingCancelledEmail(`${booking.customer.firstName} ${booking.customer.lastName}`, booking.service.name, booking.startTime)

    await sendEmail({
      to: booking.customer.email,
      subject: `Booking Cancelled - ${booking.service.name}`,
      html: cancelledEmail,
    })
  } catch (error) {
    console.error("Failed to send booking cancelled email:", error)
  }
}

export async function sendBookingApprovedEmail(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    })

    if (!booking) return

    const approvedEmail = getBookingApprovedEmail(`${booking.customer.firstName} ${booking.customer.lastName}`, booking.service.name, booking.startTime)

    await sendEmail({
      to: booking.customer.email,
      subject: `Booking Approved - ${booking.service.name}`,
      html: approvedEmail,
    })
  } catch (error) {
    console.error("Failed to send booking approved email:", error)
  }
}

export async function sendBookingRescheduledEmail(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    })

    if (!booking) return

    const rescheduledEmail = getBookingRescheduledEmail(`${booking.customer.firstName} ${booking.customer.lastName}`, booking.service.name, booking.startTime)

    await sendEmail({
      to: booking.customer.email,
      subject: `Booking Rescheduled - ${booking.service.name}`,
      html: rescheduledEmail,
    })
  } catch (error) {
    console.error("Failed to send booking rescheduled email:", error)
  }
}

export async function sendAdminCancellationNotificationEmail(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    })

    if (!booking) return

    const admin = await db.admin.findFirst()
    if (!admin?.userId) return

    const adminUser = await db.user.findUnique({ where: { id: admin.userId } })
    if (!adminUser) return

    const cancellationEmail = getAdminCancellationNotificationEmail(
      `${booking.customer.firstName} ${booking.customer.lastName}`,
      booking.customer.email,
      booking.service.name,
      booking.startTime,
      booking.service.price,
      (booking as any).cancellationReason || "Not specified"
    )

    await sendEmail({
      to: adminUser.email,
      subject: `Booking Cancelled - ${booking.service.name}`,
      html: cancellationEmail,
    })

    // Send SMS notification if phone number is available
    if (adminUser.phone) {
      const smsMessage = `Booking cancelled: ${booking.service.name} for ${booking.customer.firstName} ${booking.customer.lastName} on ${booking.startTime.toLocaleString()}`
      await sendSMS(adminUser.phone, smsMessage)
    }
  } catch (error) {
    console.error("Failed to send admin cancellation notification email:", error)
  }
}
