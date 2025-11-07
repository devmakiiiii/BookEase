# BookEase - Modern Booking & Scheduling Web App

A full-stack booking and scheduling platform for small businesses built with Next.js, Prisma, PostgreSQL, and Stripe.

## Features

### 🎯 Customer Features
- **Service Discovery**: Browse available services with pricing and duration info
- **Easy Booking**: Intuitive appointment booking with date/time selection and notes
- **Secure Payments**: Integrated Stripe checkout for safe transactions
- **Confirmations**: Automated email confirmations for all bookings
- **Booking History**: View past and upcoming appointments

### 👨‍💼 Admin Features
- **Dashboard**: Real-time overview with key metrics (bookings, revenue, clients)
- **Booking Management**: View, confirm, and cancel appointments
- **Service Management**: Create, edit, and delete services with pricing
- **Client Insights**: View all customers and their booking history
- **Analytics**: Revenue trends, booking distribution, and top services charts

### 🔒 Security & Performance
- Role-based access control (Customer/Admin)
- Secure authentication with bcrypt password hashing
- Server-side price validation to prevent tampering
- Responsive design that works on all devices
- Toast notifications for user feedback

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL via Neon with Prisma ORM
- **Auth**: Custom session-based authentication
- **Payments**: Stripe Checkout API
- **UI**: shadcn/ui components + Tailwind CSS
- **Charts**: Recharts for analytics visualizations
- **Email**: Resend-ready (template-based)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (use Neon for free)
- Stripe account (for payments)

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   Create `.env.local`:
   \`\`\`
   NEON_DATABASE_URL=postgresql://user:password@host/database
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   \`\`\`

3. **Initialize the database:**
   \`\`\`bash
   npx prisma migrate dev --name init
   npx prisma db seed  # Optional: seed sample data
   \`\`\`

4. **Create admin account:**
   - Sign up at http://localhost:3000/auth/signup
   - Run this in your database:
     \`\`\`sql
     INSERT INTO "Admin" ("id", "userId") 
     VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email = 'your@email.com'));
     \`\`\`

5. **Start the dev server:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the app:**
   - Customer: http://localhost:3000/book
   - Admin: http://localhost:3000/dashboard
   - Landing: http://localhost:3000

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Authentication pages (login, signup)
│   ├── book/                    # Customer booking interface
│   ├── dashboard/               # Admin dashboard
│   ├── api/                     # API routes & webhooks
│   ├── actions/                 # Server actions (auth, notifications)
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── booking-modal.tsx        # Booking form modal
│   └── checkout.tsx             # Stripe checkout component
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Prisma client
│   ├── stripe.ts                # Stripe configuration
│   └── email.ts                 # Email templates
├── prisma/
│   └── schema.prisma            # Database schema
└── middleware.ts                # Route protection middleware
\`\`\`

## API Routes

### Services
- `GET /api/services` - List all active services
- `POST /api/services` - Create service (admin only)
- `DELETE /api/services/[id]` - Delete service (admin only)

### Bookings
- `GET /api/bookings` - List all bookings (admin only)
- `POST /api/bookings/[id]/cancel` - Cancel booking (admin only)

### Clients
- `GET /api/clients` - List all clients (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get overview statistics (admin only)

### Analytics
- `GET /api/analytics` - Get analytics data (admin only)

### Webhooks
- `POST /api/stripe-webhook` - Handle Stripe payment events

## Email Setup

Currently emails are logged to console. To enable real emails:

1. **Option 1: Resend (Recommended)**
   \`\`\`bash
   npm install resend
   \`\`\`
   
   Update `.env.local`:
   \`\`\`
   RESEND_API_KEY=re_...
   \`\`\`

   Uncomment Resend code in `lib/email.ts`

2. **Option 2: SendGrid, Mailgun, etc.**
   - Implement in `lib/email.ts` `sendEmail()` function

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

\`\`\`bash
npm run build
\`\`\`

### Manual Deployment

1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Ensure PostgreSQL and Stripe credentials are set

## Database Schema

### Users
- Email authentication with hashed passwords
- Role-based access (CUSTOMER/ADMIN)

### Services
- Service offerings with duration and pricing
- Active/inactive status for soft deletes

### Bookings
- Customer → Service mapping
- Payment status tracking
- Booking status workflow (PENDING → CONFIRMED → COMPLETED/CANCELLED)

### Admins
- Admin account linking to users
- One-to-one relationship with User

## Security Considerations

✅ **Implemented:**
- HTTPS-only cookies in production
- Password hashing with bcrypt
- Server-side price validation
- Role-based access control
- CSRF protection via Stripe webhooks
- Input validation on forms

⚠️ **To Add (Production):**
- Rate limiting on auth endpoints
- CAPTCHA on signup
- Email verification
- Two-factor authentication for admins
- Request logging and monitoring

## Troubleshooting

**Database connection error:**
- Verify `DATABASE_URL` in `.env.local`
- Check Neon project is active
- Run `npx prisma db push` to sync schema

**Stripe errors:**
- Verify API keys are correct (not reversed)
- Check webhook is registered in Stripe dashboard
- Use `stripe listen` to test webhooks locally

**Email not sending:**
- Check console logs in development
- Verify Resend API key if using Resend
- Check spam folder for test emails

## Contributing

Contributions welcome! Please create a feature branch and submit a pull request.

## License

MIT - feel free to use for your own projects

## Support

- 📖 [Next.js Docs](https://nextjs.org)
- 💳 [Stripe Docs](https://stripe.com/docs)
- 🗄️ [Prisma Docs](https://prisma.io)
- 🎨 [shadcn/ui](https://ui.shadcn.com)
