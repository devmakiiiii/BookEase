# BookEase Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (via Neon)
- Stripe account for payment processing

## Installation

1. **Clone and install dependencies:**
   \`\`\`bash
   npm install
   npm install @stripe/react-stripe-js stripe @prisma/client bcryptjs
   \`\`\`

2. **Set up environment variables:**
   Create a `.env.local` file with your Neon and Stripe credentials:
   \`\`\`
   NEON_DATABASE_URL=your_neon_connection_string
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   \`\`\`

3. **Initialize the database:**
   \`\`\`bash
   npx prisma migrate dev --name init
   \`\`\`

4. **Create an admin account:**
   - Sign up at http://localhost:3000/auth/signup
   - Use your admin email
   - Access the database directly to promote the user to admin:
   \`\`\`sql
   INSERT INTO "Admin" ("id", "userId") 
   VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'your@email.com'));
   \`\`\`

5. **Add services:**
   - Log in to the admin dashboard at http://localhost:3000/dashboard
   - Go to "Services" and create your first service

6. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Features

**Customer Features:**
- Browse services and check availability
- Book appointments with date/time selection
- Secure Stripe payment processing
- Email confirmation of bookings
- View booking history

**Admin Features:**
- Dashboard with key metrics
- Manage bookings (view, confirm, cancel)
- Add/edit/delete services
- View all clients and their booking history
- Analytics dashboard with revenue trends and booking statistics

## Email Setup (Optional)

To enable real email notifications, set up Resend:
1. Create a Resend account at https://resend.com
2. Add `RESEND_API_KEY` to your environment variables
3. Update `lib/email.ts` to use the Resend service

Currently, emails are logged to the console in development.

## Deployment

Deploy to Vercel:
\`\`\`bash
npm run build
git push origin main
\`\`\`

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings
3. Deploy!

## Support

For issues or questions, check the documentation or create an issue on GitHub.
\`\`\`

```json file="" isHidden
