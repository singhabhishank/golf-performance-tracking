import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  CreditCardIcon,
  CalendarIcon,
  HeartIcon,
  TrophyIcon } from
'lucide-react';
import { useAuth } from '../components/AuthContext';
import { fetchCharities, type CharityRow } from '../lib/charityService';
import { fetchNextDraw, type DrawRow } from '../lib/drawService';
import { fetchUserScores, type UserScore } from '../lib/scoreService';
import { fetchUserWinners, sumWinnings } from '../lib/winnerService';

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [scores, setScores] = useState<UserScore[]>([]);
  const [charities, setCharities] = useState<CharityRow[]>([]);
  const [nextDraw, setNextDraw] = useState<DrawRow | null>(null);
  const [winningsTotal, setWinningsTotal] = useState(0);
  const [latestWinLabel, setLatestWinLabel] = useState('—');

  const selectedCharity = useMemo(() => {
    if (!user?.charityId) return null;
    return charities.find((c) => c.id === user.charityId) ?? null;
  }, [charities, user?.charityId]);

  const contributionPercent = Math.max(10, Math.min(50, user?.charityPercent ?? 10));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [charityRows, drawRow] = await Promise.all([
          fetchCharities(),
          fetchNextDraw().catch(() => null),
        ]);
        if (cancelled) return;
        setCharities(charityRows);
        setNextDraw(drawRow);

        if (!user) {
          setScores([]);
          setWinningsTotal(0);
          setLatestWinLabel('—');
          return;
        }

        const [scoreRows, winnerRows] = await Promise.all([
          fetchUserScores(user.id),
          fetchUserWinners(user.id).catch(() => []),
        ]);
        if (cancelled) return;
        setScores(scoreRows.slice(0, 5));

        const total = sumWinnings(winnerRows);
        setWinningsTotal(total);

        const latest = winnerRows[0];
        if (latest) {
          const when = new Date(latest.created_at).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          });
          setLatestWinLabel(`${when} - ₹${Number(latest.prize_amount).toLocaleString('en-IN')}`);
        } else {
          setLatestWinLabel('—');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stats = [
    {
      icon: CreditCardIcon,
      title: 'Subscription Status',
      value: 'Not wired yet',
      subtitle: 'Stripe integration pending',
      detail: 'Next: connect Stripe + webhooks',
      color: 'emerald',
    },
    {
      icon: CalendarIcon,
      title: 'Next Draw',
      value: nextDraw ? new Date(nextDraw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
      subtitle: 'Status',
      detail: nextDraw ? nextDraw.status : 'No scheduled draw',
      color: 'blue',
    },
    {
      icon: HeartIcon,
      title: 'Selected Charity',
      value: selectedCharity?.name ?? 'Not selected',
      subtitle: 'Your Contribution',
      detail: `${contributionPercent}% of subscription`,
      color: 'pink',
    },
    {
      icon: TrophyIcon,
      title: 'Total Winnings',
      value: `₹${winningsTotal.toLocaleString('en-IN')}`,
      subtitle: 'Last Win',
      detail: latestWinLabel,
      color: 'amber',
    },
  ];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name ?? 'Golfer'}!
          </h1>
          <p className="text-slate-600 mb-8">
            Here's your golf lottery overview
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
                
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.subtitle}</p>
                <p className="text-sm font-medium text-emerald-600 mt-2">
                  {stat.detail}
                </p>
              </motion.div>);

          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scores */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Recent Scores
            </h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-slate-500 py-6 text-center">Loading...</p>
              ) : scores.length === 0 ? (
                <p className="text-slate-500 py-6 text-center">
                  No scores yet. Add your first score in the Scores tab.
                </p>
              ) : (
                scores.map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Stableford score
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(score.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {score.score}
                      </p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming Draw Summary */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 shadow-sm text-white">
            
            <h2 className="text-xl font-bold mb-4">Upcoming Draw</h2>
            <div className="space-y-4">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Draw Date</p>
                <p className="text-2xl font-bold">
                  {nextDraw
                    ? new Date(nextDraw.draw_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-emerald-100 text-sm mb-1">Prize Pool</p>
                <p className="text-3xl font-bold">TBD</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm mb-1">Your Entries</p>
                <p className="text-xl font-semibold">
                  {user ? `${scores.length} scores submitted` : 'Sign in to enter'}
                </p>
              </div>
              <div className="pt-4 border-t border-emerald-400">
                <p className="text-sm text-emerald-100">
                  {user
                    ? 'Keep your subscription active and keep submitting scores each month.'
                    : 'Sign in, subscribe, and submit scores to qualify for draws.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Winnings Overview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mt-6">
          
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Winnings Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-1">Lifetime Winnings</p>
              <p className="text-3xl font-bold text-slate-900">
                ₹{winningsTotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-1">
                Charity Contribution
              </p>
              <p className="text-3xl font-bold text-pink-600">TBD</p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>);

}