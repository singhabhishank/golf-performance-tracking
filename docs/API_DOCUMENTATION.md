# API Documentation

Complete reference for all API endpoints in the Golf Performance Tracking application.

## Base URL

```
Development: http://localhost:8787
Production: https://your-api-domain
```

## Authentication

All endpoints (except auth endpoints) require a valid session. Authentication is handled via Supabase Auth with JWT tokens.

### Subscription Validation (strict)
**POST** `/auth/validate-subscription`

Validates subscription status on authenticated requests.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (200):**
```json
{
  "allowed": true,
  "role": "subscriber",
  "subscription_status": "active",
  "subscription_plan": "monthly"
}
```

---

## Authentication Endpoints

### Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "charityId": "uuid-of-charity" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2026-04-27T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing email/password or invalid format
- `400`: Password too short (< 8 characters)
- `400`: Email already registered

---

### Sign In
**POST** `/auth/signin`

Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

## Score Endpoints

### Get User Scores
**GET** `/scores?userId={userId}`

Retrieve user's scores (last 5, in reverse chronological order).

**Query Parameters:**
- `userId` (required): UUID of the user

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "score": 85,
    "date": "2026-04-27",
    "created_at": "2026-04-27T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "score": 82,
    "date": "2026-04-26",
    "created_at": "2026-04-27T09:00:00.000Z"
  }
]
```

---

### Add Score
**POST** `/scores`

Add a new golf score. Automatically removes oldest score if already have 5.

**Request Body:**
```json
{
  "userId": "uuid",
  "score": 85,
  "date": "2026-04-27"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "score": 85,
  "date": "2026-04-27",
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing userId, score, or date
- `400`: Invalid score (not 1-45 Stableford format)

---

### Delete Score
**DELETE** `/scores`

Remove a specific score.

**Request Body:**
```json
{
  "scoreId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Score deleted"
}
```

**Error Responses:**
- `400`: Missing scoreId
- `404`: Score not found

---

## Subscription Endpoints

### Get Subscription Status
**GET** `/subscriptions?userId={userId}`

Get user's current subscription information.

**Query Parameters:**
- `userId` (required): UUID of the user

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "plan_type": "monthly",
    "status": "active",
    "subscription_start": "2026-04-01T00:00:00.000Z",
    "subscription_end": "2026-05-01T00:00:00.000Z",
    "stripe_subscription_id": "sub_xxx",
    "created_at": "2026-04-01T10:00:00.000Z"
  }
]
```

---

### Create Subscription
**POST** `/subscriptions`

Create a new subscription for the user.

**Request Body:**
```json
{
  "userId": "uuid",
  "planType": "monthly" // or "yearly"
}
```

**Response (201):**
```json
{
  "subscription": {
    "id": "uuid",
    "user_id": "uuid",
    "plan_type": "monthly",
    "status": "active",
    "subscription_start": "2026-04-27T10:00:00.000Z",
    "subscription_end": "2026-05-27T10:00:00.000Z",
    "stripe_subscription_id": "sub_xxx"
  },
  "stripeSubscription": { /* Stripe object */ }
}
```

**Error Responses:**
- `400`: Missing userId or planType
- `400`: Invalid plan type
- `404`: User not found

---

### Cancel Subscription
**POST** `/stripe/cancel-subscription`

Cancels active Stripe subscription and marks user as inactive.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true
}
```

## Draw Endpoints

### Get All Draws
**GET** `/draws`

