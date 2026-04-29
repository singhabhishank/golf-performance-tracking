import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.path === '/stripe/webhook') return next();
  return express.json()(req, res, next);
});

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv('VITE_SUPABASE_URL');
const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-01-27.acacia' });
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM ?? 'no-reply@golflottery.local';

const mailer =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

async function sendEmail({ to, subject, text }) {
  if (!mailer || !to) return;
  await mailer.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
  });
}

function pickUniqueInts({ count, min, max }) {
  const set = new Set();
  while (set.size < count) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    set.add(value);
  }
  return Array.from(set);
}

function computeMatchCount(userScores, winningNumbers) {
  const scoreSet = new Set(userScores.map((row) => Number(row.score)));
  return winningNumbers.reduce((acc, n) => acc + (scoreSet.has(n) ? 1 : 0), 0);
}

async function listActiveSubscriberUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw new Error(error.message);

  return data.users.filter(
    (u) => (u.user_metadata?.subscription_status ?? 'inactive') === 'active'
  );
}

async function listAllUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw new Error(error.message);
  return data.users;
}

async function setUserSubscriptionMeta(userId, patch) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) throw new Error(error.message);
  const currentMeta = data.user.user_metadata ?? {};
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { ...currentMeta, ...patch } }
  );
  if (updateError) throw new Error(updateError.message);
}

async function updateSubscriptionRecord(input) {
  const { userId, planType, status, stripeSubscriptionId } = input;
  const now = new Date();
  const end = new Date(now);
  if (planType === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_type: planType,
      status,
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
      stripe_subscription_id: stripeSubscriptionId,
    },
    { onConflict: 'stripe_subscription_id' }
  );
  if (error) throw new Error(error.message);
}

async function fetchLatestScoresForUsers(userIds) {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from('scores')
    .select('id,user_id,score,date,created_at')
    .in('user_id', userIds)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);

  const byUser = new Map();
  for (const row of data ?? []) {
    const list = byUser.get(row.user_id) ?? [];
    if (list.length < 5) {
      list.push(row);
      byUser.set(row.user_id, list);
    }
  }
  return byUser;
}

