# ⚡ Quick Start Checklist

**Copy-paste this guide into your browser or notes app for easy reference.**

---

## 📋 PRE-SETUP (Get Accounts)
- [ ] Create Supabase account: https://supabase.com/sign-up
- [ ] Create Stripe account: https://stripe.com/start
- [ ] Create Vercel account: https://vercel.com/signup
- [ ] Create GitHub account or use existing: https://github.com

---

## 🛠️ STEP 1: SUPABASE DATABASE (15 mins)

### 1a. Create Project
```
1. supabase.com → "New Project"
2. Name: golf-performance-tracking
3. Password: (choose strong)
4. Region: (closest to you)
5. Create → Wait 2-3 mins
```

### 1b. Copy API Keys
```
Settings > API
- Copy: NEXT_PUBLIC_SUPABASE_URL
- Copy: NEXT_PUBLIC_SUPABASE_ANON_KEY
- Copy: SUPABASE_SERVICE_ROLE_KEY (SECRET!)
```

### 1c. Create Tables
```
SQL Editor > New Query
Paste all SQL from SETUP_INSTRUCTIONS.md (Step 1.3)
Run → Verify 7 tables exist in left sidebar
```

### 1d. Seed Charities
```
SQL Editor > New Query
Paste SQL from SETUP_INSTRUCTIONS.md (Step 1.4)
Run → Verify 3 charities in Table Editor
```

### 1e. Enable RLS
```
Authentication > Policies
For each table: Click table → "Enable RLS"
Tables: users, scores, subscriptions, charities, draws, winners, donations
```

---

## 💳 STEP 2: STRIPE SETUP (15 mins)

### 2a. Create Products
```
stripe.com → Products
Create 2 products:
  1. Monthly Subscription: $9.99/month
  2. Yearly Subscription: $99.99/year
Copy each Price ID (price_xxxx)
```

### 2b. Get API Keys
```
Developers > API Keys (Test mode)
- Copy: Publishable Key (pk_test_)
- Copy: Secret Key (sk_test_)
```

### 2c. Create Webhook (Local Testing)
```
Developers > Webhooks > Add Endpoint
Events: charge.succeeded, charge.failed, customer.subscription.updated
For local: Use Stripe CLI (see Step 4.2 below)
```

---

## 🌍 STEP 3: UPDATE .env.local (5 mins)

```bash
# Edit: .env.local
Replace PLACEHOLDER VALUES:

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

NEXTAUTH_SECRET=your-secret (generate: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Save file.**

---

## 🧪 STEP 4: LOCAL TESTING (10 mins)

### 4.1 Build & Start
```bash
cd "/Users/macbookpro/Desktop/golf performance tracking"
npm install
npm run build      # Should complete with no errors
npm run dev        # Start server at http://localhost:3000
```

### 4.2 Test Webhook (Optional)
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy webhook secret from output
# Update STRIPE_WEBHOOK_SECRET in .env.local
```

### 4.3 Test Features
```
1. SIGNUP:
   - Visit http://localhost:3000
   - Click "Sign Up"
   - Enter email & password
   - Should redirect to dashboard

2. SCORE ENTRY:
   - Add Stableford score (1-45)
   - Select date
   - Click "Add Score"
   - Verify score appears

3. CHARITIES:
   - Go to "Charities" page
   - Should see 3 charities
   - Select one
   - Verify in dashboard

4. ADMIN:
   - Go to "Admin"
   - Check all 5 tabs load
   - Create test draw
```

---

## 🚀 STEP 5: DEPLOY TO VERCEL (10 mins)

### 5a. Push to GitHub
```bash
cd "/Users/macbookpro/Desktop/golf performance tracking"
git init
git add .
git commit -m "Golf tracking app - initial commit"
git remote add origin https://github.com/YOUR_USERNAME/golf-tracking.git
git push -u origin main
```

### 5b. Deploy
```
1. vercel.com → Import Project
2. Select your GitHub repository
3. Click "Import"
```

### 5c. Add Environment Variables
```
Vercel Dashboard → Settings > Environment Variables
Add all 11 variables from .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_STRIPE_PUBLIC_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_MONTHLY_PRICE_ID
- STRIPE_YEARLY_PRICE_ID
- NEXTAUTH_SECRET
- NEXTAUTH_URL (set to your Vercel URL)
- NEXT_PUBLIC_APP_URL (set to your Vercel URL)
```

### 5d. Redeploy
```
Vercel Dashboard → Redeploy
Wait 2-3 mins → Click "Visit"
```

### 5e. Update Stripe Webhook
```
Stripe Dashboard > Webhooks > Add Endpoint
URL: https://your-vercel-url.vercel.app/api/webhooks/stripe
Events: charge.succeeded, charge.failed, customer.subscription.updated
Copy signing secret → Update STRIPE_WEBHOOK_SECRET in Vercel env vars
Redeploy again
```

---

## ✅ FINAL CHECKLIST

- [ ] All Supabase tables created
- [ ] 3 charities seeded
- [ ] Stripe products created
- [ ] All env vars in .env.local
- [ ] Local dev works: `npm run dev`
- [ ] Can signup/login
- [ ] Can add scores
- [ ] Can view charities
- [ ] Admin panel works
- [ ] Build succeeds: `npm run build`
- [ ] Deployed to Vercel
- [ ] Live URL functional
- [ ] Stripe webhook connected

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `Can't connect to Supabase` | Check URL & keys in .env.local, verify project is active |
| `Charities not appearing` | Run charity INSERT SQL again, refresh page |
| `Build fails` | Run `npm run build`, fix any errors shown, retry |
| `Webhook not working locally` | Use `stripe listen` command (see Step 4.2) |
| `Stripe errors` | Check API keys are for TEST mode (pk_test_, sk_test_) |
| `Deploy fails on Vercel` | Add all env vars, redeploy |

---

## 📞 SUPPORT RESOURCES

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Full Setup Guide: See SETUP_INSTRUCTIONS.md

---

**Expected total time: ~1 hour. Good luck! 🚀**
