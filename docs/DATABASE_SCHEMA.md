# Database Schema

This document outlines the Supabase database schema for the Golf Performance Tracking application.

## Tables

### users
Stores user account information and preferences.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  charity_id UUID REFERENCES charities(id),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier
- `email`: User email address
- `password_hash`: Hashed password
- `subscription_status`: 'active', 'inactive', or 'trial'
- `charity_id`: Foreign key to selected charity
- `last_login`: Last login timestamp
- `created_at`: Account creation timestamp

---

### scores
Tracks golf scores for users (maintains last 5 scores).

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score > 0 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_user_date ON scores(user_id, date DESC);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `score`: Golf score in Stableford format (1-45 points)
- `date`: Date of the game
- `created_at`: Record creation timestamp

**Constraints:**
- Score must be between 1 and 45 (Stableford format)
- Automatically maintain only the last 5 scores per user

---

### subscriptions
Manages user subscription information and billing.

```sql
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
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `plan_type`: 'monthly' or 'yearly'
- `status`: 'active', 'inactive', or 'cancelled'
- `subscription_start`: Subscription start date
- `subscription_end`: Subscription expiry date
- `stripe_subscription_id`: Stripe subscription identifier
- `created_at`: Record creation timestamp

---

### charities
Charity directory and donation tracking.

```sql
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  total_contributions DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_charities_name ON charities(name);
```

**Fields:**
- `id`: Unique identifier
- `name`: Charity name
- `description`: Charity description
- `image_url`: Charity logo/image URL
- `total_contributions`: Total donations received
- `created_at`: Record creation timestamp

---

### draws
Monthly draw configurations and results.

```sql
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
```

**Fields:**
- `id`: Unique identifier
- `type`: Draw type ('5-match', '4-match', '3-match')
- `draw_date`: When the draw occurs
- `status`: 'published' or 'not-published'
- `result`: JSON containing {numbers: [], winners_count: number}
- `created_at`: Record creation timestamp

---

### winners
Tracks draw winners and verification status.

```sql
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
```

**Fields:**
- `id`: Unique identifier
- `draw_id`: Foreign key to draws
- `user_id`: Foreign key to users
- `prize_amount`: Prize amount in USD
- `verified`: Whether admin verified the win
- `proof_url`: URL to uploaded proof (screenshot)
- `created_at`: Record creation timestamp

---

### donations
Charity donation history.

```sql
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

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `charity_id`: Foreign key to charities
- `donation_amount`: Donation amount in USD
- `date`: Date of donation
- `created_at`: Record creation timestamp

---

## Security Considerations

1. **Password Hashing**: Always hash passwords using bcrypt or similar before storing
2. **Row Level Security (RLS)**: Enable RLS on all tables to restrict user access to their own data
3. **Foreign Key Constraints**: All foreign keys have CASCADE delete to maintain referential integrity
4. **Indexes**: Create indexes on frequently queried columns for performance
5. **Sensitive Data**: Do not store credit card information; use Stripe for payment handling

---

## Scalability Extensions (Multi-country, Team, Campaign)

Add these tables to support the PRD scalability requirements:

```sql
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL REFERENCES countries(code),
  name VARCHAR(160) NOT NULL,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (team_id, user_id)
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) REFERENCES countries(code),
  team_id UUID REFERENCES teams(id),
  name VARCHAR(180) NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('draft','active','paused','completed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Recommended compatibility updates:

- Add `country_code` to `draws`, `charities`, and `subscriptions` for regional expansion.
- Add `team_id` and `campaign_id` to `subscriptions` and `donations`.
- Add indexes:
  - `idx_campaigns_status_dates` on `(status, starts_at, ends_at)`
  - `idx_subscriptions_country_status` on `(country_code, status)`
  - `idx_donations_campaign_country` on `(campaign_id, charity_id, date DESC)`

## Setup Instructions

1. Create a new Supabase project
2. Run the SQL commands above to create all tables
3. Enable Row Level Security on sensitive tables
4. Create appropriate policies for data access
5. Enable backups and point-in-time recovery
