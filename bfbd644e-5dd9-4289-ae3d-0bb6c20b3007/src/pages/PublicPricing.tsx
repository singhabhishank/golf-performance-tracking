import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  TrophyIcon,
  HeartIcon,
  AwardIcon,
  HeadphonesIcon,
  SparklesIcon } from
'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
export function PublicPricing() {
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

  const featureIcons: Record<string, any> = {
    'Monthly draw entry': TrophyIcon,
    'Score tracking': TrophyIcon,
    'Charity selection': HeartIcon,
    'Winner verification': AwardIcon,
    'Priority support': HeadphonesIcon
  };
  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              duration: 0.6
            }}>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose a plan, enter draws, support charities, and win prizes
              every month.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => {
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
                    delay: 0.1 + index * 0.1
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
                      const Icon = featureIcons[feature] || CheckIcon;
                      return (
                        <li
                          key={feature}
                          className="flex items-center space-x-3">
                          
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </li>);

                    })}
                  </ul>
                  <Link
                    to="/signup"
                    className={`block w-full py-3 px-6 rounded-lg font-semibold transition text-center ${isYearly ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    
                    Get Started
                  </Link>
                </motion.div>);

            })}
          </div>

          {/* How it works */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mt-16">
            
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
              What's Included
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Monthly Draw Entry
                </h3>
                <p className="text-sm text-slate-600">
                  Automatically entered into every monthly draw as long as your
                  subscription is active and you've submitted scores.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Charity Contribution
                </h3>
                <p className="text-sm text-slate-600">
                  A minimum of 10% of your subscription goes directly to your
                  chosen charity. You can increase this at any time.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Score Tracking
                </h3>
                <p className="text-sm text-slate-600">
                  Track your last 5 Stableford scores. New scores automatically
                  replace the oldest, keeping you draw-ready.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Winner Verification
                </h3>
                <p className="text-sm text-slate-600">
                  Upload proof of your scores when you win. Our team verifies
                  and processes payouts within 5-7 business days.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Note */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            
            <p className="text-blue-900 font-semibold mb-2">
              Payment Integration Coming Soon
            </p>
            <p className="text-blue-700 text-sm">
              Stripe integration is currently being implemented. Payment
              processing will be available shortly.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>);

}