import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Crown,
  Heart,
  Medal,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  addScore,
  createSubscription,
  deleteScore,
  fetchCharities,
  fetchCurrentUser,
  fetchDraws,
  fetchScores,
  fetchSubscriptions,
  selectCharity,
  signIn,
  signOut,
  signUp,
} from './lib/api';
import type { Charity, Draw, Score, Subscription, User } from './lib/types';

type AuthTab = 'login' | 'signup';

const stats = [
  { label: 'Active Members', value: '2,548+', icon: Users },
  { label: 'Donated to Charities', value: '₹24,60,000+', icon: Heart },
  { label: 'Prize Money Won', value: '₹18,75,000+', icon: Trophy },
  { label: 'Partner Charities', value: '128', icon: ShieldCheck },
];

const steps = [
  {
    title: 'Subscribe',
    description: 'Choose a monthly or yearly plan and join the community.',
    icon: Sparkles,
  },
  {
    title: 'Play & Submit',
    description: 'Add your Stableford score and track your rounds.',
    icon: Plus,
  },
  {
    title: 'Get in the Draw',
    description: 'Every score helps you qualify for the next prize draw.',
    icon: Medal,
  },
  {
    title: 'Win & Give Back',
    description: 'Support the charity you picked while competing for rewards.',
    icon: Crown,
  },
];