async function recordDonationsForUsers({ users, drawDateIso }) {
  // Minimal: donate user subscription * charity_percent (default 10%)
  // Uses monthly fee baseline 499 INR.
  const rows = [];
  for (const u of users) {
    const charityId = u.user_metadata?.charity_id;
    if (!charityId) continue;
    const percent = Number(u.user_metadata?.charity_percent ?? 10);
    const donation = (499 * Math.max(10, Math.min(50, percent))) / 100;
    rows.push({
      user_id: u.id,
      charity_id: charityId,
      donation_amount: donation,
      date: drawDateIso,
    });
  }
  if (rows.length === 0) return;

  const { error: insertErr } = await supabaseAdmin.from('donations').insert(rows);
  if (insertErr) throw new Error(insertErr.message);

  // Update charities totals (best-effort, aggregated in JS)
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.charity_id, (totals.get(r.charity_id) ?? 0) + r.donation_amount);
  }
  for (const [charityId, amount] of totals.entries()) {
    // increment total_contributions if column exists
    await supabaseAdmin.rpc?.('increment_charity_total', { charity_id: charityId, amount }).catch(() => null);
    // fallback update (may race but ok for demo)
    const { data: charityRow } = await supabaseAdmin
      .from('charities')
      .select('total_contributions')
      .eq('id', charityId)
      .maybeSingle();
    const current = Number(charityRow?.total_contributions ?? 0);
    await supabaseAdmin
      .from('charities')
      .update({ total_contributions: current + amount })
      .eq('id', charityId);
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/validate-subscription', async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) return res.status(400).json({ error: error.message });

    const user = data.user;
    const email = user.email ?? '';
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'subscriber';
    const subStatus = String(user.user_metadata?.subscription_status ?? 'inactive');
    const plan = String(user.user_metadata?.subscription_plan ?? '');

    const allowed = role === 'admin' || subStatus === 'active';
    res.json({
      allowed,
      role,
      subscription_status: subStatus,
      subscription_plan: plan,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/auth/ensure-user-record', async (req, res) => {
  try {
    const { userId, email } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const { data: existing, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (selectError) return res.status(400).json({ error: selectError.message });
    if (existing?.id) return res.json({ ensured: true });

    const candidateRows = [
      { id: userId, email: email ?? null, subscription_status: 'inactive' },
      {
        id: userId,
        email: email ?? null,
        subscription_status: 'inactive',
        password_hash: 'SUPABASE_AUTH_MANAGED',
      },
      { id: userId, email: email ?? null },
      { id: userId },
    ];

    let lastError = null;
    for (const row of candidateRows) {
      const { error } = await supabaseAdmin.from('users').insert(row);
      if (!error) return res.json({ ensured: true });
      lastError = error;
    }

    return res.status(400).json({
      error: lastError?.message ?? 'Failed to ensure users row',
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.get('/admin/users', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) return res.status(400).json({ error: error.message });

    res.json({
      users: data.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        user_metadata: u.user_metadata ?? {},
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.get('/admin/charities', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .order('name', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ charities: data ?? [] });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/admin/charities', async (req, res) => {
  try {
    const { name, description, image_url } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({ name, description: description ?? '', image_url: image_url ?? null })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ charity: data });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.put('/admin/charities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, total_contributions } = req.body ?? {};
    const { data, error } = await supabaseAdmin
      .from('charities')
      .update({ name, description, image_url, total_contributions })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ charity: data });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.delete('/admin/charities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('charities').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.get('/admin/winners', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select('id,draw_id,user_id,prize_amount,verified,proof_url,created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });

    const users = await listAllUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const winners = (data ?? []).map((w) => {
      const u = userMap.get(w.user_id);
      const paymentStatus = (u?.user_metadata?.winner_payment_status?.[w.id] ??
        (w.verified ? 'Pending' : 'Not Applicable'));
      const adminNotes = u?.user_metadata?.winner_notes?.[w.id] ?? '';
      return {
        ...w,
        email: u?.email ?? null,
        payment_status: paymentStatus,
        admin_notes: adminNotes,
      };
    });
    res.json({ winners });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.put('/admin/winners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, payment_status, admin_notes } = req.body ?? {};

    const { data: winner, error: winnerErr } = await supabaseAdmin
      .from('winners')
      .select('id,user_id,verified')
      .eq('id', id)
      .single();
    if (winnerErr) return res.status(400).json({ error: winnerErr.message });

    const patch = {};
    if (typeof verified === 'boolean') patch.verified = verified;
    const { error: updateErr } = await supabaseAdmin
      .from('winners')
      .update(patch)
      .eq('id', id);
    if (updateErr) return res.status(400).json({ error: updateErr.message });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(
      winner.user_id
    );
    if (!userErr) {
      const currentMeta = userData.user.user_metadata ?? {};
      const statusMap = { ...(currentMeta.winner_payment_status ?? {}) };
      const notesMap = { ...(currentMeta.winner_notes ?? {}) };
      if (payment_status) statusMap[id] = payment_status;
      if (admin_notes !== undefined) notesMap[id] = admin_notes;
      await supabaseAdmin.auth.admin.updateUserById(winner.user_id, {
        user_metadata: {
          ...currentMeta,
          winner_payment_status: statusMap,
          winner_notes: notesMap,
        },
      });
    }

    if (typeof verified === 'boolean') {
      const email = userData?.user?.email;
      if (verified) {
        await sendEmail({
          to: email,
          subject: 'Winner proof approved',
          text: 'Your winner proof has been approved. Payment will be processed shortly.',
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.get('/admin/reports', async (_req, res) => {
  try {
    const [usersData, subsData, drawsData, winnersData, donationsData, charitiesData] =
      await Promise.all([
        listAllUsers(),
        supabaseAdmin.from('subscriptions').select('id,plan_type,status'),
        supabaseAdmin.from('draws').select('id,draw_date,result,status').order('draw_date', { ascending: false }),
        supabaseAdmin.from('winners').select('id,prize_amount,verified'),
        supabaseAdmin.from('donations').select('id,donation_amount,charity_id'),
        supabaseAdmin.from('charities').select('id,name,total_contributions'),
      ]);

    const totalUsers = usersData.length;
    const activeSubs = usersData.filter(
      (u) => (u.user_metadata?.subscription_status ?? 'inactive') === 'active'
    ).length;
    const monthlyCount =
      usersData.filter((u) => (u.user_metadata?.subscription_plan ?? '') === 'monthly')
        .length;
    const yearlyCount =
      usersData.filter((u) => (u.user_metadata?.subscription_plan ?? '') === 'yearly')
        .length;

    const draws = drawsData.data ?? [];
    const winners = winnersData.data ?? [];
    const donations = donationsData.data ?? [];
    const charities = charitiesData.data ?? [];
    const totalPrizePool = draws.reduce(
      (acc, d) => acc + Number(d?.result?.prize_pool ?? 0),
      0
    );
    const totalPayout = winners.reduce((acc, w) => acc + Number(w.prize_amount ?? 0), 0);
    const totalCharity = donations.reduce(
      (acc, d) => acc + Number(d.donation_amount ?? 0),
      0
    );

    res.json({
      summary: {
        totalUsers,
        activeSubscriptions: activeSubs,
        totalPrizePool,
        totalPayout,
        totalCharity,
      },
      subscriptionBreakdown: {
        monthly: monthlyCount,
        yearly: yearlyCount,
        inactive: totalUsers - activeSubs,
      },
      drawStats: draws.map((d) => ({
        id: d.id,
        month: d.draw_date,
        winners: Number(d?.result?.winners_count ?? 0),
        prizePool: Number(d?.result?.prize_pool ?? 0),
        status: d.status,
      })),
      charityStats: charities.map((c) => ({
        id: c.id,
        name: c.name,
        totalContributed: Number(c.total_contributions ?? 0),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planType, customerEmail, userId } = req.body ?? {};
    const monthlyPriceId = requireEnv('STRIPE_MONTHLY_PRICE_ID');
    const yearlyPriceId = requireEnv('STRIPE_YEARLY_PRICE_ID');

    const price =
      planType === 'yearly'
        ? yearlyPriceId
        : planType === 'monthly'
          ? monthlyPriceId
          : null;

    if (!price) {
      return res.status(400).json({ error: 'Invalid planType' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: 'http://localhost:5173/dashboard',
      cancel_url: 'http://localhost:5173/subscription',
      customer_email: customerEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        user_id: userId || '',
        plan_type: planType,
      },
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/stripe/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) return res.status(400).json({ error: error.message });
    const stripeSubscriptionId = data.user.user_metadata?.stripe_subscription_id;
    if (stripeSubscriptionId) {
      await stripe.subscriptions.cancel(String(stripeSubscriptionId));
    }
    await setUserSubscriptionMeta(userId, {
      subscription_status: 'inactive',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];
    if (!endpointSecret || !signature) {
      return res.status(400).json({ error: 'Missing webhook secret/signature' });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    const object = event.data.object;
    const customerEmail =
      object?.customer_details?.email || object?.customer_email || null;
    let userId = object?.metadata?.user_id || object?.client_reference_id || null;
    const planType = object?.metadata?.plan_type || 'monthly';
    const stripeSubId =
      object?.subscription ||
      object?.id ||
      object?.data?.object?.id ||
      null;

    if (!userId && customerEmail) {
      const users = await listAllUsers();
      const match = users.find((u) => u.email === customerEmail);
      if (match) userId = match.id;
    }

    if (userId) {
      if (
        event.type === 'checkout.session.completed' ||
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated'
      ) {
        await setUserSubscriptionMeta(userId, {
          subscription_status: 'active',
          subscription_plan: planType,
          stripe_subscription_id: String(stripeSubId || ''),
        });
        await updateSubscriptionRecord({
          userId,
          planType: planType === 'yearly' ? 'yearly' : 'monthly',
          status: 'active',
          stripeSubscriptionId: String(stripeSubId || ''),
        });
      }

      if (
        event.type === 'customer.subscription.deleted' ||
        event.type === 'invoice.payment_failed'
      ) {
        await setUserSubscriptionMeta(userId, {
          subscription_status: 'inactive',
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/admin/draws/simulate', async (req, res) => {
  try {
    const { drawLogic, drawDate } = req.body ?? {};
    const users = await listActiveSubscriberUsers();
    const userIds = users.map((u) => u.id);
    const scoresByUser = await fetchLatestScoresForUsers(userIds);

    // Random: pick winning numbers 1-45. Algorithmic: bias towards common scores.
    let winningNumbers;
    if (drawLogic === 'algorithmic') {
      const freq = new Map();
      for (const scores of scoresByUser.values()) {
        for (const s of scores) {
          const key = Number(s.score);
          freq.set(key, (freq.get(key) ?? 0) + 1);
        }
      }
      const candidates = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k]) => k);
      winningNumbers = [
        ...pickUniqueInts({ count: Math.min(5, candidates.length), min: 1, max: 45 }).map((_, idx) => candidates[idx] ?? (idx + 1)),
      ].slice(0, 5);
      while (winningNumbers.length < 5) {
        const extra = pickUniqueInts({ count: 1, min: 1, max: 45 })[0];
        if (!winningNumbers.includes(extra)) winningNumbers.push(extra);
      }
    } else {
      winningNumbers = pickUniqueInts({ count: 5, min: 1, max: 45 });
    }

    let fiveMatch = 0;
    let fourMatch = 0;
    let threeMatch = 0;
    let noMatch = 0;

    for (const u of users) {
      const scores = scoresByUser.get(u.id) ?? [];
      const matchCount = computeMatchCount(scores, winningNumbers);
      if (matchCount >= 5) fiveMatch += 1;
      else if (matchCount === 4) fourMatch += 1;
      else if (matchCount === 3) threeMatch += 1;
      else noMatch += 1;
    }

    res.json({
      drawDate: drawDate ?? null,
      winningNumbers,
      counts: { fiveMatch, fourMatch, threeMatch, noMatch },
      jackpotRollover: fiveMatch === 0,
      activeSubscribers: users.length,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

app.post('/admin/draws/publish', async (req, res) => {
  try {
    const { drawLogic, drawDate } = req.body ?? {};
    if (!drawDate) return res.status(400).json({ error: 'drawDate required (YYYY-MM-DD)' });

    const users = await listActiveSubscriberUsers();
    const userIds = users.map((u) => u.id);
    const scoresByUser = await fetchLatestScoresForUsers(userIds);

    // generate winning numbers using same rules as simulate
    const simulateRes = await fetch('http://localhost:8787/admin/draws/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawLogic, drawDate }),
    }).then((r) => r.json());

    const winningNumbers = simulateRes.winningNumbers;

    // Prize pool model (demo): each active subscriber contributes (499 - donation)
    const poolPerUser = 499 * 0.9;
    const prizePool = users.length * poolPerUser;
    const tier5 = prizePool * 0.4;
    const tier4 = prizePool * 0.35;
    const tier3 = prizePool * 0.25;

    const winners5 = [];
    const winners4 = [];
    const winners3 = [];

    for (const u of users) {
      const scores = scoresByUser.get(u.id) ?? [];
      const matchCount = computeMatchCount(scores, winningNumbers);
      if (matchCount >= 5) winners5.push(u);
      else if (matchCount === 4) winners4.push(u);
      else if (matchCount === 3) winners3.push(u);
    }

    // Create draw
    const drawDateIso = new Date(`${drawDate}T00:00:00.000Z`).toISOString();
    const { data: drawRow, error: drawErr } = await supabaseAdmin
      .from('draws')
      .insert({
        type: '5-match',
        draw_date: drawDateIso,
        status: 'published',
        result: {
          numbers: winningNumbers,
          winners_count: winners5.length + winners4.length + winners3.length,
          counts: {
            five: winners5.length,
            four: winners4.length,
            three: winners3.length,
          },
          prize_pool: prizePool,
          logic: drawLogic ?? 'random',
          jackpot_rollover: winners5.length === 0,
        },
      })
      .select('id')
      .single();

    if (drawErr) return res.status(400).json({ error: drawErr.message });

    const drawId = drawRow.id;

    const winnerRows = [];
    if (winners5.length > 0) {
      const each = tier5 / winners5.length;
      for (const u of winners5) {
        winnerRows.push({ draw_id: drawId, user_id: u.id, prize_amount: each, verified: false, proof_url: null });
      }
    }
    if (winners4.length > 0) {
      const each = tier4 / winners4.length;
      for (const u of winners4) {
        winnerRows.push({ draw_id: drawId, user_id: u.id, prize_amount: each, verified: false, proof_url: null });
      }
    }
    if (winners3.length > 0) {
      const each = tier3 / winners3.length;
      for (const u of winners3) {
        winnerRows.push({ draw_id: drawId, user_id: u.id, prize_amount: each, verified: false, proof_url: null });
      }
    }

    if (winnerRows.length > 0) {
      const { error: winErr } = await supabaseAdmin.from('winners').insert(winnerRows);
      if (winErr) return res.status(400).json({ error: winErr.message });
    }

    // Record charity donations (best-effort)
    await recordDonationsForUsers({ users, drawDateIso }).catch(() => null);

    res.json({
      drawId,
      winningNumbers,
      counts: {
        fiveMatch: winners5.length,
        fourMatch: winners4.length,
        threeMatch: winners3.length,
      },
      prizePool,
      jackpotRollover: winners5.length === 0,
      winnersCreated: winnerRows.length,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'Server error' });
  }
});

const port = Number(process.env.API_PORT ?? 8787);
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
