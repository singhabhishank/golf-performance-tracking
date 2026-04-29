import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  HeartIcon,
  CalendarIcon,
  SparklesIcon,
  TreesIcon,
  ArrowRightIcon } from
'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
export function Landing() {
  const features = [
  {
    icon: TrophyIcon,
    title: 'Enter Scores',
    description:
    'Submit your Stableford golf scores and automatically enter monthly draws.'
  },
  {
    icon: HeartIcon,
    title: 'Support Charities',
    description:
    'Choose a charity you care about and contribute a percentage of your subscription.'
  },
  {
    icon: CalendarIcon,
    title: 'Monthly Draw',
    description:
    'Win prizes every month based on your golf performance and luck.'
  },
  {
    icon: SparklesIcon,
    title: 'Win & Give Back',
    description:
    'Celebrate your wins while making a positive impact on the world.'
  }];

  const steps = [
  {
    number: '01',
    title: 'Sign Up & Subscribe',
    description:
    'Choose a monthly or yearly plan and select your favorite charity.'
  },
  {
    number: '02',
    title: 'Play Golf & Submit Scores',
    description:
    'Enter your Stableford scores after each round to qualify for draws.'
  },
  {
    number: '03',
    title: 'Win Prizes & Support Causes',
    description:
    'Get matched in monthly draws and help charities with every subscription.'
  }];

  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
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
            }}
            className="text-center">
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
              Play Golf. Support Charities.{' '}
              <span className="text-emerald-600">Win Big.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Enter your golf scores, choose a charity to support, and win
              monthly prizes while making a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl">
                
                Join Now
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white hover:bg-slate-50 text-emerald-600 border-2 border-emerald-600 rounded-lg font-semibold text-lg transition">
                
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
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
                    duration: 0.5,
                    delay: index * 0.1
                  }}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition">
                  
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* Featured Charity Spotlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              duration: 0.6
            }}
            className="text-center mb-12">
            
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Featured Charity
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every subscription makes a difference. See where your
              contributions go.
            </p>
          </motion.div>

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
              duration: 0.5,
              delay: 0.1
            }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-8 sm:p-12">
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TreesIcon className="w-10 h-10 text-green-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Green Earth Foundation
                  </h3>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full w-fit mx-auto md:mx-0">
                    Environment
                  </span>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  The Green Earth Foundation is dedicated to protecting our
                  planet's biodiversity through reforestation and wildlife
                  conservation programs. Over ₹12,00,000 contributed by
                  GolfLottery members so far.
                </p>
                <Link
                  to="/charities"
                  className="inline-flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-700 transition">
                  
                  <span>Explore all charities</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              duration: 0.6
            }}
            className="text-center mb-16">
            
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Three simple steps to start playing, winning, and giving back.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) =>
            <motion.div
              key={step.number}
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
                duration: 0.5,
                delay: index * 0.15
              }}
              className="bg-white p-8 rounded-xl shadow-sm">
              
                <div className="text-5xl font-bold text-emerald-600 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              duration: 0.6
            }}>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-emerald-50 mb-8">
              Join thousands of golfers making a difference while competing for
              amazing prizes.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-emerald-600 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl">
              
              Join Now
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>);

}