const charityGradients = [
  'from-emerald-500 to-teal-400',
  'from-sky-500 to-blue-400',
  'from-pink-500 to-rose-400',
  'from-violet-500 to-fuchsia-400',
  'from-amber-500 to-orange-400',
  'from-lime-500 to-emerald-400',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function initials(email?: string) {
  return email ? email.slice(0, 1).toUpperCase() : 'G';
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState<'monthly' | 'yearly' | null>(null);
  const [charityLoading, setCharityLoading] = useState<string | null>(null);

  const [scores, setScores] = useState<Score[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);

  const [scoreValue, setScoreValue] = useState('');
  const [scoreDate, setScoreDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);

  const selectedCharity = useMemo(
    () => charities.find((charity) => charity.id === selectedCharityId) ?? null,
    [charities, selectedCharityId],
  );

  const latestSubscription = subscriptions[0] ?? null;
  async function refreshPublicData() {
    const [nextCharities, nextDraws] = await Promise.all([fetchCharities(), fetchDraws()]);
    setCharities(nextCharities);
    setDraws(nextDraws);
  }

  async function refreshPrivateData(currentUser: User | null) {
    if (!currentUser) {
      setScores([]);
      setSubscriptions([]);
      setSelectedCharityId(null);
      return;
    }

    const [nextScores, nextSubscriptions, nextCharities] = await Promise.all([
      fetchScores().catch(() => []),
      fetchSubscriptions().catch(() => []),
      fetchCharities().catch(() => charities),
    ]);

    setScores(nextScores);
    setSubscriptions(nextSubscriptions);
    setCharities(nextCharities);
    setSelectedCharityId(currentUser.charity_id ?? null);
  }

  async function loadSession() {
    setLoading(true);
    try {
      const [currentUser] = await Promise.all([fetchCurrentUser(), refreshPublicData()]);
      setUser(currentUser);
      await refreshPrivateData(currentUser);
      setSessionReady(true);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load the app data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (sessionReady) {
      refreshPrivateData(user);
    }
  }, [sessionReady, user]);

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!authEmail || !authPassword) {
      toast.error('Enter your email and password');
      return;
    }

    if (authTab === 'signup' && authPassword !== authConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setAuthLoading(true);
    try {
      const nextUser =
        authTab === 'login'
          ? await signIn(authEmail, authPassword)
          : await signUp(authEmail, authPassword, selectedCharityId ?? undefined);

      setUser(nextUser);
      setIsAuthOpen(false);
      await loadSession();
      toast.success(authTab === 'login' ? 'Signed in successfully' : 'Account created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setUser(null);
      setScores([]);
      setSubscriptions([]);
      setSelectedCharityId(null);
      toast.success('Signed out');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out');
    }
  }

  async function handleSaveScore(event: React.FormEvent) {
    event.preventDefault();
    const score = Number(scoreValue);

    if (!Number.isFinite(score) || score < 1 || score > 45) {
      toast.error('Stableford score must be between 1 and 45');
      return;
    }

    setScoreLoading(true);
    try {
      await addScore(score, scoreDate);
      setScoreValue('');
      setScoreDate(new Date().toISOString().split('T')[0]);
      setIsScoreOpen(false);
      await refreshPrivateData(user);
      toast.success('Score saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save score');
    } finally {
      setScoreLoading(false);
    }
  }

  async function handleSelectCharity(charityId: string) {
    if (!user) {
      setAuthTab('signup');
      setIsAuthOpen(true);
      return;
    }

    setCharityLoading(charityId);
    try {
      await selectCharity(charityId);
      setSelectedCharityId(charityId);
      toast.success('Charity selected');
      await loadSession();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not select charity');
    } finally {
      setCharityLoading(null);
    }
  }

  async function handleSubscribe(planType: 'monthly' | 'yearly') {
    setSubscriptionLoading(planType);
    try {
      await createSubscription(planType);
      toast.success('Subscription started');
      await loadSession();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start subscription');
    } finally {
      setSubscriptionLoading(null);
    }
  }

  function openLogin() {
    setAuthTab('login');
    setIsAuthOpen(true);
  }

  function openSignup() {
    setAuthTab('signup');
    setIsAuthOpen(true);
  }

  const userDisplay = user?.email?.split('@')[0] ?? 'Guest';

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-slate-900">
      <Toaster position="top-right" richColors />

      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <Trophy size={22} />
            </div>
            <div className="text-left">
              <div className="text-lg font-black tracking-tight">Golf Charity</div>
              <div className="text-xs text-slate-500">Golf Performance Tracking</div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              How It Works
            </a>
            <a href="#charities" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              Charities
            </a>
            <a href="#draws" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              Draws
            </a>
            <a href="#dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
              Dashboard
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                    {initials(user.email)}
                  </div>
                  {userDisplay}
                </div>
                <button onClick={handleLogout} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={openLogin} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Log In
                </button>
                <button onClick={openSignup} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700">
                  Get Started
                </button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen((value) => !value)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
                  How It Works
                </a>
                <a href="#charities" onClick={() => setIsMenuOpen(false)}>
                  Charities
                </a>
                <a href="#draws" onClick={() => setIsMenuOpen(false)}>
                  Draws
                </a>
                <a href="#dashboard" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </a>
                <div className="mt-3 flex gap-3">
                  {user ? (
                    <button onClick={handleLogout} className="flex-1 rounded-full border border-slate-200 px-4 py-2 font-semibold">
                      Logout
                    </button>
                  ) : (
                    <>
                      <button onClick={openLogin} className="flex-1 rounded-full border border-slate-200 px-4 py-2 font-semibold">
                        Log In
                      </button>
                      <button onClick={openSignup} className="flex-1 rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white">
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.18),transparent_32%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                <Sparkles size={16} /> Live backend connected
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
                Better Golf.
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Bigger Impact.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Play golf, submit your scores, support real charities, and keep your session synced with the Next.js backend.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={user ? () => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }) : openSignup} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700">
                  {user ? 'Go to Dashboard' : 'Join Now'}
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => document.getElementById('charities')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Explore Charities
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative z-10">
              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-200">Welcome back</p>
                      <h2 className="mt-1 text-2xl font-black">{user ? user.email : 'Guest golfer'}</h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black">
                      {initials(user?.email)}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Scores</p>
                      <p className="mt-2 text-3xl font-black">{scores.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Charity</p>
                      <p className="mt-2 text-lg font-bold">{selectedCharity?.name || 'Not selected'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Subscription</p>
                      <p className="mt-2 text-lg font-bold">{latestSubscription?.plan_type || 'None'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Draws</p>
                      <p className="mt-2 text-lg font-bold">{draws.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">How it works</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">A live connection from golf score to charity impact.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <Icon size={20} />
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-sm font-bold text-emerald-600">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">{index + 1}</span>
                    {step.title}
                  </div>
                  <p className="mt-3 text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">Dashboard</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Your live account state</h2>
            </div>
            <button onClick={() => setIsScoreOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800">
              Add Score <Plus size={16} />
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading your session...</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">Score History</h3>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Last {scores.length} scores</div>
                </div>
                <div className="mt-5 space-y-3">
                  {scores.length > 0 ? (
                    scores.slice(0, 5).map((score) => (
                      <div key={score.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-900">Score {score.score}</p>
                          <p className="text-sm text-slate-500">{formatDate(score.date)}</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await deleteScore(score.id);
                              await refreshPrivateData(user);
                              toast.success('Score deleted');
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : 'Could not delete score');
                            }
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">No scores yet. Add your first score to unlock draw eligibility.</div>
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900">Subscription</h3>
                  <p className="mt-2 text-slate-600">
                    {latestSubscription ? `Active ${latestSubscription.plan_type} plan until ${formatDate(latestSubscription.subscription_end)}` : 'No active subscription'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleSubscribe('monthly')}
                      disabled={subscriptionLoading !== null}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {subscriptionLoading === 'monthly' ? 'Starting...' : 'Monthly Plan'}
                    </button>
                    <button
                      onClick={() => handleSubscribe('yearly')}
                      disabled={subscriptionLoading !== null}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
                    >
                      {subscriptionLoading === 'yearly' ? 'Starting...' : 'Yearly Plan'}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900">Selected Charity</h3>
                  <p className="mt-2 text-slate-600">{selectedCharity ? `${selectedCharity.name} - ${selectedCharity.description}` : 'No charity selected yet.'}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="charities" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">Charities</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Choose where the impact goes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {charities.map((charity, index) => {
              const isSelected = selectedCharityId === charity.id;
              return (
                <motion.div key={charity.id} whileHover={{ y: -4 }} className={`rounded-3xl border bg-white p-6 shadow-sm transition ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${charityGradients[index % charityGradients.length]} text-white`}>
                    <Heart size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-900">{charity.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{formatCurrency(charity.total_contributions)}</p>
                  <p className="mt-3 text-slate-600">{charity.description}</p>
                  <button
                    onClick={() => handleSelectCharity(charity.id)}
                    disabled={charityLoading !== null}
                    className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-bold transition ${isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {charityLoading === charity.id ? 'Saving...' : isSelected ? 'Selected' : 'Select Charity'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="draws" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">Draws</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Latest prize draw activity</h2>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">{draws.length} draws loaded</div>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            {draws.slice(0, 3).map((draw) => (
              <div key={draw.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">{draw.type}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">{formatDate(draw.draw_date)}</h3>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${draw.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {draw.status}
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Winning numbers</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draw.result?.numbers?.length ? draw.result.numbers.map((number) => (
                      <span key={number} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm">{number}</span>
                    )) : <span className="text-slate-500">Waiting for publication</span>}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                  <span>Winners: {draw.result?.winners_count ?? 0}</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-12 text-white shadow-2xl shadow-emerald-500/20">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">Next step</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight">Ready to make an impact?</h2>
                <p className="mt-3 max-w-2xl text-emerald-50">
                  Sign in, submit a score, choose a charity, and let the backend keep your session and donations in sync.
                </p>
              </div>
              <div className="flex gap-3">
                {user ? (
                  <button onClick={() => setIsScoreOpen(true)} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg">
                    Add Score
                  </button>
                ) : (
                  <>
                    <button onClick={openLogin} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg">
                      Log In
                    </button>
                    <button onClick={openSignup} className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
          <p>© 2026 Golf Charity. Connected frontend for the Next.js backend.</p>
          <div className="flex gap-6">
            <a href="#how-it-works" className="hover:text-white">
              How It Works
            </a>
            <a href="#charities" className="hover:text-white">
              Charities
            </a>
            <a href="#dashboard" className="hover:text-white">
              Dashboard
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isAuthOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAuthOpen(false)}>
            <motion.div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">Account</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{authTab === 'login' ? 'Welcome back' : 'Create your account'}</h3>
                </div>
                <button onClick={() => setIsAuthOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-sm font-bold">
                <button onClick={() => setAuthTab('login')} className={`rounded-full px-4 py-2 ${authTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  Login
                </button>
                <button onClick={() => setAuthTab('signup')} className={`rounded-full px-4 py-2 ${authTab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  Sign Up
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleAuthSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
                {authTab === 'signup' && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Choose Charity</label>
                    <select value={selectedCharityId ?? ''} onChange={(event) => setSelectedCharityId(event.target.value || null)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500">
                      <option value="">Select a charity</option>
                      {charities.map((charity) => (
                        <option key={charity.id} value={charity.id}>
                          {charity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    type="password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                    placeholder="********"
                  />
                </div>
                {authTab === 'signup' && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                    <input
                      value={authConfirmPassword}
                      onChange={(event) => setAuthConfirmPassword(event.target.value)}
                      type="password"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="********"
                    />
                  </div>
                )}

                <button disabled={authLoading} type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-60">
                  {authLoading ? 'Please wait...' : authTab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScoreOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScoreOpen(false)}>
            <motion.div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">Add Golf Score</h3>
                <button onClick={() => setIsScoreOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSaveScore}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Stableford Score</label>
                  <input
                    value={scoreValue}
                    onChange={(event) => setScoreValue(event.target.value)}
                    type="number"
                    min="1"
                    max="45"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                    placeholder="1 - 45"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                  <input value={scoreDate} onChange={(event) => setScoreDate(event.target.value)} type="date" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500" />
                </div>
                <button disabled={scoreLoading} type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
                  {scoreLoading ? 'Saving...' : 'Save Score'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}