Retrieve all monthly draws (newest first).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "type": "5-match",
    "draw_date": "2026-04-30T23:59:59.000Z",
    "status": "published",
    "result": {
      "numbers": [5, 12, 28, 34, 49],
      "winners_count": 2
    },
    "created_at": "2026-04-01T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "type": "5-match",
    "draw_date": "2026-03-31T23:59:59.000Z",
    "status": "not-published",
    "result": null,
    "created_at": "2026-03-01T10:00:00.000Z"
  }
]
```

---

### Create Draw
**POST** `/draws`

Create a new draw (admin only).

**Request Body:**
```json
{
  "type": "5-match", // "5-match", "4-match", or "3-match"
  "drawDate": "2026-04-30T23:59:59.000Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "type": "5-match",
  "draw_date": "2026-04-30T23:59:59.000Z",
  "status": "not-published",
  "result": null,
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

### Publish Draw
**POST** `/draws/publish`

Publish draw results and generate winning numbers (admin only).

**Request Body:**
```json
{
  "drawId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "type": "5-match",
  "draw_date": "2026-04-30T23:59:59.000Z",
  "status": "published",
  "result": {
    "numbers": [5, 12, 28, 34, 49],
    "winners_count": 0
  },
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

## Charity Endpoints

### Get Charities
**GET** `/charities`

Retrieve all available charities (alphabetical order).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Save the Children",
    "description": "Helping children worldwide",
    "image_url": "https://...",
    "total_contributions": 5000.00,
    "created_at": "2026-01-01T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Red Cross",
    "description": "International humanitarian organization",
    "image_url": "https://...",
    "total_contributions": 3500.00,
    "created_at": "2026-01-02T10:00:00.000Z"
  }
]
```

---

### Create Charity
**POST** `/charities`

Add a new charity to the directory (admin only).

**Request Body:**
```json
{
  "name": "Charity Name",
  "description": "Charity description",
  "imageUrl": "https://..." // optional
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Charity Name",
  "description": "Charity description",
  "image_url": "https://...",
  "total_contributions": 0,
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

### Get Donations
**GET** `/charities/donations?userId={userId}&charityId={charityId}`

Get donation history.

**Query Parameters:**
- `userId` (optional): Filter by user
- `charityId` (optional): Filter by charity

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "charity_id": "uuid",
    "donation_amount": 250.00,
    "date": "2026-04-25T10:00:00.000Z",
    "created_at": "2026-04-25T10:00:00.000Z"
  }
]
```

---

### Create Donation
**POST** `/charities/donations`

Record a donation (typically done after prize verification).

**Request Body:**
```json
{
  "userId": "uuid",
  "charityId": "uuid",
  "amount": 250.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "charity_id": "uuid",
  "donation_amount": 250.00,
  "date": "2026-04-27T10:00:00.000Z",
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

## Winner Endpoints

### Get Winners
**GET** `/winners?userId={userId}&drawId={drawId}&verified={true|false}`

Get winners matching criteria.

**Query Parameters:**
- `userId` (optional): Filter by user
- `drawId` (optional): Filter by draw
- `verified` (optional): Filter by verification status (true/false)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "draw_id": "uuid",
    "user_id": "uuid",
    "prize_amount": 500.00,
    "verified": false,
    "proof_url": "https://...",
    "created_at": "2026-04-27T10:00:00.000Z"
  }
]
```

---

### Record Winner
**POST** `/winners`

Record a winner for a draw.

**Request Body:**
```json
{
  "drawId": "uuid",
  "userId": "uuid",
  "prizeAmount": 500.00,
  "proofUrl": "https://..." // optional
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "draw_id": "uuid",
  "user_id": "uuid",
  "prize_amount": 500.00,
  "verified": false,
  "proof_url": "https://...",
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

### Verify Winner
**PATCH** `/winners`

Verify or reject a winner's submission (admin only).

**Request Body:**
```json
{
  "winnerId": "uuid",
  "verified": true // or false to reject
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "draw_id": "uuid",
  "user_id": "uuid",
  "prize_amount": 500.00,
  "verified": true,
  "proof_url": "https://...",
  "created_at": "2026-04-27T10:00:00.000Z"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Descriptive error message"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, add rate limiting middleware:
- 100 requests per minute for authenticated endpoints
- 20 requests per minute for authentication endpoints

---

## Pagination (Future)

Future versions will support pagination for list endpoints:
```
GET /api/endpoint?page=1&limit=10
```

---

## Webhooks

### Stripe Webhook
Receives Stripe lifecycle events with signature verification:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

**Endpoint**: `POST /stripe/webhook`

---

## Admin Endpoints

### Admin Winners
- `GET /admin/winners` — list winners with payment status and notes
- `PUT /admin/winners/:id` — approve/reject winner and set payout state

### Admin Charities
- `GET /admin/charities`
- `POST /admin/charities`
- `PUT /admin/charities/:id`
- `DELETE /admin/charities/:id`

### Admin Reports
- `GET /admin/reports` — live totals for users, subscriptions, draws, prize pool, and charity contributions

---

## Email Notifications

System sends notifications (when SMTP env vars are configured):
- winner proof approved
- subscription lifecycle updates
- draw/winner operational events (extensible)

---

## SDK/Client Libraries

Consider using these official libraries:
- [Supabase JS](https://github.com/supabase/supabase-js)
- [Stripe.js](https://github.com/stripe/stripe-js)
- [Next.js](https://nextjs.org/)

---

**API Version**: 1.0.0 | **Last Updated**: April 2026
