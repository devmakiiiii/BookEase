import "server-only"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: 'BookEase <noreply@bookease.com>', // Replace with your verified domain
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    console.log("Email sent successfully to:", options.to)
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  // Placeholder for SMS implementation - integrate with Twilio or similar service
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`)
  // TODO: Implement actual SMS sending
}

export function getBookingConfirmationEmail(
  customerName: string,
  serviceName: string,
  startTime: Date,
  price: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking has been confirmed. Here are your appointment details:</p>

            <div class="booking-details">
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
              <p><strong>Price:</strong> $${(price / 100).toFixed(2)}</p>
            </div>

            <p>Please arrive 5-10 minutes early. If you need to reschedule or cancel, please contact us as soon as possible.</p>

            <p>Thank you for booking with us!</p>
          </div>
          <div class="footer">
            <p>BookEase - Your Booking Solution</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getBookingCancelledEmail(customerName: string, serviceName: string, startTime: Date): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking has been cancelled:</p>

            <div class="booking-details">
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Original Date & Time:</strong> ${startTime.toLocaleString()}</p>
            </div>

            <p>If you would like to reschedule, you can book a new appointment anytime through our website.</p>

            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>BookEase - Your Booking Solution</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getAdminBookingNotificationEmail(
  customerName: string,
  customerEmail: string,
  serviceName: string,
  startTime: Date,
  price: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Received</h1>
          </div>
          <div class="content">
            <p>A new booking has been confirmed:</p>

            <div class="booking-details">
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
              <p><strong>Price:</strong> $${(price / 100).toFixed(2)}</p>
            </div>

            <p>Log in to your dashboard to manage this booking.</p>
          </div>
          <div class="footer">
            <p>BookEase Admin Notification</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getBookingApprovedEmail(customerName: string, serviceName: string, startTime: Date): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Approved!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking has been approved and confirmed. Here are your appointment details:</p>

            <div class="booking-details">
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
            </div>

            <p>Please arrive 5-10 minutes early. If you need to reschedule or cancel, please contact us as soon as possible.</p>

            <p>Thank you for booking with us!</p>
          </div>
          <div class="footer">
            <p>BookEase - Your Booking Solution</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getBookingRescheduledEmail(customerName: string, serviceName: string, startTime: Date): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Rescheduled</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking has been rescheduled. Here are your updated appointment details:</p>

            <div class="booking-details">
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>New Date & Time:</strong> ${startTime.toLocaleString()}</p>
            </div>

            <p>Please arrive 5-10 minutes early. If you need to make further changes, please contact us as soon as possible.</p>

            <p>Thank you for your understanding!</p>
          </div>
          <div class="footer">
            <p>BookEase - Your Booking Solution</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getAdminCancellationNotificationEmail(
  customerName: string,
  customerEmail: string,
  serviceName: string,
  startTime: Date,
  price: number,
  cancellationReason: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 8px; }
          .booking-details { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>A booking has been cancelled:</p>

            <div class="booking-details">
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Original Date & Time:</strong> ${startTime.toLocaleString()}</p>
              <p><strong>Price:</strong> $${(price / 100).toFixed(2)}</p>
              <p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>
            </div>

            <p>Please review the cancellation and process any necessary refunds if applicable.</p>
          </div>
          <div class="footer">
            <p>BookEase Admin Notification</p>
          </div>
        </div>
      </body>
    </html>
  `
}
