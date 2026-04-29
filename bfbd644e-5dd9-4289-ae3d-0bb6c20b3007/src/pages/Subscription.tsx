import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CheckIcon,
  TrophyIcon,
  HeartIcon,
  AwardIcon,
  HeadphonesIcon,
  SparklesIcon } from
'lucide-react';
type Plan = 'monthly' | 'yearly' | null;
import { useAuth } from '../components/AuthContext';
import { apiJson } from '../lib/apiClient';

export function Subscription() {
  const { user, refreshSubscription } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<Plan>(null);
  const [error, setError] = useState('');
  const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 499,
    interval: 'month',
    features: [
    '1 entry per month',
    'Choose your charity',
    'Track your scores',
    'Cancel anytime']

  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 4999,
    interval: 'year',
    features: [
    '12 entries per year',
    'Choose your charity',
    'Track your scores',
    'Save 16% compared to monthly',
    'Priority support'],

    popular: true
  }];

  const featureIcons = {
    'Monthly draw entry': TrophyIcon,
    'Score tracking': TrophyIcon,
    'Charity selection': HeartIcon,
    'Winner verification': AwardIcon,
    'Priority support': HeadphonesIcon
  };

  const startCheckout = async (planType: 'monthly' | 'yearly') => {
    setError('');
    setLoadingPlan(planType);
    try {
      const data = await apiJson<{ url: string }>('/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ planType, customerEmail: user?.email, userId: user?.id }),
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.id) return;
    setError('');
    setLoadingPlan('monthly');
    try {
      await apiJson<{ success: boolean }>('/stripe/cancel-subscription', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      await refreshSubscription();
      setCurrentPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Subscription Plans
          </h1>
          <p className="text-slate-600 mb-8">
            Choose the plan that works best for you
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentPlan &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.1
          }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border-2 border-emerald-200 p-6 mb-8">
          
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Current Subscription
                  </h2>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                      Active
                    </span>
                    <span className="text-slate-700 font-semibold">
                      {currentPlan === 'monthly' ?
                    'Monthly Plan' :
                    'Yearly Plan'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Renews on{' '}
                    <span className="font-semibold">June 15, 2025</span>
                  </p>
                  <p className="text-slate-600 text-sm">
                    Price:{' '}
                    <span className="font-semibold text-slate-900">
                      ₹{currentPlan === 'monthly' ? '499' : '4999'}/
                      {currentPlan}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => void cancelSubscription()}
                className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                Cancel Subscription
              </button>
            </div>
          </motion.div>
        }

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isYearly = plan.id === 'yearly';
            return (
              <motion.div
                key={plan.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.1
                }}
                className={`bg-white rounded-xl shadow-lg border-2 p-8 relative ${isYearly ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
                
                {plan.badge &&
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <SparklesIcon className="w-4 h-4" />
                      <span>{plan.badge}</span>
                    </div>
                  </div>
                }

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  {plan.savings &&
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                      {plan.savings}
                    </span>
                  }
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-slate-500">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => {
                    const Icon =
                    featureIcons[feature as keyof typeof featureIcons] ||
                    CheckIcon;
                    return (
                      <li key={feature} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>);

                  })}
                </ul>

                <button
                  onClick={() => {
                    setCurrentPlan(plan.id as Plan);
                    startCheckout(plan.id as 'monthly' | 'yearly');
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition ${isCurrentPlan ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : isYearly ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  
                  {loadingPlan === plan.id ? 'Redirecting...' : isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </button>
              </motion.div>);

          })}
        </div>

        {/* Payment Note */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.4
          }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          
          <p className="text-blue-900 font-semibold mb-2">
            Stripe Checkout Enabled (Local)
          </p>
          <p className="text-blue-700 text-sm">
            Start the API server with `npm run dev:api` then click Subscribe.
          </p>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </motion.div>
      </div>
    </DashboardLayout>);

}