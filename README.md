# BookEase - Booking Management System

A modern booking management system built with Next.js, Prisma, and Stripe.

## Features

- User authentication and authorization
- Service management
- Booking system with Stripe payment integration
- Admin dashboard for managing bookings and clients
- Real-time booking status updates

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Database setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Stripe webhook setup for development**:
   ```bash
   npm run webhooks
   ```
   This will:
   - Check Stripe CLI installation
   - Login to Stripe
   - Start webhook forwarding to `localhost:3000/api/stripe-webhook`
   - Provide webhook signing secret to add to `.env.local`

5. **Start development server**:
   ```bash
   npm run dev
   ```

## Stripe Webhooks in Development

For automatic payment status updates during development:

### Option 1: Stripe CLI (Recommended)
```bash
npm run webhooks
```
This runs a setup script that configures Stripe CLI to forward webhooks to your local server.

### Option 2: Manual Setup
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
4. Copy the webhook signing secret to `.env.local`

### Option 3: HTTPS Tunneling (ngrok)
```bash
npm install -g ngrok
ngrok http 3000
```
Use the HTTPS URL from ngrok as your webhook endpoint in Stripe Dashboard.

## Manual Payment Updates

If webhooks aren't working, admins can manually mark bookings as paid through the admin dashboard.

## Production Deployment

For production, ensure:
- HTTPS is enabled
- Webhook endpoint is configured in Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` is set with the production webhook secret

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom auth with bcrypt
- **Payments**: Stripe
- **Email**: Custom email service
- **UI Components**: Radix UI

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run webhooks` - Setup Stripe webhooks for development
