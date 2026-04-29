# 🚀 Complete Setup & Deployment Guide

**Status:** Code is production-ready. Follow these steps to activate the platform.

---

## 📋 Pre-Setup Checklist

- [ ] Supabase account created
- [ ] Stripe account created & verified
- [ ] Vercel account created
- [ ] GitHub repository created (for Vercel deployment)
- [ ] Local Node.js 18+ installed

---

## 🔧 STEP 1: Supabase Database Setup (20 mins)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Name it `golf-performance-tracking`
4. Choose a region (closest to your users)
5. Create a strong password
6. **Wait for provisioning** (2-3 minutes)

### 1.2 Copy API Keys

Once provisioned:
1. Go to **Settings > API**
2. Copy and save these three values:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key - **KEEP SECRET**)

### 1.3 Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. **Paste the entire SQL below:**

```sql
-- Create charities table first (no dependencies)
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  total_contributions DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_charities_name ON charities(name);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  charity_id UUID REFERENCES charities(id),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score > 0 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_user_date ON scores(user_id, date DESC);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')),
  subscription_start TIMESTAMP NOT NULL,
  subscription_end TIMESTAMP NOT NULL,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Create draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('5-match', '4-match', '3-match')),
  draw_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('published', 'not-published')),
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_draws_draw_date ON draws(draw_date DESC);
CREATE INDEX idx_draws_status ON draws(status);

-- Create winners table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prize_amount DECIMAL(12, 2) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  proof_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_winners_user_verified ON winners(user_id, verified);
CREATE INDEX idx_winners_draw ON winners(draw_id);

-- Create donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  donation_amount DECIMAL(12, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_user_charity ON donations(user_id, charity_id);
CREATE INDEX idx_donations_date ON donations(date DESC);
```

4. Click **"Run"** (or Ctrl+Enter)
5. **Verify** all 7 tables appear in the left sidebar

### 1.4 Seed Charity Data

1. In SQL Editor, click **"New Query"**
2. **Paste this SQL:**

```sql
INSERT INTO charities (name, description, image_url) VALUES
(
  'Save the Children',
  'Global humanitarian organization providing emergency aid and life-changing support to children in need.',
  'https://www.savethechildren.org/etc/designs/stc_usa/images/stc-logo.svg'
),
(
  'World Wildlife Fund',
  'Leading conservation organization protecting wildlife, forests, and oceans across the globe.',
  'https://www.worldwildlife.org/etc/designs/wwf/img/wwf-logo.png'
),
(
  'The Red Cross',
  'International humanitarian movement providing disaster relief, health services, and community support.',
  'https://www.redcross.org/images/app/rcc-logo.svg'
);
```

3. Click **"Run"**
4. Verify 3 charities are added (go to **Table Editor > charities**)

### 1.5 Enable Row Level Security (RLS)

1. Go to **Authentication > Policies**
2. **For each table** (users, scores, subscriptions, charities, draws, winners, donations):
   - Click the table name
   - Click **"Enable RLS"**
   - You'll add specific policies later (for now, RLS is enabled)

---

## 💳 STEP 2: Stripe Setup (15 mins)

### 2.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up and verify your email
3. Complete account setup

### 2.2 Create Products & Prices

1. In Stripe Dashboard, go to **Products**
2. Click **"Create Product"**
3. **Product 1 - Monthly:**
   - Name: `Monthly Subscription`
   - Price: `$9.99`
   - Billing period: `Monthly`
   - Click **"Save"**
   - **Copy the Price ID** (starts with `price_`)
   - Save as `STRIPE_MONTHLY_PRICE_ID`

4. Click **"Create Product"** again
5. **Product 2 - Yearly:**
   - Name: `Yearly Subscription`
   - Price: `$99.99`
   - Billing period: `Yearly`
   - Click **"Save"**
   - **Copy the Price ID**
   - Save as `STRIPE_YEARLY_PRICE_ID`

### 2.3 Get Stripe API Keys

1. Go to **Developers > API Keys**
2. You'll see two keys in **Test mode:**
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
3. **Copy both** and save them:
   - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`

### 2.4 Create Webhook Endpoint

1. Go to **Developers > Webhooks**
2. Click **"Add Endpoint"**
3. Enter Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - *(For local testing, use Stripe CLI below)*
4. Select Events:
   - `charge.succeeded`
   - `charge.failed`
   - `customer.subscription.updated`
5. Click **"Add Endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_`)
7. Save as `STRIPE_WEBHOOK_SECRET`

