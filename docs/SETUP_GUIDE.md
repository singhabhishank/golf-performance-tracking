# Setup and Deployment Guide

This guide walks you through setting up and deploying the Golf Performance Tracking application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Accounts for: Supabase, Stripe, and Vercel

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project (choose a name and region)
3. Wait for the project to be provisioned
4. Go to Project Settings > Database > Connection String
5. Copy the connection string for later

### 1.2 Create Database Tables

1. In Supabase, go to SQL Editor
2. Create a new query and paste the SQL from `docs/DATABASE_SCHEMA.md`
3. Run the query to create all tables
4. Verify tables are created in the "Tables" section

### 1.3 Enable Row Level Security

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
```

### 1.4 Get Your API Keys

1. Go to Settings > API
2. Copy your:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Stripe Setup

### 2.1 Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Verify your email and business information
3. Complete onboarding

### 2.2 Create Price Objects

1. In Stripe Dashboard, go to Products
2. Create two products:
   - **Monthly Subscription**: $9.99/month
   - **Yearly Subscription**: $99.99/year
3. Copy the Price IDs for each product

### 2.3 Get Your API Keys

1. Go to Developers > API Keys
2. Copy your:
   - `Publishable Key` (starts with `pk_test_`)
   - `Secret Key` (starts with `sk_test_`)

### 2.4 Create a Webhook Endpoint

1. Go to Developers > Webhooks
2. Add endpoint with URL: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `charge.succeeded`, `charge.failed`
4. Copy the `Signing Secret`

---

## Step 3: Local Development Setup (Vite + Local API)

### 3.1 Clone and Install

```bash
# Clone the repository (if using git)
git clone your-repo-url
cd golf-performance-tracking

# Install dependencies
npm install
```

### 3.2 Create Environment Variables

Create a `.env.local` file in the repository root:

```env
# Supabase (frontend + API server)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id

# Optional SMTP for email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=smtp-user
SMTP_PASS=smtp-password
SMTP_FROM=no-reply@example.com

# API + frontend URLs
API_PORT=8787
VITE_API_BASE_URL=http://localhost:8787
```

### 3.3 Run Development Server

```bash
cd "/Users/macbookpro/Desktop/golf performance tracking"
npm run dev:api

Terminal 2 (Frontend)
cd "/Users/macbookpro/Desktop/golf performance tracking"
npm run dev
Then open

 `Frontend: http://localhost:5173 to see the application.

---

## Step 4: Testing the Application

### 4.1 Test User Registration

1. Visit `/signup`
2. Enter a test email and password
3. Verify account is created in Supabase

### 4.2 Test Score Entry

1. Sign in to dashboard
2. Add a golf score
3. Verify score appears in history (max 5 stored)

### 4.3 Test Subscription

1. In admin panel, navigate to Draw Management
2. Create a test draw
3. Verify draw appears in Draws page

### 4.4 Test Charity Selection

1. Visit Charities page
2. Select a charity (this requires adding initial charities to database)

---

## Step 5: Deployment and Handoff

### 5.1 Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Golf Performance Tracking app"

# Add remote (use your GitHub/GitLab URL)
git remote add origin your-repo-url

# Push to main branch
git push -u origin main
```

### 5.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub account
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - Add all variables from `.env.local` as Environment Variables
   - Make sure to include both public and secret keys
6. Click "Deploy"

### 5.3 Verify Deployment

- Check the deployment logs in Vercel dashboard
- Visit your production URL
- Test authentication flow
- Verify API calls work correctly

### 5.4 Live URL and Credentials Handoff

After deployment, update this section before project handoff:

- Live website URL: `https://<your-vercel-project>.vercel.app`
- API URL (if separate): `https://<your-api-domain>`
- Test user email: `<test-user-email>`
- Test user password: `<test-user-password>`
- Admin email: `<admin-email>`
- Admin password: `<admin-password>`
- Stripe mode: `test` or `live`
- Supabase project ID: `<project-id>`

Store real credentials in your password manager, not in git.

---

## Step 6: Post-Deployment Setup

### 6.1 Initialize Sample Data

Add initial charities:

```sql
INSERT INTO charities (name, description, image_url, total_contributions)
VALUES
  ('Save the Children', 'Helping children worldwide', 'https://...', 0),
  ('Red Cross', 'International humanitarian organization', 'https://...', 0),
  ('World Wildlife Fund', 'Environmental conservation', 'https://...', 0);
```

### 6.2 Configure Email Notifications

Set up SMTP and trigger notifications for:
- Welcome email
- Subscription confirmation/renewal/cancellation
- Draw results notification
- Winner approval + payout status

### 6.3 Enable Analytics

- Set up Google Analytics in Vercel
- Monitor user engagement and performance
- Track conversion rates

---

## Monitoring and Maintenance

### Regular Tasks

- **Daily**: Check admin dashboard for new winners
- **Weekly**: Review subscription cancellations
- **Monthly**: Process draw results and verify winners
- **Monthly**: Review donation analytics

### Troubleshooting

**Issue**: "Database connection failed"
- Verify Supabase URL and keys in `.env.local`
- Check firewall settings in Supabase

**Issue**: "Stripe payment failed"
- Verify Stripe keys are correct
- Check webhook configuration
- Review Stripe logs

**Issue**: "Authentication not working"
- Clear browser cookies
- Verify Supabase Auth settings
- Check environment variables on Vercel

---

## Support

For issues or questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Stripe API docs](https://stripe.com/docs)
3. Consult [Next.js documentation](https://nextjs.org/docs)
4. Open an issue in the repository

---

## Production Checklist

- [ ] All environment variables set correctly
- [ ] Database backups configured
- [ ] Stripe in production mode (not test mode)
- [ ] SSL/TLS certificates enabled
- [ ] Email notifications working
- [ ] Admin account created and secured
- [ ] Monitoring and logging configured
- [ ] Error tracking (Sentry) configured
- [ ] Database indexed for performance
- [ ] Rate limiting configured on API endpoints