---

## 🌍 STEP 3: Update Environment Variables

1. Open `.env.local` in your project root
2. **Replace the placeholder values** with your actual keys:

```env
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5... (your actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5... (your actual key)

# ===== STRIPE =====
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_1234567890...
STRIPE_SECRET_KEY=sk_test_1234567890...
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890...
STRIPE_MONTHLY_PRICE_ID=price_1234567890...
STRIPE_YEARLY_PRICE_ID=price_0987654321...

# ===== AUTH =====
NEXTAUTH_SECRET=your-secret-key-here (generate: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# ===== APP =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

3. **Save the file**

---

## 🧪 STEP 4: Local Testing (15 mins)

### 4.1 Install Dependencies & Build

```bash
cd "/Users/macbookpro/Desktop/golf performance tracking"
npm install
npm run build
```

### 4.2 Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 4.3 Test User Signup

1. Click **"Sign Up"**
2. Enter:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Confirm: `TestPass123`
3. Click **"Create Account"**
4. ✅ Should redirect to dashboard

### 4.4 Test Score Entry

1. On dashboard, enter a Stableford score (1-45)
2. Select a date
3. Click **"Add Score"**
4. ✅ Score should appear in history below

### 4.5 Test Charity Selection

1. Go to **Charities** page
2. ✅ Should see 3 charities (Save the Children, WWF, Red Cross)
3. Click **"Select"** on one
4. ✅ Verify selection in dashboard

### 4.6 Test Admin Panel

1. Go to **Admin** (in menu)
2. Test each tab:
   - ✅ User Management: See test user
   - ✅ Draw Management: Create test draw
   - ✅ Charity Management: See 3 charities
   - ✅ Winner Verification: Empty initially
   - ✅ Reports: See placeholder stats

---

## 🚀 STEP 5: Deploy to Vercel (10 mins)

### 5.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - golf performance tracking app"
git remote add origin https://github.com/YOUR_USERNAME/golf-performance-tracking.git
git push -u origin main
```

### 5.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Click **"Import"**

### 5.3 Add Environment Variables

1. In Vercel, go to **Settings > Environment Variables**
2. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_MONTHLY_PRICE_ID`
   - `STRIPE_YEARLY_PRICE_ID`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel URL)
3. Click **"Save"**

### 5.4 Deploy

1. Click **"Deploy"**
2. **Wait for deployment** (usually 2-3 mins)
3. Click the **"Visit"** link to see live app
4. ✅ Test signup/login on live URL

---

## ✅ Final Verification Checklist

- [ ] Supabase project created & database tables exist
- [ ] 3 charities seeded in database
- [ ] Stripe products & prices created
- [ ] All 4 environment variable groups configured
- [ ] Local `npm run dev` works (no errors)
- [ ] Can sign up & log in
- [ ] Can add Stableford scores (1-45)
- [ ] Can see charities & select one
- [ ] Admin panel loads all 5 tabs
- [ ] Production build completes: `npm run build`
- [ ] App deployed to Vercel
- [ ] Live URL accessible & functional

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Supabase connection error | Verify API keys in `.env.local`, check Supabase project is active |
| Stripe webhook not firing | Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Build error TypeScript | Run `npm run build` to see specific error, fix, then rebuild |
| RLS denies all access | Add RLS policies in Supabase Auth > Policies (we'll add these) |
| Charity not appearing | Verify `INSERT` statement ran in SQL Editor, check charities table in Table Editor |

---

## 🎯 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│ VERCEL (Frontend Deployment)                            │
│ - Next.js app (16.2.4)                                  │
│ - Material-UI components                                │
│ - Client/Server authentication                          │
└─────────────────────────────────────────────────────────┘
           ↓                    ↓                   ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ SUPABASE         │  │ STRIPE           │  │ EMAIL (Future)   │
│ - PostgreSQL DB  │  │ - Payments       │  │ - Notifications  │
│ - Auth provider  │  │ - Subscriptions  │  │ - Resend/SendGrid│
│ - RLS security   │  │ - Webhooks       │  │ - Draw results   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

**Ready to launch? Follow the steps above in order. Expected time: ~1 hour total.**

Questions? Check [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for additional details.
